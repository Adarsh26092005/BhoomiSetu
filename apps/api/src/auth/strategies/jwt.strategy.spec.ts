import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountType, UserRole } from '@prisma/client';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../database/prisma.service';
import { JwtAccessPayload } from '../interfaces/jwt-payload.interface';

describe('JwtStrategy (Unit)', () => {
  let strategy: JwtStrategy;
  let prismaService: any;
  let configService: ConfigService;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'superadmin@nlams.gov.in',
    fullName: 'Dev Super Administrator',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Principal Admin',
    organizationId: 'org-uuid-1',
    avatarUrl: null,
    isActive: true,
  };

  const mockPiaUser = {
    id: 'user-uuid-pia',
    email: 'liaison@nhai.gov.in',
    fullName: 'NHAI Liaison',
    accountType: AccountType.PIA_USER,
    role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
    designation: 'Liaison Lead',
    organizationId: 'org-pia-1',
    avatarUrl: null,
    isActive: true,
  };

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'user-uuid-1') {
            return Promise.resolve(mockUser);
          }
          if (where.id === 'user-uuid-pia') {
            return Promise.resolve(mockPiaUser);
          }
          if (where.id === 'inactive-user-id') {
            return Promise.resolve({ ...mockUser, id: 'inactive-user-id', isActive: false });
          }
          return Promise.resolve(null);
        }),
      },
    };

    configService = {
      get: jest.fn().mockReturnValue('test_jwt_access_secret'),
    } as unknown as ConfigService;

    strategy = new JwtStrategy(configService, prismaService as unknown as PrismaService);
  });

  it('should validate and return active user for valid access token payload with accountType', async () => {
    const payload: JwtAccessPayload = {
      sub: 'user-uuid-1',
      userId: 'user-uuid-1',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.SUPER_ADMIN,
      organizationId: 'org-uuid-1',
      tokenType: 'access',
    };

    const result = await strategy.validate(payload);
    expect(result).toBeDefined();
    expect(result.id).toBe('user-uuid-1');
    expect(result.accountType).toBe(AccountType.GOVERNMENT_OFFICER);
    expect(result.role).toBe(UserRole.SUPER_ADMIN);
    expect(result.organizationId).toBe('org-uuid-1');
    expect(result.isActive).toBe(true);
  });

  it('should validate and return PIA user for valid PIA token payload with AccountType.PIA_USER', async () => {
    const payload: JwtAccessPayload = {
      sub: 'user-uuid-pia',
      userId: 'user-uuid-pia',
      accountType: AccountType.PIA_USER,
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      organizationId: 'org-pia-1',
      tokenType: 'access',
    };

    const result = await strategy.validate(payload);
    expect(result).toBeDefined();
    expect(result.accountType).toBe(AccountType.PIA_USER);
    expect(result.role).toBe(UserRole.PROJECT_IMPLEMENTING_AGENCY);
  });

  it('should throw UnauthorizedException if tokenType is not "access"', async () => {
    const invalidPayload: any = {
      sub: 'user-uuid-1',
      userId: 'user-uuid-1',
      tokenType: 'refresh',
    };

    await expect(strategy.validate(invalidPayload)).rejects.toThrow(
      new UnauthorizedException('Invalid token type'),
    );
  });

  it('should throw UnauthorizedException if user does not exist in database', async () => {
    const nonExistentPayload: JwtAccessPayload = {
      sub: 'non-existent-user',
      userId: 'non-existent-user',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.VIEWER,
      organizationId: 'org-uuid-1',
      tokenType: 'access',
    };

    await expect(strategy.validate(nonExistentPayload)).rejects.toThrow(
      new UnauthorizedException('User does not exist'),
    );
  });

  it('should throw UnauthorizedException if user account is deactivated', async () => {
    const inactivePayload: JwtAccessPayload = {
      sub: 'inactive-user-id',
      userId: 'inactive-user-id',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.SUPER_ADMIN,
      organizationId: 'org-uuid-1',
      tokenType: 'access',
    };

    await expect(strategy.validate(inactivePayload)).rejects.toThrow(
      new UnauthorizedException('User account is deactivated'),
    );
  });
});
