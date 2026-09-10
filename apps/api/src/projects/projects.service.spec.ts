import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  OrganizationType,
  ProjectCategory,
  ProjectStatus,
  UserRole,
} from '@prisma/client';
import { ProjectsService } from './projects.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { PrismaService } from '../database/prisma.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let prisma: any;

  const mockCentralOrg = {
    id: 'org-central-1',
    name: 'Ministry of Road Transport and Highways',
    type: OrganizationType.CENTRAL_MINISTRY,
    state: null,
    district: null,
    isActive: true,
  };

  const mockStateOrg = {
    id: 'org-state-1',
    name: 'Karnataka State Highway Development Project',
    type: OrganizationType.STATE_AUTHORITY,
    state: 'Karnataka',
    district: null,
    isActive: true,
  };

  const mockDistrictOrg = {
    id: 'org-district-1',
    name: 'Kolar District Collectorate',
    type: OrganizationType.DISTRICT_AUTHORITY,
    state: 'Karnataka',
    district: 'Kolar',
    isActive: true,
  };

  const mockPiaOrg1 = {
    id: 'org-pia-1',
    name: 'NHAI Regional Office Bengaluru',
    type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
    state: 'Karnataka',
    district: 'Bengaluru',
    isActive: true,
  };

  const mockPiaOrg2 = {
    id: 'org-pia-2',
    name: 'DFCCIL Strategic Projects',
    type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
    state: 'Maharashtra',
    district: 'Mumbai',
    isActive: true,
  };

  const mockCentralUser: AuthenticatedUser = {
    id: 'user-central-1',
    email: 'central.officer@morth.gov.in',
    fullName: 'Central Administrator',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.CENTRAL_OFFICER,
    designation: 'Joint Secretary',
    organizationId: 'org-central-1',
    isActive: true,
  };

  const mockStateUser: AuthenticatedUser = {
    id: 'user-state-1',
    email: 'state.officer@karnataka.gov.in',
    fullName: 'State Officer',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.STATE_OFFICER,
    designation: 'Special Secretary Revenue',
    organizationId: 'org-state-1',
    isActive: true,
  };

  const mockDistrictUser: AuthenticatedUser = {
    id: 'user-district-1',
    email: 'dc.kolar@karnataka.gov.in',
    fullName: 'District Collector Kolar',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.DISTRICT_OFFICER,
    designation: 'District Collector',
    organizationId: 'org-district-1',
    isActive: true,
  };

  const mockPiaUser1: AuthenticatedUser = {
    id: 'user-pia-1',
    email: 'liaison@nhai.org.in',
    fullName: 'NHAI Project Director',
    accountType: AccountType.PIA_USER,
    role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
    designation: 'Project Director',
    organizationId: 'org-pia-1',
    isActive: true,
  };

  const mockPiaUser2: AuthenticatedUser = {
    id: 'user-pia-2',
    email: 'liaison@dfccil.gov.in',
    fullName: 'DFCCIL Project Director',
    accountType: AccountType.PIA_USER,
    role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
    designation: 'Chief Project Manager',
    organizationId: 'org-pia-2',
    isActive: true,
  };

  const mockViewerUser: AuthenticatedUser = {
    id: 'user-viewer-1',
    email: 'auditor@cag.gov.in',
    fullName: 'Audit Viewer',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.VIEWER,
    designation: 'Senior Audit Officer',
    organizationId: 'org-central-1',
    isActive: true,
  };

  const mockLaoUser: AuthenticatedUser = {
    id: 'user-lao-1',
    email: 'lao.blr@karnataka.gov.in',
    fullName: 'Karnataka LAO Officer',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.LAND_ACQUISITION_OFFICER,
    designation: 'Special Land Acquisition Officer',
    organizationId: 'org-district-1',
    isActive: true,
  };

  const mockFinanceUser: AuthenticatedUser = {
    id: 'user-fin-1',
    email: 'finance.blr@karnataka.gov.in',
    fullName: 'Karnataka Finance Officer',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.FINANCE_OFFICER,
    designation: 'Treasury Officer',
    organizationId: 'org-state-1',
    isActive: true,
  };

  const mockSurveyUser: AuthenticatedUser = {
    id: 'user-srv-1',
    email: 'survey.blr@karnataka.gov.in',
    fullName: 'Karnataka Survey Officer',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SURVEY_OFFICER,
    designation: 'Survey Officer',
    organizationId: 'org-district-1',
    isActive: true,
  };

  const mockProject1 = {
    id: 'proj-1',
    code: 'NHAI-BCE-PH2',
    title: 'Bangalore–Chennai Expressway Phase 2',
    description: 'Four-lane expressway corridor',
    category: ProjectCategory.HIGHWAY,
    status: ProjectStatus.DRAFT,
    implementingAgencyOrgId: 'org-pia-1',
    implementingAgencyOrg: mockPiaOrg1,
    state: 'Karnataka',
    districts: ['Bengaluru Rural', 'Kolar'],
    totalAreaHectares: 350.5,
    estimatedCompensationInr: 1500000000,
    disbursedCompensationInr: 250000000,
    spatialBounds: null,
    notifiedOn: new Date('2026-03-01'),
    targetCompletionOn: new Date('2028-12-31'),
    metadata: null,
    isActive: true,
    assignments: [],
    _count: {
      parcels: 142,
      documents: 24,
      workflowTasks: 8,
      affectedHouseholds: 320,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProject2 = {
    id: 'proj-2',
    code: 'DFCCIL-WDFC-MAH',
    title: 'Western Dedicated Freight Corridor Maharashtra',
    description: 'Double track electrified freight railway',
    category: ProjectCategory.RAILWAY,
    status: ProjectStatus.SUBMITTED,
    implementingAgencyOrgId: 'org-pia-2',
    implementingAgencyOrg: mockPiaOrg2,
    state: 'Maharashtra',
    districts: ['Palghar', 'Thane'],
    totalAreaHectares: 520.0,
    estimatedCompensationInr: 3200000000,
    disbursedCompensationInr: 1100000000,
    spatialBounds: null,
    notifiedOn: new Date('2025-11-01'),
    targetCompletionOn: new Date('2027-10-31'),
    metadata: null,
    isActive: true,
    assignments: [],
    _count: {
      parcels: 210,
      documents: 45,
      workflowTasks: 12,
      affectedHouseholds: 490,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const orgMap: Record<string, any> = {
      'org-central-1': mockCentralOrg,
      'org-state-1': mockStateOrg,
      'org-district-1': mockDistrictOrg,
      'org-pia-1': mockPiaOrg1,
      'org-pia-2': mockPiaOrg2,
    };

    const projectMap: Record<string, any> = {
      'proj-1': { ...mockProject1 },
      'proj-2': { ...mockProject2 },
    };

    const userMap: Record<string, any> = {
      'user-central-1': { ...mockCentralUser, organization: mockCentralOrg, superAdminAssignments: [], projectAssignments: [] },
      'user-state-1': { ...mockStateUser, organization: mockStateOrg, superAdminAssignments: [], projectAssignments: [] },
      'user-district-1': { ...mockDistrictUser, organization: mockDistrictOrg, superAdminAssignments: [], projectAssignments: [] },
      'user-pia-1': { ...mockPiaUser1, organization: mockPiaOrg1, superAdminAssignments: [], projectAssignments: [] },
      'user-pia-2': { ...mockPiaUser2, organization: mockPiaOrg2, superAdminAssignments: [], projectAssignments: [] },
      'user-viewer-1': { ...mockViewerUser, organization: mockCentralOrg, superAdminAssignments: [], projectAssignments: [] },
    };

    const mockPrismaService = {
      organization: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(orgMap[where.id] || null);
        }),
      },
      user: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const u = userMap[where.id] || {
            id: where.id,
            role: UserRole.SUPER_ADMIN,
            accountType: AccountType.GOVERNMENT_OFFICER,
            organization: mockCentralOrg,
            superAdminAssignments: [],
            projectAssignments: [],
          };
          return Promise.resolve(u);
        }),
      },
      superAdminAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      project: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id) {
            return Promise.resolve(projectMap[where.id] || null);
          }
          if (where.code) {
            const found = Object.values(projectMap).find((p) => p.code === where.code);
            return Promise.resolve(found || null);
          }
          return Promise.resolve(null);
        }),
        findMany: jest.fn().mockResolvedValue([mockProject1, mockProject2]),
        count: jest.fn().mockResolvedValue(2),
        create: jest.fn().mockImplementation(({ data, include }) => {
          const created = {
            id: `proj-${Date.now()}`,
            ...data,
            implementingAgencyOrg: orgMap[data.implementingAgencyOrgId] || mockPiaOrg1,
            assignments: [],
            _count: { parcels: 0, documents: 0, workflowTasks: 0, affectedHouseholds: 0 },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          projectMap[created.id] = created;
          return Promise.resolve(created);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const existing = projectMap[where.id] || mockProject1;
          const updated = {
            ...existing,
            ...data,
            updatedAt: new Date(),
          };
          projectMap[where.id] = updated;
          return Promise.resolve(updated);
        }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      projectAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        JurisdictionService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    prisma = module.get(PrismaService);
  });

  describe('Project Creation', () => {
    it('should allow PIA user to create a project proposal for own organization', async () => {
      const dto = {
        code: 'NHAI-NEW-01',
        title: 'New Bangalore Outer Ring Corridor',
        category: ProjectCategory.HIGHWAY,
        state: 'Karnataka',
        districts: ['Bengaluru Rural'],
        totalAreaHectares: 120.5,
        estimatedCompensationInr: 500000000,
      };

      const result = await service.create(dto, mockPiaUser1);

      expect(result).toBeDefined();
      expect(result.code).toBe('NHAI-NEW-01');
      expect(result.implementingAgencyOrgId).toBe(mockPiaUser1.organizationId);
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should reject duplicate project code with ConflictException', async () => {
      const dto = {
        code: 'NHAI-BCE-PH2', // Already exists in mock
        title: 'Duplicate Project Code Attempt',
        category: ProjectCategory.HIGHWAY,
        state: 'Karnataka',
        districts: ['Kolar'],
      };

      await expect(service.create(dto, mockPiaUser1)).rejects.toThrow(ConflictException);
    });

    it('should forbid VIEWER role from creating projects', async () => {
      const dto = {
        code: 'VIEWER-PROJ-01',
        title: 'Viewer Project Attempt',
        state: 'Karnataka',
        districts: ['Kolar'],
      };

      await expect(service.create(dto, mockViewerUser)).rejects.toThrow(ForbiddenException);
    });

    it('should prevent District Officer from initiating projects outside assigned district', async () => {
      const dto = {
        code: 'DC-MYS-01',
        title: 'Mysuru Ring Road',
        state: 'Karnataka',
        districts: ['Mysuru'], // mockDistrictUser is assigned to 'Kolar'
      };

      await expect(service.create(dto, mockDistrictUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Data Isolation & Boundaries (FindOne)', () => {
    it('should allow Central Officer to view any project across the nation', async () => {
      const result = await service.findOne('proj-1', mockCentralUser);
      expect(result).toBeDefined();
      expect(result.id).toBe('proj-1');
    });

    it('should allow PIA user to view its own organization project', async () => {
      const result = await service.findOne('proj-1', mockPiaUser1);
      expect(result).toBeDefined();
      expect(result.id).toBe('proj-1');
    });

    it('should reject PIA user attempting to access another PIA organization project', async () => {
      // mockPiaUser1 (NHAI) attempting to access proj-2 (DFCCIL)
      await expect(service.findOne('proj-2', mockPiaUser1)).rejects.toThrow(ForbiddenException);
    });

    it('should allow District Officer to view project covering their assigned district', async () => {
      // proj-1 covers ['Bengaluru Rural', 'Kolar']; mockDistrictUser is in 'Kolar'
      const result = await service.findOne('proj-1', mockDistrictUser);
      expect(result).toBeDefined();
      expect(result.id).toBe('proj-1');
    });

    it('should reject District Officer attempting to view project in a different state/district', async () => {
      // proj-2 is in Maharashtra ['Palghar', 'Thane']; mockDistrictUser is in Karnataka 'Kolar'
      await expect(service.findOne('proj-2', mockDistrictUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Status State Machine & Controlled Transitions', () => {
    it('should allow PIA user to submit DRAFT project proposal', async () => {
      const result = await service.updateStatus(
        'proj-1',
        { status: ProjectStatus.SUBMITTED, remarks: 'Proposal submitted for preliminary scrutiny.' },
        mockPiaUser1,
      );

      expect(result.status).toBe(ProjectStatus.SUBMITTED);
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });

    it('should forbid PIA user from advancing project SUBMITTED -> UNDER_SCRUTINY (403)', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.SUBMITTED,
      });

      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.UNDER_SCRUTINY, remarks: 'PIA attempting government scrutiny' },
          mockPiaUser1,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid PIA user from executing government approvals (403)', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.UNDER_SCRUTINY,
      });

      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.DISTRICT_APPROVAL, remarks: 'PIA attempting district approval' },
          mockPiaUser1,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid PIA user from executing compensation disbursement (403)', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.COMPENSATION_ASSESSED,
      });

      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.COMPENSATION_DISBURSED, remarks: 'PIA attempting disbursement' },
          mockPiaUser1,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid PIA user from executing possession completion (403)', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.POSSESSION_PENDING,
      });

      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.POSSESSION_COMPLETED, remarks: 'PIA attempting possession takeover' },
          mockPiaUser1,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow authorized LAND_ACQUISITION_OFFICER to transition SUBMITTED -> UNDER_SCRUTINY', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.SUBMITTED,
      });

      const result = await service.updateStatus(
        'proj-1',
        { status: ProjectStatus.UNDER_SCRUTINY, remarks: 'LAO beginning statutory scrutiny.' },
        mockLaoUser,
      );

      expect(result.status).toBe(ProjectStatus.UNDER_SCRUTINY);
    });

    it('should forbid SURVEY_OFFICER from performing compensation disbursement (403)', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.COMPENSATION_ASSESSED,
      });

      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.COMPENSATION_DISBURSED, remarks: 'Survey officer attempting disbursement' },
          mockSurveyUser,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow authorized FINANCE_OFFICER to perform compensation disbursement', async () => {
      (prisma.project.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject1,
        status: ProjectStatus.COMPENSATION_ASSESSED,
      });

      const result = await service.updateStatus(
        'proj-1',
        { status: ProjectStatus.COMPENSATION_DISBURSED, remarks: 'PFMS batch verified and disbursed.' },
        mockFinanceUser,
      );

      expect(result.status).toBe(ProjectStatus.COMPENSATION_DISBURSED);
    });

    it('should reject invalid arbitrary state jumps (e.g. DRAFT -> COMPLETED)', async () => {
      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.COMPLETED, remarks: 'Illegal status bypass attempt' },
          mockPiaUser1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject status change if project is already in that status', async () => {
      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.DRAFT },
          mockPiaUser1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should require rejection reason or remarks when rejecting a project', async () => {
      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.REJECTED }, // Missing rejectionReason / remarks
          mockCentralUser,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should forbid PIA user from rejecting statutory proposals', async () => {
      await expect(
        service.updateStatus(
          'proj-1',
          { status: ProjectStatus.REJECTED, rejectionReason: 'PIA trying to reject' },
          mockPiaUser1,
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Scoped Summary KPI Metrics', () => {
    it('should aggregate metrics correctly within authorized scope', async () => {
      const summary = await service.getSummary(mockCentralUser);

      expect(summary).toBeDefined();
      expect(summary.totalProjects).toBe(2);
      expect(summary.inStatutoryProcess).toBe(2);
      expect(summary.totalAreaHectares).toBe(870.5); // 350.5 + 520
    });
  });
});
