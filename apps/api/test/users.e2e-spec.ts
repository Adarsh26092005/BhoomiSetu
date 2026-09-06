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

describe('Users Management & Project Assignment (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let superadminToken: string;
  let piaToken: string;

  const usersDb = new Map<string, any>();
  const orgsDb = new Map<string, any>();
  const projectsDb = new Map<string, any>();
  const assignmentsDb = new Map<string, any>();
  const sessionsDb = new Map<string, any>();
  const auditLogs: any[] = [];

  beforeAll(async () => {
    const adminHash = await bcrypt.hash('AdminPass@2026!', 12);
    const piaHash = await bcrypt.hash('PiaPass@2026!', 12);

    const ministryOrg = {
      id: 'org-central-001',
      name: 'Ministry of Road Transport & Highways',
      code: 'MORTH-CENTRAL',
      type: OrganizationType.CENTRAL_MINISTRY,
      status: OrganizationStatus.ACTIVE,
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(ministryOrg.id, ministryOrg);

    const piaOrg = {
      id: 'org-pia-001',
      name: 'L&T Infrastructure Corp',
      code: 'PIA-LT-001',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(piaOrg.id, piaOrg);

    const superAdminUser = {
      id: 'usr-superadmin-001',
      email: 'admin@morth.gov.in',
      passwordHash: adminHash,
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

    const piaLeadUser = {
      id: 'usr-pia-lead-001',
      email: 'lead@lntecc.com',
      passwordHash: piaHash,
      fullName: 'L&T Project Director',
      phone: '+91-9876500000',
      accountType: AccountType.PIA_USER,
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      designation: 'Project Director',
      organizationId: 'org-pia-001',
      avatarUrl: null,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(piaLeadUser.id, piaLeadUser);
    usersDb.set(piaLeadUser.email, piaLeadUser);

    const project1 = {
      id: 'proj-001',
      code: 'NH-48-EXP',
      title: 'Delhi-Mumbai Expressway Package 4',
      status: 'IN_PROGRESS',
      state: 'Gujarat',
    };
    projectsDb.set(project1.id, project1);

    const mockPrismaService = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where: { id, email } }) => {
          let u: any = null;
          if (id) {
            u = usersDb.get(id);
          } else if (email) {
            for (const user of usersDb.values()) {
              if (user.email.toLowerCase() === email.toLowerCase()) {
                u = user;
                break;
              }
            }
          }
          if (!u) return Promise.resolve(null);
          const userAssignments = Array.from(assignmentsDb.values())
            .filter((a) => a.userId === u.id && a.isActive)
            .map((a) => ({ ...a, project: projectsDb.get(a.projectId) }));
          return Promise.resolve({
            ...u,
            organization: orgsDb.get(u.organizationId) || null,
            projectAssignments: userAssignments,
          });
        }),
        findMany: jest.fn().mockImplementation(() => {
          const items = Array.from(usersDb.values())
            .filter((u, idx, arr) => arr.findIndex((x) => x.id === u.id) === idx)
            .map((u) => ({
              ...u,
              organization: orgsDb.get(u.organizationId) || null,
            }));
          return Promise.resolve(items);
        }),
        count: jest.fn().mockImplementation(() => Promise.resolve(usersDb.size / 2)),
        create: jest.fn().mockImplementation(({ data }) => {
          const user = {
            id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
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
      },
      organization: {
        findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
          return Promise.resolve(orgsDb.get(id) || null);
        }),
      },
      project: {
        findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
          return Promise.resolve(projectsDb.get(id) || null);
        }),
      },
      projectAssignment: {
        findMany: jest.fn().mockImplementation(({ where: { userId } }) => {
          const items = Array.from(assignmentsDb.values())
            .filter((a) => a.userId === userId)
            .map((a) => ({ ...a, project: projectsDb.get(a.projectId) }));
          return Promise.resolve(items);
        }),
        findUnique: jest.fn().mockImplementation(({ where: { id } }) => {
          return Promise.resolve(assignmentsDb.get(id) || null);
        }),
        upsert: jest.fn().mockImplementation(({ create, update }) => {
          const id = `pa-${Date.now()}`;
          const item = {
            id,
            ...create,
            assignedAt: new Date(),
            project: projectsDb.get(create.projectId),
          };
          assignmentsDb.set(id, item);
          return Promise.resolve(item);
        }),
        update: jest.fn().mockImplementation(({ where: { id }, data }) => {
          const item = assignmentsDb.get(id);
          if (!item) return Promise.resolve(null);
          const updated = { ...item, ...data };
          assignmentsDb.set(id, updated);
          return Promise.resolve({
            ...updated,
            project: projectsDb.get(updated.projectId),
          });
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

  describe('GET /api/v1/users (List and Filter Users)', () => {
    it('should return paginated user directory without leaking passwordHash', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      res.body.items.forEach((u: any) => {
        expect(u.passwordHash).toBeUndefined();
      });
    });
  });

  describe('POST /api/v1/users (User Provisioning & Security Invariants)', () => {
    it('should allow SUPER_ADMIN to provision a Government Officer', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          email: 'lao.pune@nlams.gov.in',
          password: 'OfficerSecurePass123!',
          fullName: 'Sanjay Deshmukh',
          designation: 'Land Acquisition Officer',
          role: UserRole.LAND_ACQUISITION_OFFICER,
          accountType: AccountType.GOVERNMENT_OFFICER,
          organizationId: 'org-central-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('lao.pune@nlams.gov.in');
      expect(res.body.role).toBe(UserRole.LAND_ACQUISITION_OFFICER);
      expect(res.body.passwordHash).toBeUndefined();
    });

    it('should forbid PIA user from creating a Government Officer account', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${piaToken}`)
        .send({
          email: 'fake.officer@nlams.gov.in',
          password: 'Password123!',
          fullName: 'Malicious Attempt',
          designation: 'Central Secretary',
          role: UserRole.CENTRAL_OFFICER,
          accountType: AccountType.GOVERNMENT_OFFICER,
          organizationId: 'org-central-001',
        });

      expect(res.status).toBe(403);
    });

    it('should allow PIA user to create a team member within their own PIA organization', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${piaToken}`)
        .send({
          email: 'subengineer@lntecc.com',
          password: 'EngineerPass123!',
          fullName: 'Kunal Patil',
          designation: 'Senior Resident Engineer',
          role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
          accountType: AccountType.PIA_USER,
          organizationId: 'org-pia-001',
        });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('subengineer@lntecc.com');
      expect(res.body.accountType).toBe(AccountType.PIA_USER);
    });
  });

  describe('POST /api/v1/users/:id/project-assignments (Project Assignment)', () => {
    it('should assign a user to a project using ProjectAssignment model', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/users/usr-superadmin-001/project-assignments')
        .set('Authorization', `Bearer ${superadminToken}`)
        .send({
          projectId: 'proj-001',
          role: UserRole.SUPER_ADMIN,
        });

      expect(res.status).toBe(201);
      expect(res.body.projectId).toBe('proj-001');
      expect(res.body.isActive).toBe(true);
    });

    it('should retrieve assigned projects for a user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/users/usr-superadmin-001/project-assignments')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });
});
