import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AccountType, OrganizationStatus, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { LoginDto, LoginPortalType } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AuthResponseDto,
  RefreshResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto';
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from './interfaces/jwt-payload.interface';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiration: string;
  private readonly refreshExpiration: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.accessSecret =
      this.configService.get<string>('jwt.accessSecret') ||
      'nlams_default_access_secret_dev_only';
    this.refreshSecret =
      this.configService.get<string>('jwt.refreshSecret') ||
      'nlams_default_refresh_secret_dev_only';
    this.accessExpiration =
      this.configService.get<string>('jwt.accessExpiration') || '15m';
    this.refreshExpiration =
      this.configService.get<string>('jwt.refreshExpiration') || '7d';
  }

  // ============================================================================
  // PASSWORD UTILITIES
  // ============================================================================

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseDurationToMs(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7d
    const val = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return val * 1000;
      case 'm':
        return val * 60 * 1000;
      case 'h':
        return val * 60 * 60 * 1000;
      case 'd':
        return val * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  // ============================================================================
  // AUTHENTICATION FLOWS
  // ============================================================================

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponseDto> {
    const email = loginDto.email.trim().toLowerCase();

    // 1. User lookup
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // 2. Generic authentication error for security (prevent user enumeration)
    if (!user) {
      this.logger.warn(`Failed login attempt for non-existent email: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 3. Password comparison
    const isPasswordValid = await this.comparePasswords(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt (bad password) for user: ${email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    // 4. Inactive user check
    if (!user.isActive) {
      this.logger.warn(`Login rejected for inactive user: ${email}`);
      throw new UnauthorizedException(
        'Account is deactivated. Please contact your system administrator.',
      );
    }

    // 5. Portal Category Separation Check (Step 19A Identity Separation)
    if (loginDto.loginType) {
      if (loginDto.loginType === LoginPortalType.OFFICER) {
        if (
          user.accountType !== AccountType.GOVERNMENT_OFFICER ||
          user.role === UserRole.SUPER_ADMIN
        ) {
          this.logger.warn(
            `Portal mismatch: User ${email} (AccountType: ${user.accountType}, Role: ${user.role}) attempted Government Officer portal login.`,
          );
          throw new UnauthorizedException('Invalid credentials for the Government Officer portal');
        }
      } else if (loginDto.loginType === LoginPortalType.AGENCY) {
        if (
          user.accountType !== AccountType.PIA_USER ||
          user.role === UserRole.SUPER_ADMIN
        ) {
          this.logger.warn(
            `Portal mismatch: User ${email} (AccountType: ${user.accountType}, Role: ${user.role}) attempted Agency / PIA portal login.`,
          );
          throw new UnauthorizedException('Invalid credentials for the Agency / PIA portal');
        }
      } else if (loginDto.loginType === LoginPortalType.ADMIN) {
        if (user.role !== UserRole.SUPER_ADMIN) {
          this.logger.warn(
            `Portal mismatch: User ${email} (Role: ${user.role}) attempted Super Admin portal login.`,
          );
          throw new UnauthorizedException('Invalid credentials for the Super Admin portal');
        }
      }
    }

    // 6. Organization Status Check (if associated)
    if (user.organizationId) {
      const org = await this.prisma.organization.findUnique({
        where: { id: user.organizationId },
      });
      if (org) {
        if (org.status === OrganizationStatus.PENDING_APPROVAL) {
          this.logger.warn(`Login rejected: organization pending approval (${org.name}) for user: ${email}`);
          throw new UnauthorizedException(
            'Your organization registration is currently pending administrative approval.',
          );
        }
        if (org.status === OrganizationStatus.SUSPENDED) {
          this.logger.warn(`Login rejected: organization suspended (${org.name}) for user: ${email}`);
          throw new UnauthorizedException('Your organization account has been suspended.');
        }
        if (org.status === OrganizationStatus.REJECTED) {
          this.logger.warn(`Login rejected: organization rejected (${org.name}) for user: ${email}`);
          throw new UnauthorizedException('Your organization registration was rejected.');
        }
      }
    }

    // 7. Create refresh session and issue tokens
    const sessionId = crypto.randomUUID();
    const refreshToken = await this.generateRefreshToken(user.id, sessionId);
    const tokenHash = this.hashToken(refreshToken);
    const refreshDurationMs = this.parseDurationToMs(this.refreshExpiration);
    const expiresAt = new Date(Date.now() + refreshDurationMs);

    await this.prisma.authSession.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt,
      },
    });

    // 8. Update user's last login timestamp
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = await this.generateAccessToken(user);

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiration,
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RefreshResponseDto> {
    const rawRefreshToken = refreshTokenDto.refreshToken;

    // 1. Verify JWT signature of refresh token
    let payload: JwtRefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
        rawRefreshToken,
        {
          secret: this.refreshSecret,
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.tokenType !== 'refresh' || !payload.sessionId) {
      throw new UnauthorizedException('Invalid refresh token structure');
    }

    // 2. Lookup AuthSession in database
    const session = await this.prisma.authSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found or has expired');
    }

    // 3. Security: Check if token was already revoked (Reuse Detection)
    if (session.revokedAt) {
      this.logger.warn(
        `Revoked refresh token reuse detected for session: ${session.id}, user: ${session.userId}. Revoking all sessions for user.`,
      );
      // Revoke all active sessions for this user as a safety measure against token theft
      await this.prisma.authSession.updateMany({
        where: { userId: session.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException(
        'Refresh token has been revoked. All active sessions invalidated for security.',
      );
    }

    // 4. Check session expiration
    if (new Date() > session.expiresAt) {
      throw new UnauthorizedException('Refresh session has expired');
    }

    // 5. Verify cryptographic hash of presented token
    const presentedHash = this.hashToken(rawRefreshToken);
    if (session.tokenHash !== presentedHash) {
      throw new UnauthorizedException('Invalid refresh token hash');
    }

    // 6. Verify user active status
    if (!session.user || !session.user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    // 7. Token Rotation: Revoke current session
    await this.prisma.authSession.update({
      where: { id: session.id },
      data: { revokedAt: new Date() },
    });

    // 8. Create new session with rotated refresh token
    const newSessionId = crypto.randomUUID();
    const newRefreshToken = await this.generateRefreshToken(
      session.user.id,
      newSessionId,
    );
    const newTokenHash = this.hashToken(newRefreshToken);
    const refreshDurationMs = this.parseDurationToMs(this.refreshExpiration);
    const expiresAt = new Date(Date.now() + refreshDurationMs);

    await this.prisma.authSession.create({
      data: {
        id: newSessionId,
        userId: session.user.id,
        tokenHash: newTokenHash,
        ipAddress: ipAddress || session.ipAddress,
        userAgent: userAgent || session.userAgent,
        expiresAt,
      },
    });

    const accessToken = await this.generateAccessToken(session.user);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.accessExpiration,
    };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<JwtRefreshPayload>(
          refreshToken,
          { secret: this.refreshSecret },
        );
        if (payload.sessionId) {
          await this.prisma.authSession.updateMany({
            where: { id: payload.sessionId, userId },
            data: { revokedAt: new Date() },
          });
          return;
        }
      } catch {
        // Fallback to revoking all active sessions for the user
      }
    }

    // Revoke all active sessions for this user
    await this.prisma.authSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string): Promise<UserResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return this.sanitizeUser(user);
  }

  // ============================================================================
  // TOKEN GENERATION & USER SANITIZATION
  // ============================================================================

  async generateAccessToken(user: {
    id: string;
    accountType?: any;
    role: any;
    organizationId: string;
  }): Promise<string> {
    const payload: JwtAccessPayload = {
      sub: user.id,
      userId: user.id,
      accountType: user.accountType || 'GOVERNMENT_OFFICER',
      role: user.role,
      organizationId: user.organizationId,
      tokenType: 'access',
    };

    return this.jwtService.signAsync(payload as Record<string, any>, {
      secret: this.accessSecret,
      expiresIn: this.accessExpiration as any,
    });
  }

  async generateRefreshToken(userId: string, sessionId: string): Promise<string> {
    const payload: JwtRefreshPayload = {
      sub: userId,
      userId,
      sessionId,
      tokenType: 'refresh',
    };

    return this.jwtService.signAsync(payload as Record<string, any>, {
      secret: this.refreshSecret,
      expiresIn: this.refreshExpiration as any,
    });
  }

  sanitizeUser(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      accountType: user.accountType || 'GOVERNMENT_OFFICER',
      role: user.role,
      designation: user.designation,
      organizationId: user.organizationId,
      avatarUrl: user.avatarUrl || null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
