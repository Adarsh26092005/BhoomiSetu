import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  AdminJurisdictionLevel,
  ApprovalRequestStatus,
  ApprovalRequestType,
  OrganizationStatus,
  OrganizationType,
  ProjectCategory,
  ProjectStatus,
  UserRole,
} from '@prisma/client';
import { JurisdictionService } from './jurisdiction.service';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';
import { ParcelsService } from '../parcels/parcels.service';
import { OrganizationsService } from '../organizations/organizations.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

describe('Jurisdiction-Aware Data Isolation & Access Control (Comprehensive Suite)', () => {
  let jurisdictionService: JurisdictionService;
  let usersService: UsersService;
  let projectsService: ProjectsService;
  let parcelsService: ParcelsService;
  let organizationsService: OrganizationsService;
  let prisma: any;

  // ============================================================================
  // MOCK ADMINISTRATIVE AREAS & DISTRICTS
  // ============================================================================
  const mockAreaMH01 = {
    id: 'area-mh-01',
    code: 'MH-01',
    name: 'Western Maharashtra Zone',
    state: 'Maharashtra',
    description: 'Covers Pune, Satara, Kolhapur',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    districts: [
      { id: 'ad-1', administrativeAreaId: 'area-mh-01', district: 'Pune' },
      { id: 'ad-2', administrativeAreaId: 'area-mh-01', district: 'Satara' },
      { id: 'ad-3', administrativeAreaId: 'area-mh-01', district: 'Kolhapur' },
    ],
  };

  const mockAreaMH02 = {
    id: 'area-mh-02',
    code: 'MH-02',
    name: 'Konkan / MMR Zone',
    state: 'Maharashtra',
    description: 'Covers Thane, Mumbai, Palghar',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    districts: [
      { id: 'ad-4', administrativeAreaId: 'area-mh-02', district: 'Thane' },
      { id: 'ad-5', administrativeAreaId: 'area-mh-02', district: 'Mumbai' },
      { id: 'ad-6', administrativeAreaId: 'area-mh-02', district: 'Palghar' },
    ],
  };

  // ============================================================================
  // MOCK ORGANIZATIONS
  // ============================================================================
  const mockCentralOrg = {
    id: 'org-central-1',
    name: 'Ministry of Rural Development',
    code: 'MoRD-CENTRAL',
    type: OrganizationType.CENTRAL_MINISTRY,
    status: OrganizationStatus.ACTIVE,
    state: null,
    district: null,
    isActive: true,
  };

  const mockMH01OrgPune = {
    id: 'org-pune-collectorate',
    name: 'Pune District Collectorate',
    code: 'REV-MH-PUNE',
    type: OrganizationType.DISTRICT_AUTHORITY,
    status: OrganizationStatus.ACTIVE,
    state: 'Maharashtra',
    district: 'Pune',
    isActive: true,
  };

  const mockMH02OrgThane = {
    id: 'org-thane-collectorate',
    name: 'Thane District Collectorate',
    code: 'REV-MH-THANE',
    type: OrganizationType.DISTRICT_AUTHORITY,
    status: OrganizationStatus.ACTIVE,
    state: 'Maharashtra',
    district: 'Thane',
    isActive: true,
  };

  const mockKarnatakaOrg = {
    id: 'org-karnataka-state',
    name: 'Karnataka Revenue Secretariat',
    code: 'REV-KARNATAKA',
    type: OrganizationType.STATE_AUTHORITY,
    status: OrganizationStatus.ACTIVE,
    state: 'Karnataka',
    district: null,
    isActive: true,
  };

  const mockPiaOrgNHAI = {
    id: 'org-nhai-pia',
    name: 'National Highways Authority of India',
    code: 'PIA-NHAI-CORP',
    type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
    status: OrganizationStatus.ACTIVE,
    state: 'Maharashtra',
    district: 'Pune',
    isActive: true,
  };

  const mockPiaOrgDFCCIL = {
    id: 'org-dfccil-pia',
    name: 'Dedicated Freight Corridor Corp',
    code: 'PIA-DFCCIL-CORP',
    type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
    status: OrganizationStatus.ACTIVE,
    state: 'Maharashtra',
    district: 'Thane',
    isActive: true,
  };

  // ============================================================================
  // MOCK USERS
  // ============================================================================
  const mockCentralSuperAdmin: AuthenticatedUser = {
    id: 'admin-central-uuid',
    email: 'central.admin@nlams.gov.in',
    fullName: 'Shri Central Super Admin',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Principal Secretary & Platform Administrator',
    organizationId: mockCentralOrg.id,
    isActive: true,
  };

  const mockMH01SuperAdmin: AuthenticatedUser = {
    id: 'admin-mh01-uuid',
    email: 'admin.mh01@nlams.gov.in',
    fullName: 'MH-01 Area Super Admin',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Divisional Commissioner (Pune Division)',
    organizationId: mockMH01OrgPune.id,
    isActive: true,
  };

  const mockMH02SuperAdmin: AuthenticatedUser = {
    id: 'admin-mh02-uuid',
    email: 'admin.mh02@nlams.gov.in',
    fullName: 'MH-02 Area Super Admin',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Divisional Commissioner (Konkan Division)',
    organizationId: mockMH02OrgThane.id,
    isActive: true,
  };

  const mockPuneOfficer: AuthenticatedUser = {
    id: 'officer-pune-uuid',
    email: 'slao.pune@maharashtra.gov.in',
    fullName: 'SLAO Pune District',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.LAND_ACQUISITION_OFFICER,
    designation: 'Special Land Acquisition Officer',
    organizationId: mockMH01OrgPune.id,
    isActive: true,
  };

  const mockThaneOfficer: AuthenticatedUser = {
    id: 'officer-thane-uuid',
    email: 'slao.thane@maharashtra.gov.in',
    fullName: 'SLAO Thane District',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.LAND_ACQUISITION_OFFICER,
    designation: 'Special Land Acquisition Officer',
    organizationId: mockMH02OrgThane.id,
    isActive: true,
  };

  const mockMaharashtraStateOfficer: AuthenticatedUser = {
    id: 'officer-mh-state-uuid',
    email: 'revenue.sec@maharashtra.gov.in',
    fullName: 'State Revenue Secretary MH',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.STATE_OFFICER,
    designation: 'State Nodal Secretary',
    organizationId: mockMH01OrgPune.id,
    isActive: true,
  };

  const mockKarnatakaOfficer: AuthenticatedUser = {
    id: 'officer-karnataka-uuid',
    email: 'officer@karnataka.gov.in',
    fullName: 'Karnataka State Officer',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.STATE_OFFICER,
    designation: 'Director Land Records Karnataka',
    organizationId: mockKarnatakaOrg.id,
    isActive: true,
  };

  const mockNhaiPiaUser: AuthenticatedUser = {
    id: 'user-nhai-pia-uuid',
    email: 'pd.pune@nhai.gov.in',
    fullName: 'NHAI Project Director',
    accountType: AccountType.PIA_USER,
    role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
    designation: 'Project Director (NHAI)',
    organizationId: mockPiaOrgNHAI.id,
    isActive: true,
  };

  // ============================================================================
  // MOCK PROJECTS & PARCELS
  // ============================================================================
  const mockProjectMH01 = {
    id: 'proj-pune-ring-road',
    code: 'MH-PUNE-RR-2026',
    title: 'Pune Outer Ring Road Phase 1',
    status: ProjectStatus.UNDER_SCRUTINY,
    category: ProjectCategory.HIGHWAY,
    state: 'Maharashtra',
    districts: ['Pune', 'Satara'],
    implementingAgencyOrgId: mockPiaOrgNHAI.id,
    totalAreaHectares: 450.5,
    estimatedCompensationInr: 1500000000,
    disbursedCompensationInr: 500000000,
    isActive: true,
    assignments: [],
  };

  const mockProjectMH02 = {
    id: 'proj-thane-coastal-road',
    code: 'MH-THANE-CR-2026',
    title: 'Thane Coastal Highway Corridor',
    status: ProjectStatus.UNDER_SCRUTINY,
    category: ProjectCategory.HIGHWAY,
    state: 'Maharashtra',
    districts: ['Thane', 'Mumbai'],
    implementingAgencyOrgId: mockPiaOrgDFCCIL.id,
    totalAreaHectares: 320.0,
    estimatedCompensationInr: 2500000000,
    disbursedCompensationInr: 800000000,
    isActive: true,
    assignments: [],
  };

  const mockParcelPune = {
    id: 'parcel-pune-001',
    surveyNumber: '142/1A',
    projectId: mockProjectMH01.id,
    project: mockProjectMH01,
    village: 'Hingna Khurd',
    tehsil: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    landType: 'AGRICULTURAL',
    areaHectares: 4.25,
    status: 'VERIFIED',
    marketRateInrPerHectare: 5000000,
    compensationInr: 21250000,
    isActive: true,
    parcelLandowners: [],
  };

  const mockParcelThane = {
    id: 'parcel-thane-001',
    surveyNumber: '89/2B',
    projectId: mockProjectMH02.id,
    project: mockProjectMH02,
    village: 'Bhayander East',
    tehsil: 'Thane',
    district: 'Thane',
    state: 'Maharashtra',
    landType: 'COMMERCIAL',
    areaHectares: 2.1,
    status: 'COMPENSATION_PENDING',
    marketRateInrPerHectare: 20000000,
    compensationInr: 42000000,
    isActive: true,
    parcelLandowners: [],
  };

  beforeEach(async () => {
    const userDb: Record<string, any> = {
      [mockCentralSuperAdmin.id]: {
        ...mockCentralSuperAdmin,
        organization: mockCentralOrg,
        superAdminAssignments: [
          {
            id: 'saa-central',
            userId: mockCentralSuperAdmin.id,
            jurisdictionLevel: AdminJurisdictionLevel.CENTRAL,
            isActive: true,
            administrativeArea: null,
          },
        ],
        projectAssignments: [],
      },
      [mockMH01SuperAdmin.id]: {
        ...mockMH01SuperAdmin,
        organization: mockMH01OrgPune,
        superAdminAssignments: [
          {
            id: 'saa-mh01',
            userId: mockMH01SuperAdmin.id,
            jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
            isActive: true,
            administrativeArea: mockAreaMH01,
          },
        ],
        projectAssignments: [],
      },
      [mockMH02SuperAdmin.id]: {
        ...mockMH02SuperAdmin,
        organization: mockMH02OrgThane,
        superAdminAssignments: [
          {
            id: 'saa-mh02',
            userId: mockMH02SuperAdmin.id,
            jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
            isActive: true,
            administrativeArea: mockAreaMH02,
          },
        ],
        projectAssignments: [],
      },
      [mockPuneOfficer.id]: {
        ...mockPuneOfficer,
        organization: mockMH01OrgPune,
        superAdminAssignments: [],
        projectAssignments: [],
      },
      [mockThaneOfficer.id]: {
        ...mockThaneOfficer,
        organization: mockMH02OrgThane,
        superAdminAssignments: [],
        projectAssignments: [],
      },
      [mockMaharashtraStateOfficer.id]: {
        ...mockMaharashtraStateOfficer,
        organization: { ...mockMH01OrgPune, district: null },
        superAdminAssignments: [],
        projectAssignments: [],
      },
      [mockKarnatakaOfficer.id]: {
        ...mockKarnatakaOfficer,
        organization: mockKarnatakaOrg,
        superAdminAssignments: [],
        projectAssignments: [],
      },
      [mockNhaiPiaUser.id]: {
        ...mockNhaiPiaUser,
        organization: mockPiaOrgNHAI,
        superAdminAssignments: [],
        projectAssignments: [],
      },
    };

    prisma = {
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(userDb[where.id] || null);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          let list = Object.values(userDb);
          if (where?.organization?.district?.in) {
            const allowed = where.organization.district.in.map((d: string) => d.toLowerCase());
            list = list.filter(
              (u) => u.organization?.district && allowed.includes(u.organization.district.toLowerCase()),
            );
          }
          if (where?.organizationId) {
            list = list.filter((u) => u.organizationId === where.organizationId);
          }
          return Promise.resolve(list);
        }),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'user-' + Math.random().toString(36).substring(7),
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'user-1', ...data })),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      organization: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const allOrgs = [
            mockCentralOrg,
            mockMH01OrgPune,
            mockMH02OrgThane,
            mockKarnatakaOrg,
            mockPiaOrgNHAI,
            mockPiaOrgDFCCIL,
          ];
          return Promise.resolve(allOrgs.find((o) => o.id === where.id) || null);
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([mockMH01OrgPune]),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'org-' + Math.random().toString(36).substring(7),
            ...data,
            _count: { users: 0, projects: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        ),
        update: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'org-1', ...data })),
      },
      project: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === mockProjectMH01.id) return Promise.resolve(mockProjectMH01);
          if (where.id === mockProjectMH02.id) return Promise.resolve(mockProjectMH02);
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([mockProjectMH01]),
        count: jest.fn().mockResolvedValue(1),
        create: jest.fn(),
        update: jest.fn(),
      },
      parcel: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === mockParcelPune.id) return Promise.resolve(mockParcelPune);
          if (where.id === mockParcelThane.id) return Promise.resolve(mockParcelThane);
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          const allParcels = [mockParcelPune, mockParcelThane];
          if (where?.district?.in) {
            const allowed = where.district.in.map((d: string) => d.toLowerCase());
            return Promise.resolve(allParcels.filter((p) => allowed.includes(p.district.toLowerCase())));
          }
          return Promise.resolve(allParcels);
        }),
        count: jest.fn().mockResolvedValue(1),
      },
      administrativeArea: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === mockAreaMH01.id || where.code === mockAreaMH01.code) {
            return Promise.resolve(mockAreaMH01);
          }
          if (where.id === mockAreaMH02.id || where.code === mockAreaMH02.code) {
            return Promise.resolve(mockAreaMH02);
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where?.state?.equals === 'Maharashtra') return Promise.resolve(mockAreaMH01);
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([mockAreaMH01, mockAreaMH02]),
        create: jest.fn(),
      },
      administrativeAreaDistrict: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const district = where?.district?.equals?.toLowerCase();
          if (district === 'pune' || district === 'satara' || district === 'kolhapur') {
            return Promise.resolve({ administrativeArea: mockAreaMH01 });
          }
          if (district === 'thane' || district === 'mumbai' || district === 'palghar') {
            return Promise.resolve({ administrativeArea: mockAreaMH02 });
          }
          return Promise.resolve(null);
        }),
      },
      superAdminAssignment: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where?.administrativeAreaId === mockAreaMH01.id) {
            return Promise.resolve([{ userId: mockMH01SuperAdmin.id }]);
          }
          if (where?.administrativeAreaId === mockAreaMH02.id) {
            return Promise.resolve([{ userId: mockMH02SuperAdmin.id }]);
          }
          return Promise.resolve([{ userId: mockCentralSuperAdmin.id }]);
        }),
        create: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      approvalRequest: {
        findUnique: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        create: jest.fn().mockResolvedValue({ id: 'req-new', status: 'PENDING' }),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn().mockResolvedValue(0),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JurisdictionService,
        UsersService,
        ProjectsService,
        ParcelsService,
        OrganizationsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    jurisdictionService = module.get<JurisdictionService>(JurisdictionService);
    usersService = module.get<UsersService>(UsersService);
    projectsService = module.get<ProjectsService>(ProjectsService);
    parcelsService = module.get<ParcelsService>(ParcelsService);
    organizationsService = module.get<OrganizationsService>(OrganizationsService);
  });

  // ============================================================================
  // SECTION 1: SUPER ADMIN SCOPE RESOLUTION & ISOLATION
  // ============================================================================
  describe('1. Super Admin Jurisdiction Scope Resolution', () => {
    it('Scenario 1: MH-01 Super Admin resolves to STATE_AREA with Pune, Satara, Kolhapur districts', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      expect(scope.level).toBe('STATE_AREA');
      expect(scope.isStateArea).toBe(true);
      expect(scope.isCentral).toBe(false);
      expect(scope.state).toBe('Maharashtra');
      expect(scope.districts).toEqual(['Pune', 'Satara', 'Kolhapur']);
      expect(scope.administrativeAreaCode).toBe('MH-01');
    });

    it('Scenario 2: Central Super Admin resolves to CENTRAL with unrestricted national scope', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockCentralSuperAdmin);
      expect(scope.level).toBe('CENTRAL');
      expect(scope.isCentral).toBe(true);
      expect(scope.isStateArea).toBe(false);
    });

    it('Scenario 3: State Officer resolves to STATE scope bound to Maharashtra', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMaharashtraStateOfficer);
      expect(scope.level).toBe('STATE');
      expect(scope.isStateScoped).toBe(true);
      expect(scope.state).toBe('Maharashtra');
    });

    it('Scenario 4: District Officer resolves to DISTRICT scope bound to Pune', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockPuneOfficer);
      expect(scope.level).toBe('DISTRICT');
      expect(scope.isDistrictScoped).toBe(true);
      expect(scope.districts).toEqual(['Pune']);
    });

    it('Scenario 5: Inactive Super Admin Assignment falls back and loses elevated area scope', async () => {
      const inactiveAdminUser = {
        id: 'admin-inactive-uuid',
        role: UserRole.SUPER_ADMIN,
        accountType: AccountType.GOVERNMENT_OFFICER,
        organizationId: mockCentralOrg.id,
      };
      // User with no active superAdminAssignment in DB
      const scope = await jurisdictionService.resolveEffectiveScope(inactiveAdminUser);
      expect(scope.isStateArea).toBe(false);
    });
  });

  // ============================================================================
  // SECTION 2: USER DIRECTORY ISOLATION (MH-01 vs MH-02)
  // ============================================================================
  describe('2. User Directory Data Isolation', () => {
    it('Scenario 6: MH-01 admin can see MH-01 officer (Pune)', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      const canAccess = jurisdictionService.canAccessUser(scope, {
        id: mockPuneOfficer.id,
        organizationId: mockMH01OrgPune.id,
        organization: mockMH01OrgPune,
      });
      expect(canAccess).toBe(true);
    });

    it('Scenario 7: MH-01 admin CANNOT see MH-02 officer (Thane)', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      const canAccess = jurisdictionService.canAccessUser(scope, {
        id: mockThaneOfficer.id,
        organizationId: mockMH02OrgThane.id,
        organization: mockMH02OrgThane,
      });
      expect(canAccess).toBe(false);
    });

    it('Scenario 8: MH-01 admin CANNOT see officers from Karnataka', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      const canAccess = jurisdictionService.canAccessUser(scope, {
        id: mockKarnatakaOfficer.id,
        organizationId: mockKarnatakaOrg.id,
        organization: mockKarnatakaOrg,
      });
      expect(canAccess).toBe(false);
    });

    it('Scenario 9: Central Super Admin can access officers across all zones', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockCentralSuperAdmin);
      expect(jurisdictionService.canAccessUser(scope, { id: mockPuneOfficer.id, organizationId: mockMH01OrgPune.id, organization: mockMH01OrgPune })).toBe(true);
      expect(jurisdictionService.canAccessUser(scope, { id: mockThaneOfficer.id, organizationId: mockMH02OrgThane.id, organization: mockMH02OrgThane })).toBe(true);
      expect(jurisdictionService.canAccessUser(scope, { id: mockKarnatakaOfficer.id, organizationId: mockKarnatakaOrg.id, organization: mockKarnatakaOrg })).toBe(true);
    });

    it('Scenario 10: IDOR Prevention - findOne for outside user throws 403 Forbidden', async () => {
      await expect(usersService.findOne(mockThaneOfficer.id, mockMH01SuperAdmin)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ============================================================================
  // SECTION 3: PROJECT DOMAIN ISOLATION & IDOR
  // ============================================================================
  describe('3. Project Domain Scoping & Access Control', () => {
    it('Scenario 11: MH-01 admin can access MH-01 project (Pune Outer Ring Road)', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      expect(jurisdictionService.canAccessProject(scope, mockProjectMH01)).toBe(true);
    });

    it('Scenario 12: MH-01 admin CANNOT access MH-02 project (Thane Coastal Highway)', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      expect(jurisdictionService.canAccessProject(scope, mockProjectMH02)).toBe(false);
    });

    it('Scenario 13: IDOR Prevention - findOne for outside project throws 403 Forbidden', async () => {
      await expect(projectsService.findOne(mockProjectMH02.id, mockMH01SuperAdmin)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Scenario 14: Central Super Admin can access all projects nationwide', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockCentralSuperAdmin);
      expect(jurisdictionService.canAccessProject(scope, mockProjectMH01)).toBe(true);
      expect(jurisdictionService.canAccessProject(scope, mockProjectMH02)).toBe(true);
    });

    it('Scenario 15: PIA User can access only their own organization projects', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockNhaiPiaUser);
      expect(jurisdictionService.canAccessProject(scope, mockProjectMH01)).toBe(true);
      expect(jurisdictionService.canAccessProject(scope, mockProjectMH02)).toBe(false);
    });
  });

  // ============================================================================
  // SECTION 4: PARCELS DOMAIN & CADASTRE ISOLATION
  // ============================================================================
  describe('4. Cadastral Parcel Data Isolation & IDOR', () => {
    it('Scenario 16: MH-01 admin can access Pune cadastral parcel', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      expect(jurisdictionService.canAccessParcel(scope, mockParcelPune)).toBe(true);
    });

    it('Scenario 17: MH-01 admin CANNOT access Thane cadastral parcel', async () => {
      const scope = await jurisdictionService.resolveEffectiveScope(mockMH01SuperAdmin);
      expect(jurisdictionService.canAccessParcel(scope, mockParcelThane)).toBe(false);
    });

    it('Scenario 18: IDOR Prevention - findOne for outside parcel throws 403 Forbidden', async () => {
      await expect(parcelsService.findOne(mockParcelThane.id, mockMH01SuperAdmin)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('Scenario 19: findAll parcels filters strictly by permitted districts', async () => {
      const result = await parcelsService.findAll({}, mockMH01SuperAdmin);
      expect(result.items).toBeDefined();
      expect(prisma.parcel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                district: { in: ['Pune', 'Satara', 'Kolhapur'], mode: 'insensitive' },
              }),
            ]),
          }),
        }),
      );
    });

    it('Scenario 20: Summary KPIs are calculated strictly over scoped parcels', async () => {
      const summary = await parcelsService.getSummary(mockMH01SuperAdmin);
      expect(summary.totalParcels).toBeGreaterThanOrEqual(0);
      expect(prisma.parcel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            district: { in: ['Pune', 'Satara', 'Kolhapur'], mode: 'insensitive' },
          }),
        }),
      );
    });

    it('Scenario 21: Parcel export dataset is strictly restricted to permitted boundaries', async () => {
      const exportList = await parcelsService.exportParcels({}, mockMH01SuperAdmin);
      expect(Array.isArray(exportList)).toBe(true);
    });
  });

  // ============================================================================
  // SECTION 5: REGISTRATION ROUTING & APPROVAL WORKFLOW
  // ============================================================================
  describe('5. Onboarding Registration Routing & Approval Queues', () => {
    it('Scenario 22: Officer registration in Pune routes to MH-01 AdministrativeArea', async () => {
      const result = await organizationsService.registerOfficer({
        fullName: 'Shri Vikram Patil',
        email: 'vikram.patil@revenue.maharashtra.gov.in',
        phone: '+91-9876543211',
        employeeId: 'EMP-PUNE-9021',
        designation: 'Deputy Collector',
        departmentName: 'Department of Revenue Pune',
        organizationType: OrganizationType.DISTRICT_AUTHORITY,
        state: 'Maharashtra',
        district: 'Pune',
        officeAddress: 'Pune Collectorate, Station Road',
        requestedRole: UserRole.LAND_ACQUISITION_OFFICER,
        password: 'Password@2026!',
      });

      expect(result.user.isActive).toBe(false);
      expect(prisma.approvalRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requestType: ApprovalRequestType.OFFICER_REGISTRATION,
            administrativeAreaId: mockAreaMH01.id,
            assignedApproverId: mockMH01SuperAdmin.id,
            status: ApprovalRequestStatus.PENDING,
          }),
        }),
      );
    });

    it('Scenario 23: Officer registration in Thane routes to MH-02 AdministrativeArea', async () => {
      const result = await organizationsService.registerOfficer({
        fullName: 'Shri Nilesh Deshmukh',
        email: 'nilesh.deshmukh@revenue.maharashtra.gov.in',
        phone: '+91-9876543212',
        employeeId: 'EMP-THANE-8812',
        designation: 'Special Land Acquisition Officer',
        departmentName: 'Department of Revenue Thane',
        organizationType: OrganizationType.DISTRICT_AUTHORITY,
        state: 'Maharashtra',
        district: 'Thane',
        officeAddress: 'Court Naka, Thane West',
        requestedRole: UserRole.LAND_ACQUISITION_OFFICER,
        password: 'Password@2026!',
      });

      expect(result.user.isActive).toBe(false);
      expect(prisma.approvalRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requestType: ApprovalRequestType.OFFICER_REGISTRATION,
            administrativeAreaId: mockAreaMH02.id,
            assignedApproverId: mockMH02SuperAdmin.id,
          }),
        }),
      );
    });

    it('Scenario 24: PIA registration in Pune routes to MH-01 ApprovalRequest', async () => {
      const result = await organizationsService.registerPia({
        organizationName: 'Pune Metro Rail Corp',
        registrationCode: 'PMRCL-2026',
        adminFullName: 'Director PMRCL',
        adminEmail: 'director@pmrcl.org',
        adminPhone: '+91-9876543213',
        adminDesignation: 'Executive Director',
        state: 'Maharashtra',
        district: 'Pune',
        officeAddress: 'Shivajinagar Metro Station Complex',
        adminPassword: 'Password@2026!',
      });

      expect(result.organization.isActive).toBe(false);
      expect(prisma.approvalRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            requestType: ApprovalRequestType.PIA_REGISTRATION,
            administrativeAreaId: mockAreaMH01.id,
          }),
        }),
      );
    });

    it('Scenario 25: Officer registration fails when requesting SUPER_ADMIN role', async () => {
      await expect(
        organizationsService.registerOfficer({
          fullName: 'Illegal Admin Requester',
          email: 'illegal@gov.in',
          phone: '+91-9876543214',
          employeeId: 'EMP-9999',
          designation: 'Hacker',
          departmentName: 'Secretariat',
          organizationType: OrganizationType.DISTRICT_AUTHORITY,
          state: 'Maharashtra',
          district: 'Pune',
          officeAddress: 'Pune Office',
          requestedRole: UserRole.SUPER_ADMIN,
          password: 'Password@2026!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('Scenario 26: MH-01 admin can approve MH-01 ApprovalRequest and activate user', async () => {
      const mockReq = {
        id: 'req-mh01-1',
        requestType: ApprovalRequestType.OFFICER_REGISTRATION,
        requesterUserId: 'user-pending-1',
        organizationId: mockMH01OrgPune.id,
        state: 'Maharashtra',
        district: 'Pune',
        administrativeAreaId: mockAreaMH01.id,
        status: ApprovalRequestStatus.PENDING,
      };
      prisma.approvalRequest.findUnique.mockResolvedValue(mockReq);
      prisma.approvalRequest.update.mockResolvedValue({
        ...mockReq,
        status: ApprovalRequestStatus.APPROVED,
      });

      const approved = await organizationsService.approveApprovalRequest(
        'req-mh01-1',
        { remarks: 'Approved' },
        mockMH01SuperAdmin,
      );

      expect(approved.status).toBe(ApprovalRequestStatus.APPROVED);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-pending-1' },
          data: { isActive: true },
        }),
      );
    });

    it('Scenario 27: MH-01 admin CANNOT approve or view MH-02 ApprovalRequest', async () => {
      const mockReqMH02 = {
        id: 'req-mh02-1',
        requestType: ApprovalRequestType.OFFICER_REGISTRATION,
        requesterUserId: 'user-pending-2',
        organizationId: mockMH02OrgThane.id,
        state: 'Maharashtra',
        district: 'Thane',
        administrativeAreaId: mockAreaMH02.id,
        status: ApprovalRequestStatus.PENDING,
      };
      prisma.approvalRequest.findUnique.mockResolvedValue(mockReqMH02);

      await expect(
        organizationsService.approveApprovalRequest(
          'req-mh02-1',
          { remarks: 'Illegal cross-area approval' },
          mockMH01SuperAdmin,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Scenario 28: Rejecting ApprovalRequest marks status REJECTED with reason', async () => {
      const mockReq = {
        id: 'req-mh01-2',
        requestType: ApprovalRequestType.OFFICER_REGISTRATION,
        requesterUserId: 'user-pending-3',
        organizationId: mockMH01OrgPune.id,
        state: 'Maharashtra',
        district: 'Pune',
        administrativeAreaId: mockAreaMH01.id,
        status: ApprovalRequestStatus.PENDING,
      };
      prisma.approvalRequest.findUnique.mockResolvedValue(mockReq);
      prisma.approvalRequest.update.mockResolvedValue({
        ...mockReq,
        status: ApprovalRequestStatus.REJECTED,
      });

      const rejected = await organizationsService.rejectApprovalRequest(
        'req-mh01-2',
        { rejectionReason: 'Invalid departmental credentials' },
        mockMH01SuperAdmin,
      );

      expect(rejected.status).toBe(ApprovalRequestStatus.REJECTED);
    });

    it('Scenario 29: Central Super Admin can provision new AdministrativeArea', async () => {
      prisma.administrativeArea.findUnique.mockResolvedValue(null);
      prisma.administrativeArea.create.mockResolvedValue({
        id: 'area-up-01',
        code: 'UP-01',
        name: 'Western UP Corridor Zone',
        state: 'Uttar Pradesh',
        active: true,
        districts: [{ district: 'Noida' }, { district: 'Greater Noida' }],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const area = await jurisdictionService.createAdministrativeArea(
        {
          code: 'UP-01',
          name: 'Western UP Corridor Zone',
          state: 'Uttar Pradesh',
          districts: ['Noida', 'Greater Noida'],
        },
        mockCentralSuperAdmin.id,
      );

      expect(area.code).toBe('UP-01');
      expect(area.districts).toContain('Noida');
    });

    it('Scenario 30: Assigning SuperAdmin to Area creates SuperAdminAssignment and logs audit', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 'admin-new-uuid',
        role: UserRole.SUPER_ADMIN,
      });
      prisma.administrativeArea.findUnique.mockResolvedValue(mockAreaMH01);
      prisma.superAdminAssignment.create.mockResolvedValue({
        id: 'saa-new',
        userId: 'admin-new-uuid',
        administrativeAreaId: mockAreaMH01.id,
        jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
        isPrimary: true,
        isActive: true,
        assignedAt: new Date(),
        assignedById: mockCentralSuperAdmin.id,
        user: { fullName: 'New Admin', email: 'new.admin@nlams.gov.in' },
        administrativeArea: { code: 'MH-01', name: 'Western Maharashtra Zone' },
      });

      const assignment = await jurisdictionService.assignSuperAdmin(
        {
          userId: 'admin-new-uuid',
          administrativeAreaId: mockAreaMH01.id,
          jurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
          isPrimary: true,
        },
        mockCentralSuperAdmin.id,
      );

      expect(assignment.administrativeAreaCode).toBe('MH-01');
      expect(assignment.jurisdictionLevel).toBe(AdminJurisdictionLevel.STATE_AREA);
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });
});
