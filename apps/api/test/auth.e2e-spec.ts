import { Controller, Get, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AccountType, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { CurrentUser } from '../src/auth/decorators/current-user.decorator';
import { Roles } from '../src/auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../src/auth/interfaces/jwt-payload.interface';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';

@Controller('test-rbac')
class TestRbacController {
  @Get('superadmin-only')
  @Roles(UserRole.SUPER_ADMIN)
  getSuperAdminData(@CurrentUser() user: AuthenticatedUser) {
    return { success: true, message: 'Super Admin Access Granted', user };
  }

  @Get('central-only')
  @Roles(UserRole.CENTRAL_OFFICER)
  getCentralData(@CurrentUser() user: AuthenticatedUser) {
    return { success: true, message: 'Central Officer Access Granted', user };
  }
}

describe('Authentication, Authorization & RBAC (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let superadminPasswordHash: string;
  let viewerPasswordHash: string;
  let officerPasswordHash: string;
  let piaPasswordHash: string;

  const usersDb = new Map<string, any>();
  const sessionsDb = new Map<string, any>();

  beforeAll(async () => {
    superadminPasswordHash = await bcrypt.hash('SuperAdmin@2026!', 12);
    viewerPasswordHash = await bcrypt.hash('ViewerPass@2026!', 12);
    officerPasswordHash = await bcrypt.hash('OfficerPass@2026!', 12);
    piaPasswordHash = await bcrypt.hash('PiaPass@2026!', 12);

    const superAdminUser = {
      id: 'usr-superadmin-001',
      email: 'superadmin@nlams.gov.in',
      passwordHash: superadminPasswordHash,
      fullName: 'Dr. Rajesh Sharma',
      phone: '+91-9876543210',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.SUPER_ADMIN,
      designation: 'Chief Administrator',
      organizationId: 'org-central-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };

    const officerUser = {
      id: 'usr-officer-001',
      email: 'ananya.rao@nlams.gov.in',
      passwordHash: officerPasswordHash,
      fullName: 'Ananya Rao',
      phone: '+91-9845012233',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.LAND_ACQUISITION_OFFICER,
      designation: 'Special Land Acquisition Officer',
      organizationId: 'org-dist-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };

    const piaUser = {
      id: 'usr-pia-001',
      email: 'liaison@nhai.gov.in',
      passwordHash: piaPasswordHash,
      fullName: 'Vikramaditya Patil',
      phone: '+91-9876543299',
      accountType: AccountType.PIA_USER,
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      designation: 'Chief Project Manager',
      organizationId: 'org-pia-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };

    const viewerUser = {
      id: 'usr-viewer-002',
      email: 'viewer@nlams.gov.in',
      passwordHash: viewerPasswordHash,
      fullName: 'Vikram Mehta',
      phone: '+91-9876543211',
      role: UserRole.VIEWER,
      designation: 'Independent Auditor',
      organizationId: 'org-central-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };

    const inactiveUser = {
      id: 'usr-inactive-003',
      email: 'inactive@nlams.gov.in',
      passwordHash: viewerPasswordHash,
      fullName: 'Deactivated User',
      phone: '+91-9876543212',
      role: UserRole.VIEWER,
      designation: 'Former Staff',
      organizationId: 'org-central-001',
      avatarUrl: null,
      isActive: false,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };

    usersDb.set(superAdminUser.email, superAdminUser);
    usersDb.set(superAdminUser.id, superAdminUser);
    usersDb.set(officerUser.email, officerUser);
    usersDb.set(officerUser.id, officerUser);
    usersDb.set(piaUser.email, piaUser);
    usersDb.set(piaUser.id, piaUser);
    usersDb.set(viewerUser.email, viewerUser);
    usersDb.set(viewerUser.id, viewerUser);
    usersDb.set(inactiveUser.email, inactiveUser);
    usersDb.set(inactiveUser.id, inactiveUser);

    const mockPrismaService = {
      organization: {
        findUnique: jest.fn().mockResolvedValue({ id: 'org-central-001', name: 'Ministry', status: 'ACTIVE' }),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'org-new-001', ...data })),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-001' }),
      },
      $transaction: jest.fn((cb) => cb(mockPrismaService)),
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.email) return Promise.resolve(usersDb.get(where.email) || null);
          if (where.id) return Promise.resolve(usersDb.get(where.id) || null);
          return Promise.resolve(null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const user = usersDb.get(where.id) || usersDb.get(where.email);
          if (user) Object.assign(user, data);
          return Promise.resolve(user);
        }),
      },
      authSession: {
        create: jest.fn().mockImplementation(({ data }) => {
          const session = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            revokedAt: null,
          };
          sessionsDb.set(data.id, session);
          return Promise.resolve(session);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const session = sessionsDb.get(where.id);
          if (!session) return Promise.resolve(null);
          const user = usersDb.get(session.userId);
          return Promise.resolve({
            ...session,
            user,
          });
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const session = sessionsDb.get(where.id);
          if (session) Object.assign(session, data);
          return Promise.resolve(session);
        }),
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          sessionsDb.forEach((session) => {
            if (where.userId && session.userId === where.userId) {
              Object.assign(session, data);
              count++;
            }
          });
          return Promise.resolve({ count });
        }),
      },
      $connect: jest.fn().mockResolvedValue(undefined),
      $disconnect: jest.fn().mockResolvedValue(undefined),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [TestRbacController],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  let superAdminAccessToken: string;
  let superAdminRefreshToken: string;
  let viewerAccessToken: string;

  // ============================================================================
  // 1. PUBLIC ENDPOINTS & GUARDS
  // ============================================================================

  it('16. GET /api/v1/health should remain publicly accessible without JWT token', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('5. GET /api/v1/auth/me without JWT token should be rejected with 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  it('7. GET /api/v1/auth/me with invalid JWT token should be rejected with 401 Unauthorized', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid.token.payload')
      .expect(401);
    expect(res.body.statusCode).toBe(401);
  });

  // ============================================================================
  // 2. LOGIN FLOW
  // ============================================================================

  it('1. POST /api/v1/auth/login - successful login returns access & refresh tokens and sanitized user', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@nlams.gov.in',
        password: 'SuperAdmin@2026!',
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.expiresIn).toBe('15m');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('superadmin@nlams.gov.in');
    expect(res.body.user.role).toBe(UserRole.SUPER_ADMIN);
    expect(res.body.user.organizationId).toBe('org-central-001');

    // 15. PasswordHash must NEVER be returned in response
    expect(res.body.user.passwordHash).toBeUndefined();

    superAdminAccessToken = res.body.accessToken;
    superAdminRefreshToken = res.body.refreshToken;
  });

  it('2. POST /api/v1/auth/login with wrong password returns 401 "Invalid credentials"', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@nlams.gov.in',
        password: 'WrongPassword!',
      })
      .expect(401);

    expect(res.body.message).toBe('Invalid credentials');
  });

  it('3. POST /api/v1/auth/login with non-existent email returns 401 "Invalid credentials"', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'nonexistent@nlams.gov.in',
        password: 'SomePassword123!',
      })
      .expect(401);

    expect(res.body.message).toBe('Invalid credentials');
  });

  it('4. POST /api/v1/auth/login for deactivated user returns 401 deactivation error', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'inactive@nlams.gov.in',
        password: 'ViewerPass@2026!',
      })
      .expect(401);

    expect(res.body.message).toContain('deactivated');
  });

  it('4a. Officer Portal Login (loginType=OFFICER): Officer succeeds; PIA and Super Admin rejected', async () => {
    // 1. Valid Officer succeeds
    const officerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'ananya.rao@nlams.gov.in',
        password: 'OfficerPass@2026!',
        loginType: 'OFFICER',
      })
      .expect(200);
    expect(officerRes.body.user.accountType).toBe(AccountType.GOVERNMENT_OFFICER);

    // 2. PIA User rejected
    const piaRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'liaison@nhai.gov.in',
        password: 'PiaPass@2026!',
        loginType: 'OFFICER',
      })
      .expect(401);
    expect(piaRes.body.message).toContain('Government Officer portal');

    // 3. Super Admin rejected
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@nlams.gov.in',
        password: 'SuperAdmin@2026!',
        loginType: 'OFFICER',
      })
      .expect(401);
    expect(adminRes.body.message).toContain('Government Officer portal');
  });

  it('4b. Agency / PIA Portal Login (loginType=AGENCY): PIA succeeds; Officer and Super Admin rejected', async () => {
    // 1. Valid PIA User succeeds
    const piaRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'liaison@nhai.gov.in',
        password: 'PiaPass@2026!',
        loginType: 'AGENCY',
      })
      .expect(200);
    expect(piaRes.body.user.accountType).toBe(AccountType.PIA_USER);

    // 2. Government Officer rejected
    const officerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'ananya.rao@nlams.gov.in',
        password: 'OfficerPass@2026!',
        loginType: 'AGENCY',
      })
      .expect(401);
    expect(officerRes.body.message).toContain('Agency / PIA portal');

    // 3. Super Admin rejected
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@nlams.gov.in',
        password: 'SuperAdmin@2026!',
        loginType: 'AGENCY',
      })
      .expect(401);
    expect(adminRes.body.message).toContain('Agency / PIA portal');
  });

  it('4c. Super Admin Portal Login (loginType=ADMIN): Super Admin succeeds; PIA and Officer rejected', async () => {
    // 1. Valid Super Admin succeeds
    const adminRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@nlams.gov.in',
        password: 'SuperAdmin@2026!',
        loginType: 'ADMIN',
      })
      .expect(200);
    expect(adminRes.body.user.role).toBe(UserRole.SUPER_ADMIN);

    // 2. PIA rejected
    const piaRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'liaison@nhai.gov.in',
        password: 'PiaPass@2026!',
        loginType: 'ADMIN',
      })
      .expect(401);
    expect(piaRes.body.message).toContain('Super Admin portal');

    // 3. Officer rejected
    const officerRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'ananya.rao@nlams.gov.in',
        password: 'OfficerPass@2026!',
        loginType: 'ADMIN',
      })
      .expect(401);
    expect(officerRes.body.message).toContain('Super Admin portal');
  });

  // ============================================================================
  // 3. AUTHENTICATED USER (ME) & RBAC CHECKS
  // ============================================================================

  it('6 & 12. GET /api/v1/auth/me with valid Bearer token returns current authenticated officer', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${superAdminAccessToken}`)
      .expect(200);

    expect(res.body.id).toBe('usr-superadmin-001');
    expect(res.body.email).toBe('superadmin@nlams.gov.in');
    expect(res.body.role).toBe(UserRole.SUPER_ADMIN);
    expect(res.body.organizationId).toBe('org-central-001');
    expect(res.body.passwordHash).toBeUndefined();
  });

  it('13. RBAC Allowed: SUPER_ADMIN accessing superadmin-only endpoint succeeds with 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/test-rbac/superadmin-only')
      .set('Authorization', `Bearer ${superAdminAccessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Super Admin Access Granted');
  });

  it('14. RBAC Denied: VIEWER accessing superadmin-only endpoint is rejected with 403 Forbidden', async () => {
    // Login as viewer
    const viewerLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'viewer@nlams.gov.in',
        password: 'ViewerPass@2026!',
      })
      .expect(200);

    viewerAccessToken = viewerLogin.body.accessToken;

    const res = await request(app.getHttpServer())
      .get('/api/v1/test-rbac/superadmin-only')
      .set('Authorization', `Bearer ${viewerAccessToken}`)
      .expect(403);

    expect(res.body.statusCode).toBe(403);
    expect(res.body.message).toContain('Access denied');
  });

  // ============================================================================
  // 4. REFRESH TOKEN ROTATION & REVOCATION
  // ============================================================================

  let rotatedRefreshToken: string;

  it('8 & 9. POST /api/v1/auth/refresh rotates session, invalidates old token and returns new tokens', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: superAdminRefreshToken,
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.refreshToken).toBeDefined();
    expect(res.body.refreshToken).not.toEqual(superAdminRefreshToken);

    rotatedRefreshToken = res.body.refreshToken;
  });

  it('10. POST /api/v1/auth/refresh using already rotated/revoked refresh token is rejected with 401', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: superAdminRefreshToken, // previously used old token
      })
      .expect(401);

    expect(res.body.statusCode).toBe(401);
  });

  it('11. POST /api/v1/auth/logout revokes refresh sessions', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${superAdminAccessToken}`)
      .send({
        refreshToken: rotatedRefreshToken,
      })
      .expect(200);

    expect(res.body.message).toBe('Logged out successfully');

    // Trying to refresh with the logged out token should fail
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: rotatedRefreshToken,
      })
      .expect(401);
  });
});
