import { Test, TestingModule } from '@nestjs/testing';
import { AccountType, UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';

describe('AuthController (Unit)', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUserResponse = {
    id: 'user-uuid-1',
    email: 'superadmin@nlams.gov.in',
    fullName: 'Dev Super Administrator',
    phone: '+91-9876543210',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Principal Admin',
    organizationId: 'org-uuid-1',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: new Date('2026-09-04'),
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
  };

  const mockAuthResponse = {
    user: mockUserResponse,
    accessToken: 'mock_jwt_access_token',
    refreshToken: 'mock_jwt_refresh_token',
    expiresIn: '15m',
  };

  const mockRefreshResponse = {
    accessToken: 'mock_new_access_token',
    refreshToken: 'mock_new_refresh_token',
    expiresIn: '15m',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(mockAuthResponse),
            refreshToken: jest.fn().mockResolvedValue(mockRefreshResponse),
            logout: jest.fn().mockResolvedValue(undefined),
            getMe: jest.fn().mockResolvedValue(mockUserResponse),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/login', () => {
    it('should invoke authService.login with IP and user-agent metadata', async () => {
      const loginDto: LoginDto = {
        email: 'superadmin@nlams.gov.in',
        password: 'Password123!',
      };
      const req: any = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'JestTestRunner/1.0' },
      };

      const result = await controller.login(loginDto, req);

      expect(result).toEqual(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(
        loginDto,
        '127.0.0.1',
        'JestTestRunner/1.0',
      );
    });
  });

  describe('POST /auth/refresh', () => {
    it('should invoke authService.refreshToken and return rotated tokens', async () => {
      const refreshDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };
      const req: any = {
        ip: '127.0.0.1',
        headers: { 'user-agent': 'JestTestRunner/1.0' },
      };

      const result = await controller.refresh(refreshDto, req);

      expect(result).toEqual(mockRefreshResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        refreshDto,
        '127.0.0.1',
        'JestTestRunner/1.0',
      );
    });
  });

  describe('POST /auth/logout', () => {
    it('should invoke authService.logout and return confirmation message', async () => {
      const logoutDto: LogoutDto = {
        refreshToken: 'optional_refresh_token',
      };

      const result = await controller.logout('user-uuid-1', logoutDto);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(authService.logout).toHaveBeenCalledWith(
        'user-uuid-1',
        'optional_refresh_token',
      );
    });
  });

  describe('GET /auth/me', () => {
    it('should invoke authService.getMe with current user ID', async () => {
      const authUser: AuthenticatedUser = {
        id: 'user-uuid-1',
        email: 'superadmin@nlams.gov.in',
        fullName: 'Dev Super Administrator',
        accountType: AccountType.GOVERNMENT_OFFICER,
        role: UserRole.SUPER_ADMIN,
        designation: 'Principal Admin',
        organizationId: 'org-uuid-1',
        isActive: true,
      };

      const result = await controller.getMe(authUser);

      expect(result).toEqual(mockUserResponse);
      expect(authService.getMe).toHaveBeenCalledWith('user-uuid-1');
    });
  });
});
