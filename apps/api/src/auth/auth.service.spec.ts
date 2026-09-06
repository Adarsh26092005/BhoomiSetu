import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';
import { AccountType, UserRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { LoginPortalType } from './dto/login.dto';

describe('AuthService (Unit)', () => {
  let authService: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'superadmin@nlams.gov.in',
    passwordHash: '', // populated in beforeAll
    fullName: 'Dev Super Administrator',
    phone: '+91-9876543210',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Principal Admin',
    organizationId: 'org-uuid-1',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
  };

  const mockOfficerUser = {
    id: 'user-uuid-officer-1',
    email: 'ananya.rao@nlams.gov.in',
    passwordHash: '',
    fullName: 'Ananya Rao',
    phone: '+91-9845012233',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.LAND_ACQUISITION_OFFICER,
    designation: 'Special Land Acquisition Officer',
    organizationId: 'org-gov-uuid-1',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
  };

  const mockPiaUser = {
    id: 'user-uuid-pia-1',
    email: 'liaison@nhai.gov.in',
    passwordHash: '',
    fullName: 'NHAI Project Liaison Officer',
    phone: '+91-9123456780',
    accountType: AccountType.PIA_USER,
    role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
    designation: 'Chief Concessionaire Lead',
    organizationId: 'org-pia-uuid-1',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
  };

  const mockInactiveUser = {
    ...mockUser,
    id: 'user-uuid-2',
    email: 'inactive@nlams.gov.in',
    isActive: false,
  };

  beforeAll(async () => {
    // Generate valid bcrypt hash
    const bcrypt = await import('bcrypt');
    mockUser.passwordHash = await bcrypt.hash('CorrectPassword123!', 12);
    mockOfficerUser.passwordHash = await bcrypt.hash('OfficerPassword123!', 12);
    mockPiaUser.passwordHash = await bcrypt.hash('PiaSecurePassword123!', 12);
    mockInactiveUser.passwordHash = mockUser.passwordHash;
  });

  beforeEach(async () => {
    const sessionsMap = new Map<string, any>();

    prismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.email === 'superadmin@nlams.gov.in' || where.id === 'user-uuid-1') {
            return Promise.resolve(mockUser);
          }
          if (where.email === 'ananya.rao@nlams.gov.in' || where.id === 'user-uuid-officer-1') {
            return Promise.resolve(mockOfficerUser);
          }
          if (where.email === 'liaison@nhai.gov.in' || where.id === 'user-uuid-pia-1') {
            return Promise.resolve(mockPiaUser);
          }
          if (where.email === 'inactive@nlams.gov.in' || where.id === 'user-uuid-2') {
            return Promise.resolve(mockInactiveUser);
          }
          return Promise.resolve(null);
        }),
        update: jest.fn().mockResolvedValue(mockUser),
      },
      organization: {
        findUnique: jest.fn().mockResolvedValue({ id: 'org-1', name: 'Test Org', status: 'ACTIVE' }),
      },
      authSession: {
        create: jest.fn().mockImplementation(({ data }) => {
          sessionsMap.set(data.id, { ...data, createdAt: new Date(), updatedAt: new Date(), revokedAt: null });
          return Promise.resolve(data);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const session = sessionsMap.get(where.id);
          if (!session) return Promise.resolve(null);
          return Promise.resolve({
            ...session,
            user: session.userId === 'user-uuid-1' ? mockUser : mockInactiveUser,
          });
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const session = sessionsMap.get(where.id);
          if (session) {
            Object.assign(session, data);
          }
          return Promise.resolve(session);
        }),
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          sessionsMap.forEach((session) => {
            if (where.userId && session.userId === where.userId) {
              Object.assign(session, data);
              count++;
            }
          });
          return Promise.resolve({ count });
        }),
      },
    };

    jwtService = {
      signAsync: jest.fn().mockImplementation((payload) => {
        return Promise.resolve(`jwt_mock_token_${payload.tokenType}_${payload.userId || payload.sub}`);
      }),
      verifyAsync: jest.fn().mockImplementation((token) => {
        if (token.includes('invalid')) {
          return Promise.reject(new Error('Invalid token'));
        }
        return Promise.resolve({
          sub: 'user-uuid-1',
          userId: 'user-uuid-1',
          sessionId: 'session-uuid-1',
          tokenType: 'refresh',
        });
      }),
    };

    const configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'jwt.accessSecret') return 'test_access_secret';
        if (key === 'jwt.refreshSecret') return 'test_refresh_secret';
        if (key === 'jwt.accessExpiration') return '15m';
        if (key === 'jwt.refreshExpiration') return '7d';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('Password Hashing & Verification', () => {
    it('should hash and compare passwords correctly with 12 bcrypt rounds', async () => {
      const password = 'SecurePassword2026!';
      const hash = await authService.hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toEqual(password);
      expect(hash.startsWith('$2b$12$') || hash.startsWith('$2a$12$')).toBe(true);

      const isValid = await authService.comparePasswords(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await authService.comparePasswords('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Login Flow', () => {
    it('1. Successful login should return sanitized user and tokens (never leak passwordHash)', async () => {
      const result = await authService.login({
        email: 'superadmin@nlams.gov.in',
        password: 'CorrectPassword123!',
      });

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe('15m');
      expect(result.user).toBeDefined();
      expect(result.user.id).toBe('user-uuid-1');
      expect(result.user.email).toBe('superadmin@nlams.gov.in');
      expect(result.user.role).toBe(UserRole.SUPER_ADMIN);
      expect(result.user.organizationId).toBe('org-uuid-1');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('2. Login with invalid password should throw 401 Unauthorized ("Invalid credentials")', async () => {
      await expect(
        authService.login({
          email: 'superadmin@nlams.gov.in', 
          password: 'IncorrectPassword',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('3. Login with unknown email should throw 401 Unauthorized ("Invalid credentials")', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@nlams.gov.in',
          password: 'SomePassword123!',
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('4. Login with inactive user should throw 401 Unauthorized with account deactivation notice', async () => {
      await expect(
        authService.login({
          email: 'inactive@nlams.gov.in',
          password: 'CorrectPassword123!',
        }),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Account is deactivated. Please contact your system administrator.',
        ),
      );
    });

    it('5. Successful login for PIA User should return sanitized PIA profile with AccountType.PIA_USER', async () => {
      const result = await authService.login({
        email: 'liaison@nhai.gov.in',
        password: 'PiaSecurePassword123!',
      });

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.accountType).toBe(AccountType.PIA_USER);
      expect(result.user.role).toBe(UserRole.PROJECT_IMPLEMENTING_AGENCY);
      expect(result.user.organizationId).toBe('org-pia-uuid-1');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('6. Officer Portal: Government Officer succeeds, but PIA and SuperAdmin are rejected', async () => {
      // Valid Government Officer succeeds
      const officerRes = await authService.login({
        email: 'ananya.rao@nlams.gov.in',
        password: 'OfficerPassword123!',
        loginType: LoginPortalType.OFFICER,
      });
      expect(officerRes.user.accountType).toBe(AccountType.GOVERNMENT_OFFICER);
      expect(officerRes.user.role).toBe(UserRole.LAND_ACQUISITION_OFFICER);

      // PIA User rejected on Officer portal
      await expect(
        authService.login({
          email: 'liaison@nhai.gov.in',
          password: 'PiaSecurePassword123!',
          loginType: LoginPortalType.OFFICER,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials for the Government Officer portal'));

      // Super Admin rejected on Officer portal
      await expect(
        authService.login({
          email: 'superadmin@nlams.gov.in',
          password: 'CorrectPassword123!',
          loginType: LoginPortalType.OFFICER,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials for the Government Officer portal'));
    });

    it('7. Agency / PIA Portal: PIA User succeeds, but Government Officer and SuperAdmin are rejected', async () => {
      // Valid PIA User succeeds
      const piaRes = await authService.login({
        email: 'liaison@nhai.gov.in',
        password: 'PiaSecurePassword123!',
        loginType: LoginPortalType.AGENCY,
      });
      expect(piaRes.user.accountType).toBe(AccountType.PIA_USER);

      // Government Officer rejected on Agency portal
      await expect(
        authService.login({
          email: 'ananya.rao@nlams.gov.in',
          password: 'OfficerPassword123!',
          loginType: LoginPortalType.AGENCY,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials for the Agency / PIA portal'));

      // Super Admin rejected on Agency portal
      await expect(
        authService.login({
          email: 'superadmin@nlams.gov.in',
          password: 'CorrectPassword123!',
          loginType: LoginPortalType.AGENCY,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials for the Agency / PIA portal'));
    });

    it('8. Super Admin Portal: Super Admin succeeds, but PIA and Government Officer are rejected', async () => {
      // Valid Super Admin succeeds
      const adminRes = await authService.login({
        email: 'superadmin@nlams.gov.in',
        password: 'CorrectPassword123!',
        loginType: LoginPortalType.ADMIN,
      });
      expect(adminRes.user.role).toBe(UserRole.SUPER_ADMIN);

      // PIA rejected on Admin portal
      await expect(
        authService.login({
          email: 'liaison@nhai.gov.in',
          password: 'PiaSecurePassword123!',
          loginType: LoginPortalType.ADMIN,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials for the Super Admin portal'));

      // Government Officer rejected on Admin portal
      await expect(
        authService.login({
          email: 'ananya.rao@nlams.gov.in',
          password: 'OfficerPassword123!',
          loginType: LoginPortalType.ADMIN,
        }),
      ).rejects.toThrow(new UnauthorizedException('Invalid credentials for the Super Admin portal'));
    });
  });

  describe('Refresh & Revocation Flow', () => {
    it('8. Refresh token should rotate session and issue new tokens', async () => {
      // First login to establish session
      const loginRes = await authService.login({
        email: 'superadmin@nlams.gov.in',
        password: 'CorrectPassword123!',
      });

      // Mock verify to return the created session
      const createCall = prismaService.authSession.create.mock.calls[0][0].data;
      jwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-uuid-1',
        userId: 'user-uuid-1',
        sessionId: createCall.id,
        tokenType: 'refresh',
      });

      const refreshRes = await authService.refreshToken({
        refreshToken: loginRes.refreshToken,
      });

      expect(refreshRes).toBeDefined();
      expect(refreshRes.accessToken).toBeDefined();
      expect(refreshRes.refreshToken).toBeDefined();
      expect(refreshRes.expiresIn).toBe('15m');
    });

    it('10. Revoked refresh token reuse should trigger rejection', async () => {
      // Create revoked session
      const revokedSessionId = 'revoked-session-1';
      await prismaService.authSession.create({
        data: {
          id: revokedSessionId,
          userId: 'user-uuid-1',
          tokenHash: 'some_hash',
          expiresAt: new Date(Date.now() + 100000),
          revokedAt: new Date(),
        },
      });

      jwtService.verifyAsync.mockResolvedValueOnce({
        sub: 'user-uuid-1',
        userId: 'user-uuid-1',
        sessionId: revokedSessionId,
        tokenType: 'refresh',
      });

      await expect(
        authService.refreshToken({
          refreshToken: 'revoked_token',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('11. Logout should revoke active refresh sessions', async () => {
      await authService.logout('user-uuid-1');
      expect(prismaService.authSession.updateMany).toHaveBeenCalled();
    });
  });

  describe('Current User Profile (Me)', () => {
    it('12. getMe should return sanitized officer profile', async () => {
      const me = await authService.getMe('user-uuid-1');
      expect(me).toBeDefined();
      expect(me.email).toBe('superadmin@nlams.gov.in');
      expect(me.role).toBe(UserRole.SUPER_ADMIN);
      expect((me as any).passwordHash).toBeUndefined();
    });

    it('getMe should throw NotFoundException if user not found', async () => {
      await expect(authService.getMe('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
