import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {
  AuthResponseDto,
  MessageResponseDto,
  RefreshResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

@ApiTags('Authentication & RBAC')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Officer Authentication / Login',
    description:
      'Authenticates an officer using their official government email and secure password. ' +
      'Returns a signed short-lived JWT access token along with a revocable refresh token and sanitized user profile.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authentication successful. Returns JWT access and refresh tokens.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or inactive officer account.',
  })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<AuthResponseDto> {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'] as string;
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate and Refresh Access Token',
    description:
      'Accepts an existing refresh token, validates against cryptographic session hashes in the database, ' +
      'rotates the session, and issues a new access token and rotated refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Refresh token rotated successfully.',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid, expired, or revoked refresh token.',
  })
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<RefreshResponseDto> {
    const ipAddress = req.ip || (req.headers['x-forwarded-for'] as string);
    const userAgent = req.headers['user-agent'] as string;
    return this.authService.refreshToken(refreshTokenDto, ipAddress, userAgent);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Officer Logout / Invalidate Session',
    description:
      'Revokes active refresh sessions in the database for the authenticated officer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logged out successfully. Refresh session invalidated.',
    type: MessageResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT access token required.',
  })
  async logout(
    @CurrentUser('id') userId: string,
    @Body() logoutDto: LogoutDto,
  ): Promise<MessageResponseDto> {
    await this.authService.logout(userId, logoutDto?.refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Current Authenticated Officer Profile',
    description:
      'Returns the sanitized profile, assigned role, and organizational jurisdiction of the currently authenticated officer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current officer profile retrieved successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized. Valid JWT access token required.',
  })
  async getMe(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserResponseDto> {
    return this.authService.getMe(user.id);
  }
}
