import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AccountType,
  OrganizationStatus,
  OrganizationType,
  ProjectCategory,
  ProjectStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';

describe('Projects Management Module (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;
  let superadminToken: string;
  let districtOfficerToken: string;
  let piaToken1: string;
  let piaToken2: string;

  const usersDb = new Map<string, any>();
  const orgsDb = new Map<string, any>();
  const projectsDb = new Map<string, any>();
  const assignmentsDb = new Map<string, any>();
  const sessionsDb = new Map<string, any>();
  const auditLogs: any[] = [];

  beforeAll(async () => {
    const adminHash = await bcrypt.hash('AdminPass@2026!', 12);
    const officerHash = await bcrypt.hash('OfficerPass@2026!', 12);
    const piaHash = await bcrypt.hash('PiaPass@2026!', 12);

    // Organizations
    const centralOrg = {
      id: 'org-central-001',
      name: 'Ministry of Road Transport & Highways',
      code: 'MORTH-CENTRAL',
      type: OrganizationType.CENTRAL_MINISTRY,
      status: OrganizationStatus.ACTIVE,
      state: null,
      district: null,
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(centralOrg.id, centralOrg);

    const districtOrg = {
      id: 'org-dist-kolar',
      name: 'Kolar District Land Acquisition Authority',
      code: 'KOLAR-REV',
      type: OrganizationType.DISTRICT_AUTHORITY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Kolar',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(districtOrg.id, districtOrg);

    const piaOrg1 = {
      id: 'org-pia-nhai',
      name: 'National Highways Authority of India',
      code: 'PIA-NHAI-01',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      state: 'Karnataka',
      district: 'Bengaluru',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(piaOrg1.id, piaOrg1);

    const piaOrg2 = {
      id: 'org-pia-dfccil',
      name: 'Dedicated Freight Corridor Corp',
      code: 'PIA-DFCCIL-01',
      type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
      status: OrganizationStatus.ACTIVE,
      state: 'Maharashtra',
      district: 'Mumbai',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    orgsDb.set(piaOrg2.id, piaOrg2);

    // Users
    const superAdminUser = {
      id: 'usr-admin-001',
      email: 'admin@morth.gov.in',
      passwordHash: adminHash,
      fullName: 'Central Super Admin',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.SUPER_ADMIN,
      designation: 'Joint Secretary',
      organizationId: 'org-central-001',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(superAdminUser.id, superAdminUser);
    usersDb.set(superAdminUser.email, superAdminUser);

    const districtOfficerUser = {
      id: 'usr-do-kolar',
      email: 'officer@kolar.gov.in',
      passwordHash: officerHash,
      fullName: 'Kolar District Collector',
      accountType: AccountType.GOVERNMENT_OFFICER,
      role: UserRole.DISTRICT_OFFICER,
      designation: 'District Collector',
      organizationId: 'org-dist-kolar',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(districtOfficerUser.id, districtOfficerUser);
    usersDb.set(districtOfficerUser.email, districtOfficerUser);

    const piaUser1 = {
      id: 'usr-pia-nhai-1',
      email: 'director@nhai.gov.in',
      passwordHash: piaHash,
      fullName: 'NHAI Project Director',
      accountType: AccountType.PIA_USER,
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      designation: 'Chief Project Manager',
      organizationId: 'org-pia-nhai',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(piaUser1.id, piaUser1);
    usersDb.set(piaUser1.email, piaUser1);

    const piaUser2 = {
      id: 'usr-pia-dfccil-1',
      email: 'director@dfccil.gov.in',
      passwordHash: piaHash,
      fullName: 'DFCCIL Project Director',
      accountType: AccountType.PIA_USER,
      role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
      designation: 'Chief Project Manager',
      organizationId: 'org-pia-dfccil',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    usersDb.set(piaUser2.id, piaUser2);
    usersDb.set(piaUser2.email, piaUser2);

    // Initial Projects
    const initialProject1 = {
      id: 'proj-nhai-001',
      code: 'NHAI-BCE-PH2',
      title: 'Bangalore–Chennai Expressway Alignment Phase 2',
      description: 'Four-lane access-controlled greenfield expressway',
      category: ProjectCategory.HIGHWAY,
      status: ProjectStatus.DRAFT,
      implementingAgencyOrgId: 'org-pia-nhai',
      state: 'Karnataka',
      districts: ['Bengaluru Rural', 'Kolar'],
      totalAreaHectares: 350.5,
      estimatedCompensationInr: 1500000000,
      disbursedCompensationInr: 0,
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    projectsDb.set(initialProject1.id, initialProject1);
    projectsDb.set(initialProject1.code, initialProject1);

    const initialProject2 = {
      id: 'proj-dfccil-001',
      code: 'DFCCIL-WDFC-01',
      title: 'Western Dedicated Freight Corridor Palghar',
      description: 'Double line electrified freight corridor',
      category: ProjectCategory.RAILWAY,
      status: ProjectStatus.SUBMITTED,
      implementingAgencyOrgId: 'org-pia-dfccil',
      state: 'Maharashtra',
      districts: ['Palghar', 'Thane'],
      totalAreaHectares: 500.0,
      estimatedCompensationInr: 2500000000,
      disbursedCompensationInr: 500000000,
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    };
    projectsDb.set(initialProject2.id, initialProject2);
    projectsDb.set(initialProject2.code, initialProject2);

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
          return Promise.resolve({
            ...u,
            organization: orgsDb.get(u.organizationId) || null,
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
        findUnique: jest.fn().mockImplementation(({ where: { id, code } }) => {
          let p: any = null;
          if (id) {
            p = projectsDb.get(id);
          } else if (code) {
            p = projectsDb.get(code);
          }
          if (!p) return Promise.resolve(null);
          const projectAssignments = Array.from(assignmentsDb.values()).filter(
            (a) => a.projectId === p.id && a.isActive,
          );
          return Promise.resolve({
            ...p,
            implementingAgencyOrg: orgsDb.get(p.implementingAgencyOrgId) || null,
            assignments: projectAssignments,
            _count: { parcels: 10, documents: 5, workflowTasks: 2, affectedHouseholds: 50 },
          });
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          const allProjects = Array.from(projectsDb.values()).filter(
            (p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx,
          );

          // Apply multi-tenant scoping logic in mock
          let filtered = allProjects;

          if (where?.AND) {
            for (const cond of where.AND) {
              if (cond.OR) {
                // Scope conditions
                const matchPia = cond.OR.find((c: any) => c.implementingAgencyOrgId);
                if (matchPia) {
                  filtered = filtered.filter(
                    (p) => p.implementingAgencyOrgId === matchPia.implementingAgencyOrgId,
                  );
                }
                const matchGeo = cond.OR.find((c: any) => c.state || c.districts);
                if (matchGeo) {
                  filtered = filtered.filter((p) => {
                    let match = true;
                    if (matchGeo.state) match = match && p.state === matchGeo.state;
                    if (matchGeo.districts?.array_contains) {
                      match =
                        match &&
                        p.districts.includes(matchGeo.districts.array_contains);
                    }
                    return match;
                  });
                }
              }
            }
          }

          return Promise.resolve(
            filtered.map((p) => ({
              ...p,
              implementingAgencyOrg: orgsDb.get(p.implementingAgencyOrgId) || null,
              _count: { parcels: 10, documents: 5, workflowTasks: 2, affectedHouseholds: 50 },
            })),
          );
        }),
        count: jest.fn().mockImplementation(() => Promise.resolve(projectsDb.size / 2)),
        create: jest.fn().mockImplementation(({ data }) => {
          const project = {
            id: `proj-${Date.now()}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          projectsDb.set(project.id, project);
          projectsDb.set(project.code, project);
          return Promise.resolve({
            ...project,
            implementingAgencyOrg: orgsDb.get(project.implementingAgencyOrgId) || null,
            assignments: [],
            _count: { parcels: 0, documents: 0, workflowTasks: 0, affectedHouseholds: 0 },
          });
        }),
        update: jest.fn().mockImplementation(({ where: { id }, data }) => {
          const project = projectsDb.get(id);
          if (!project) return Promise.resolve(null);
          const updated = { ...project, ...data, updatedAt: new Date() };
          projectsDb.set(id, updated);
          projectsDb.set(updated.code, updated);
          return Promise.resolve({
            ...updated,
            implementingAgencyOrg: orgsDb.get(updated.implementingAgencyOrgId) || null,
            assignments: [],
            _count: { parcels: 10, documents: 5, workflowTasks: 2, affectedHouseholds: 50 },
          });
        }),
      },
      projectAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
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
          const log = { id: `audit-${Date.now()}`, ...data, createdAt: new Date() };
          auditLogs.push(log);
          return Promise.resolve(log);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(auditLogs)),
      },
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

    // Login tokens
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@morth.gov.in', password: 'AdminPass@2026!' });
    superadminToken = adminLogin.body.accessToken;

    const doLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'officer@kolar.gov.in', password: 'OfficerPass@2026!' });
    districtOfficerToken = doLogin.body.accessToken;

    const pia1Login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'director@nhai.gov.in', password: 'PiaPass@2026!' });
    piaToken1 = pia1Login.body.accessToken;

    const pia2Login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'director@dfccil.gov.in', password: 'PiaPass@2026!' });
    piaToken2 = pia2Login.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  describe('POST /api/v1/projects (Project Creation & Ownership Locking)', () => {
    it('should allow PIA user to create project with ownership locked to its own organization', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${piaToken1}`)
        .send({
          code: 'NHAI-KLR-BYPASS',
          title: 'Kolar Bypass 6-Lane Expansion',
          state: 'Karnataka',
          districts: ['Kolar'],
          totalAreaHectares: 180.5,
          estimatedCompensationInr: 950000000,
        });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe('NHAI-KLR-BYPASS');
      expect(res.body.implementingAgencyOrgId).toBe('org-pia-nhai');
    });

    it('should reject duplicate project code with 409 Conflict', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${piaToken1}`)
        .send({
          code: 'NHAI-BCE-PH2', // Existing code
          title: 'Duplicate Gazette Reference Attempt',
          state: 'Karnataka',
          districts: ['Kolar'],
        });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/v1/projects (Multi-Tenant & Geographical Scoping)', () => {
    it('should restrict PIA user to see only projects belonging to their own organization', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${piaToken1}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.items)).toBe(true);
      res.body.items.forEach((p: any) => {
        expect(p.implementingAgencyOrgId).toBe('org-pia-nhai');
      });
    });

    it('should forbid PIA user from querying other organizations via query params', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects?implementingAgencyOrgId=org-pia-dfccil')
        .set('Authorization', `Bearer ${piaToken1}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/projects/:id (Boundary Security Checks)', () => {
    it('should allow PIA user to view its own project details', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/proj-nhai-001')
        .set('Authorization', `Bearer ${piaToken1}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('proj-nhai-001');
      expect(res.body.parcelCount).toBeDefined();
    });

    it('should forbid PIA user from accessing another PIA project', async () => {
      // piaToken1 (NHAI) attempting to access proj-dfccil-001 (DFCCIL)
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/proj-dfccil-001')
        .set('Authorization', `Bearer ${piaToken1}`);

      expect(res.status).toBe(403);
    });

    it('should forbid District Officer from accessing a project in another district/state', async () => {
      // districtOfficerToken (Kolar, Karnataka) attempting to access proj-dfccil-001 (Palghar, Maharashtra)
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/proj-dfccil-001')
        .set('Authorization', `Bearer ${districtOfficerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/projects/:id/status (Controlled Status Transitions)', () => {
    it('should allow PIA user to submit a DRAFT project proposal', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/projects/proj-nhai-001/status')
        .set('Authorization', `Bearer ${piaToken1}`)
        .send({
          status: ProjectStatus.SUBMITTED,
          remarks: 'Formal Section 4 SIA draft proposal submitted to Collectorate.',
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe(ProjectStatus.SUBMITTED);
    });

    it('should reject invalid status jump (e.g. SUBMITTED -> COMPLETED) with 400 Bad Request', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/projects/proj-nhai-001/status')
        .set('Authorization', `Bearer ${piaToken1}`)
        .send({
          status: ProjectStatus.COMPLETED,
          remarks: 'Illegal status skip attempt',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/projects/summary (Summary KPI Metrics)', () => {
    it('should return real aggregated KPI metrics scoped to authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/projects/summary')
        .set('Authorization', `Bearer ${superadminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.totalProjects).toBeDefined();
      expect(res.body.inStatutoryProcess).toBeDefined();
      expect(res.body.totalAreaHectares).toBeDefined();
    });
  });
});
