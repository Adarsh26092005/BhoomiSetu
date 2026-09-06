import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AccountType,
  OrganizationStatus,
  OrganizationType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';

describe('Organizations Management & PIA Onboarding (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let superadminToken: string;
  let piaToken: string;

  const orgsDb = new Map<string, any>();
  const usersDb = new Map<string, any>();
  const sessionsDb = new Map<string, any>();
  const auditLogs: any[] = [];

  beforeAll(async () => {
    const superadminPasswordHash = await bcrypt.hash('AdminPass@2026!', 12);
    const piaPasswordHash = await bcrypt.hash('PiaPass@2026!', 12);

    const ministryOrg = {
      id: 'org-central-001',
      name: 'Ministry of Road Transport & Highways',
      code: 'MORTH-CENTRAL',
      type: OrganizationType.CENTRAL_MINISTRY,
      status: OrganizationStatus.ACTIVE,
      parentId: null,
      state: null,
      district: null,
      address: 'New Delhi',
      email: 'morth@gov.in',
      phone: '+91-11-23710000',
      registrationNumber: null,
      isActive: true,
      metadata: {},
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(ministryOrg.id, ministryOrg);

    const activePiaOrg = {
      id: 'org-pia-active-001',
      name: 'L&T Infrastructure Corp',
      code: 'PIA-LT-001',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      parentId: null,
      state: 'Maharashtra',
      district: 'Mumbai',
      address: 'L&T House, Ballard Estate',
      email: 'infra@lntecc.com',
      phone: '+91-22-67525656',
      registrationNumber: 'U45200MH2020PTC999999',
      isActive: true,
      metadata: {},
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(activePiaOrg.id, activePiaOrg);

    const superAdminUser = {
      id: 'usr-superadmin-001',
      email: 'admin@morth.gov.in',
      passwordHash: superadminPasswordHash,
      fullName: 'Super Administrator',
      phone: '+91-9876543210',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.SUPER_ADMIN,
      designation: 'Joint Secretary',
      organizationId: 'org-central-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(superAdminUser.id, superAdminUser);
    usersDb.set(superAdminUser.email, superAdminUser);

    const piaUser = {
      id: 'usr-pia-lead-001',
      email: 'lead@lntecc.com',
      passwordHash: piaPasswordHash,
      fullName: 'L&T Project Director',
      phone: '+91-9876500000',
      accountType: AccountType.PIA_USER,
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      designation: 'Project Director',
      organizationId: 'org-pia-active-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(piaUser.id, piaUser);
    usersDb.set(piaUser.email, piaUser);

    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where: { id, email } }) => {
          let u: any = null;
          if (id) u = usersDb.get(id);
          else if (email) {
            for (const user of usersDb.values()) {
              if (user.email.toLowerCase() === email.toLowerCase()) {
                u = user;
                break;
              }
            }
          }
          if (!u) return Promise.resolve(null);
          return Promise.resolve({
            ...u,
            organization: orgsDb.get(u.organizationId) || null,
          });
        }),
        create: jest.fn().mockImplementation(({ data }) => {
          const user = { id: `usr-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          usersDb.set(user.id, user);
          usersDb.set(user.email, user);
          return Promise.resolve({
            ...user,
            organization: orgsDb.get(user.organizationId) || null,
          });
        }),
        update: jest.fn().mockImplementation(({ where: { id }, data }) => {
          const user = usersDb.get(id);
          if (!user) return Promise.resolve(null);
          const updated = { ...user, ...data, updatedAt: new Date() };
          usersDb.set(id, updated);
          usersDb.set(updated.email, updated);
          return Promise.resolve({
            ...updated,
            organization: orgsDb.get(updated.organizationId) || null,
          });
        }),
        updateMany: jest.fn().mockImplementation(({ where, data }) => {
          let count = 0;
          for (const [id, u] of usersDb.entries()) {
            if (where.organizationId && u.organizationId === where.organizationId) {
              const updated = { ...u, ...data };
              usersDb.set(id, updated);
              count++;
            }
          }
          return Promise.resolve({ count });
        }),
      },
      organization: {
        findUnique: jest.fn().mockImplementation(({ where: { id, code } }) => {
          if (id) {
            const org = orgsDb.get(id);
            if (!org) return Promise.resolve(null);
            return Promise.resolve({ ...org, parent: null, children: [] });
          }
          if (code) {
            for (const o of orgsDb.values()) {
              if (o.code === code) return Promise.resolve(o);
            }
            return Promise.resolve(null);
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          for (const o of orgsDb.values()) {
            if (where.name && o.name === where.name) return Promise.resolve(o);
            if (where.code && o.code === where.code) return Promise.resolve(o);
          }
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockImplementation(() => {
          const items = Array.from(orgsDb.values()).map((o) => ({
            ...o,
            _count: { users: 2, projects: 1 },
          }));
          return Promise.resolve(items);
        }),
        count: jest.fn().mockImplementation(() => Promise.resolve(orgsDb.size)),
        create: jest.fn().mockImplementation(({ data }) => {
          const org = {
            id: `org-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            _count: { users: 1, projects: 0 },
          };
          orgsDb.set(org.id, org);
          return Promise.resolve(org);
        }),
        update: jest.fn().mockImplementation(({ where: { id }, data }) => {
          const org = orgsDb.get(id);
          if (!org) return Promise.resolve(null);
          const updated = { ...org, ...data, updatedAt: new Date() };
          orgsDb.set(id, updated);
          return Promise.resolve(updated);
        }),
      },
      authSession: {
        create: jest.fn().mockImplementation(({ data }) => {
          const session = { id: `sess-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          sessionsDb.set(session.id, session);
          return Promise.resolve(session);
        }),
        findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
          const session = sessionsDb.get(id);
          if (!session) return Promise.resolve(null);
          const user = usersDb.get(session.userId);
          return Promise.resolve({
            ...session,
            user: user ? { ...user, organization: orgsDb.get(user.organizationId) || null } : null,
          });
        }),
        update: jest.fn().mockImplementation(({ where: { id }, data }) => {
          const session = sessionsDb.get(id);
          if (!session) return Promise.resolve(null);
          const updated = { ...session, ...data, updatedAt: new Date() };
          sessionsDb.set(id, updated);
          return Promise.resolve(updated);
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: {
        create: jest.fn().mockImplementation(({ data }) => {
          const log = { id: `audit-${Date.now()}`, ...data, timestamp: new Date() };
          auditLogs.push(log);
          return Promise.resolve(log);
        }),
      },
      $transaction: jest.fn((cb) => cb(mockPrismaService)),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
    app.setGlobalPrefix('api/v1');

    await app.init();

    // Login superadmin
    const superadminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@morth.gov.in', password: 'AdminPass@2026!' });
    superadminToken = superadminLogin.body.accessToken;

    // Login PIA user
    const piaLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'lead@lntecc.com', password: 'PiaPass@2026!' });
    piaToken = piaLogin.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /api/v1/organizations/pia/register (Public PIA Onboarding)', () => {
    it('should submit PIA registration creating PENDING_APPROVAL organization', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations/pia/register')
        .send({
          organizationName: 'Tata Projects Limited',
          registrationCode: 'PIA-TATA-001',
          officeAddress: 'One Forbes, Fort, Mumbai',
          state: 'Maharashtra',
          district: 'Mumbai City',
          adminFullName: 'Vikram Mehta',
          adminEmail: 'v.mehta@tataprojects.com',
          adminPhone: '+91-9820011223',
          adminDesignation: 'Executive Vice President',
          adminPassword: 'TataSecurePassword123!',
        });

      expect(res.status).toBe(201);
      expect(res.body.organization.status).toBe(OrganizationStatus.PENDING_APPROVAL);
      expect(res.body.organization.id).toBeDefined();
      expect(res.body.initialUser.isActive).toBe(false);
    });
  });

  describe('POST /api/v1/organizations/officer/register (Public Officer Onboarding)', () => {
    it('should submit Government Officer access request creating pending user and organization', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations/officer/register')
        .send({
          fullName: 'Shri Anand Kumar Verma',
          email: 'anand.verma@revenue.maharashtra.gov.in',
          phone: '+91-9876543210',
          employeeId: 'GOV-REV-2026-8941',
          designation: 'Special Land Acquisition Officer (SLAO)',
          departmentName: 'District Collectorate Nagpur (Revenue)',
          organizationType: OrganizationType.DISTRICT_AUTHORITY,
          state: 'Maharashtra',
          district: 'Nagpur',
          requestedRole: UserRole.LAND_ACQUISITION_OFFICER,
          password: 'SecureOfficer2026!',
        });

      expect(res.status).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.email).toBe('anand.verma@revenue.maharashtra.gov.in');
      expect(res.body.user.role).toBe(UserRole.LAND_ACQUISITION_OFFICER);
      expect(res.body.user.accountType).toBe(AccountType.GOVERNMENT_OFFICER);
      expect(res.body.user.isActive).toBe(false);
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.organization).toBeDefined();
    });

    it('should reject officer registration requesting SUPER_ADMIN role with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations/officer/register')
        .send({
          fullName: 'Malicious Actor',
          email: 'malicious@gov.in',
          designation: 'Wannabe Admin',
          departmentName: 'Ministry',
          organizationType: OrganizationType.CENTRAL_MINISTRY,
          state: 'Delhi',
          requestedRole: UserRole.SUPER_ADMIN,
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
    });

    it('should reject officer registration requesting PROJECT_IMPLEMENTING_AGENCY role with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations/officer/register')
        .send({
          fullName: 'PIA Actor',
          email: 'pia.actor@gov.in',
          designation: 'Contractor Lead',
          departmentName: 'Authority',
          organizationType: OrganizationType.DISTRICT_AUTHORITY,
          state: 'Maharashtra',
          requestedRole: UserRole.PROJECT_IMPLEMENTING_AGENCY,
          password: 'Password123!',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/organizations (List Organizations)', () => {
    it('should return paginated organizations for authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/organizations')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app.getHttpServer()).get('/api/v1/organizations');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/organizations (Admin Provisioning)', () => {
    it('should allow SUPER_ADMIN to provision a Government Authority', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          name: 'Maharashtra State Road Development Corp',
          code: 'MSRDC-STATE',
          type: OrganizationType.STATE_AUTHORITY,
          state: 'Maharashtra',
          district: 'Mumbai',
        });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe('MSRDC-STATE');
      expect(res.body.status).toBe(OrganizationStatus.ACTIVE);
    });

    it('should forbid PIA user from provisioning organizations', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/organizations')
        .set('Authorization', `Bearer ${piaToken}`)
        .send({
          name: 'Unauthorized Agency',
          code: 'UNAUTH-001',
          type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/organizations/:id/approve (Approval Lifecycle)', () => {
    it('should approve pending PIA organization and record audit log', async () => {
      const pendingOrg = Array.from(orgsDb.values()).find(
        (o) => o.status === OrganizationStatus.PENDING_APPROVAL,
      );
      expect(pendingOrg).toBeDefined();

      const res = await request(app.getHttpServer())
        .post(`/api/v1/organizations/${pendingOrg.id}/approve`)
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          remarks: 'Statutory verification completed with MCA registry.',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(OrganizationStatus.ACTIVE);
    });
  });
});
