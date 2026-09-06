import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  OrganizationStatus,
  OrganizationType,
  UserRole,
} from '@prisma/client';
import { OrganizationsService } from './organizations.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { PrismaService } from '../database/prisma.service';

describe('OrganizationsService (Unit)', () => {
  let service: OrganizationsService;
  let prisma: any;

  const mockOrg = {
    id: 'org-uuid-1',
    name: 'Ministry of Road Transport and Highways',
    code: 'MORTH-CENTRAL',
    type: OrganizationType.CENTRAL_MINISTRY,
    status: OrganizationStatus.ACTIVE,
    parentId: null,
    state: null,
    district: null,
    jurisdiction: {
      officeAddress: 'Transport Bhawan, 1 Parliament Street, New Delhi',
      email: 'contact@morth.gov.in',
      phone: '+91-11-23714938',
    },
    isActive: true,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
    _count: {
      users: 12,
      projects: 5,
    },
  };

  const mockPendingPiaOrg = {
    id: 'org-pia-pending-1',
    name: 'National Highways Infra Projects Pvt Ltd',
    code: 'PIA-NHAI-001',
    type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
    status: OrganizationStatus.PENDING_APPROVAL,
    parentId: null,
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    jurisdiction: {
      officeAddress: 'Plot 4, Bandra-Kurla Complex',
      metadata: {
        registeredUnder: 'Companies Act 2013',
      },
    },
    isActive: false,
    createdAt: new Date('2026-09-02'),
    updatedAt: new Date('2026-09-02'),
    _count: {
      users: 1,
      projects: 0,
    },
  };

  beforeEach(async () => {
    prisma = {
      organization: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      approvalRequest: {
        create: jest.fn().mockResolvedValue({ id: 'req-1', status: 'PENDING' }),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        count: jest.fn(),
      },
      administrativeArea: {
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      administrativeAreaDistrict: {
        findFirst: jest.fn().mockResolvedValue(null),
      },
      superAdminAssignment: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        JurisdictionService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated organizations with metadata and counts', async () => {
      prisma.organization.count.mockResolvedValue(1);
      prisma.organization.findMany.mockResolvedValue([mockOrg]);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        type: OrganizationType.CENTRAL_MINISTRY,
      });

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].id).toBe(mockOrg.id);
      expect(result.items[0].userCount).toBe(12);
      expect(result.items[0].projectCount).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return full organization details including hierarchy', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        ...mockOrg,
        parent: null,
        children: [],
      });

      const result = await service.findOne(mockOrg.id);
      expect(result.id).toBe(mockOrg.id);
      expect(result.name).toBe(mockOrg.name);
      expect(result.status).toBe(OrganizationStatus.ACTIVE);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should provision a government organization with unique code', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      prisma.organization.create.mockResolvedValue({
        ...mockOrg,
        code: 'NEW-MINISTRY',
      });

      const result = await service.create(
        {
          name: 'Ministry of Civil Aviation',
          code: 'NEW-MINISTRY',
          type: OrganizationType.CENTRAL_MINISTRY,
        },
        'actor-admin-1',
      );

      expect(result.code).toBe('NEW-MINISTRY');
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'CREATE_ORGANIZATION',
          }),
        }),
      );
    });

    it('should reject creation if code is already taken', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);

      await expect(
        service.create(
          {
            name: 'Duplicate Ministry',
            code: mockOrg.code,
            type: OrganizationType.CENTRAL_MINISTRY,
          },
          'actor-admin-1',
        ),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('registerPia (PIA Onboarding)', () => {
    it('should create PENDING_APPROVAL organization and inactive primary liaison user', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue(null);

      prisma.organization.create.mockResolvedValue(mockPendingPiaOrg);
      prisma.user.create.mockResolvedValue({
        id: 'user-pia-lead-1',
        email: 'lead@nhinfra.co.in',
        fullName: 'Rajesh Sharma',
        accountType: AccountType.PIA_USER,
        role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
        isActive: false,
        organizationId: mockPendingPiaOrg.id,
      });

      const result = await service.registerPia({
        organizationName: 'National Highways Infra Projects Pvt Ltd',
        registrationCode: 'PIA-NHAI-001',
        officeAddress: 'Plot 4, Bandra-Kurla Complex',
        state: 'Maharashtra',
        district: 'Mumbai Suburban',
        adminFullName: 'Rajesh Sharma',
        adminEmail: 'lead@nhinfra.co.in',
        adminPhone: '+91-9876500000',
        adminDesignation: 'Vice President - Project Operations',
        adminPassword: 'PiaSecurePassword123!',
      });

      expect(result.organization.status).toBe(OrganizationStatus.PENDING_APPROVAL);
      expect(result.organization.id).toBe(mockPendingPiaOrg.id);
      expect(result.initialUser.isActive).toBe(false);
      expect(prisma.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: OrganizationStatus.PENDING_APPROVAL,
            type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
          }),
        }),
      );
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            accountType: AccountType.PIA_USER,
            role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
            isActive: false, // Inactive pending approval
          }),
        }),
      );
    });

    it('should throw ConflictException if liaison email already exists', async () => {
      prisma.organization.findUnique.mockResolvedValue(null);
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.registerPia({
          organizationName: 'Some Org',
          registrationCode: 'ORG-001',
          adminFullName: 'Test User',
          adminEmail: 'existing@nlams.gov.in',
          adminDesignation: 'Lead',
          adminPassword: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('registerOfficer', () => {
    it('should successfully create pending Government Officer and Organization with isActive: false', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.organization.findFirst = jest.fn().mockResolvedValue(null);
      prisma.organization.create.mockResolvedValue({
        id: 'org-gov-new-1',
        name: 'District Revenue Office Nagpur',
        type: OrganizationType.DISTRICT_AUTHORITY,
        status: OrganizationStatus.PENDING_APPROVAL,
        state: 'Maharashtra',
        district: 'Nagpur',
        isActive: false,
      });
      prisma.user.create.mockResolvedValue({
        id: 'user-officer-new-1',
        email: 'officer.nagpur@revenue.gov.in',
        fullName: 'Shri Anand Verma',
        role: UserRole.LAND_ACQUISITION_OFFICER,
        accountType: AccountType.GOVERNMENT_OFFICER,
        isActive: false,
        organizationId: 'org-gov-new-1',
      });

      const result = await service.registerOfficer({
        fullName: 'Shri Anand Verma',
        email: 'officer.nagpur@revenue.gov.in',
        employeeId: 'MAH-REV-9988',
        phone: '+91-9876543210',
        designation: 'Special Land Acquisition Officer',
        officeAddress: 'Revenue Building, Civil Lines, Nagpur',
        departmentName: 'District Revenue Office Nagpur',
        organizationType: OrganizationType.DISTRICT_AUTHORITY,
        state: 'Maharashtra',
        district: 'Nagpur',
        requestedRole: UserRole.LAND_ACQUISITION_OFFICER,
        password: 'SecureOfficer2026!',
      });

      expect(result).toBeDefined();
      expect(result.user.isActive).toBe(false);
      expect(result.user.accountType).toBe(AccountType.GOVERNMENT_OFFICER);
      expect(result.user.role).toBe(UserRole.LAND_ACQUISITION_OFFICER);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'OFFICER_ACCESS_REQUESTED',
          }),
        }),
      );
    });

    it('should reject officer registration requesting SUPER_ADMIN role with BadRequestException', async () => {
      await expect(
        service.registerOfficer({
          fullName: 'Malicious Actor',
          email: 'hack@gov.in',
          employeeId: 'HACK-001',
          phone: '+91-9876543211',
          designation: 'Wannabe Admin',
          officeAddress: 'Ministry HQ, New Delhi',
          departmentName: 'Ministry',
          organizationType: OrganizationType.CENTRAL_MINISTRY,
          state: 'Delhi',
          district: 'New Delhi',
          requestedRole: UserRole.SUPER_ADMIN,
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject officer registration requesting PROJECT_IMPLEMENTING_AGENCY role with BadRequestException', async () => {
      await expect(
        service.registerOfficer({
          fullName: 'PIA Actor',
          email: 'pia@gov.in',
          employeeId: 'PIA-001',
          phone: '+91-9876543212',
          designation: 'Contractor',
          officeAddress: 'Authority Complex, Mumbai',
          departmentName: 'Authority',
          organizationType: OrganizationType.DISTRICT_AUTHORITY,
          state: 'Maharashtra',
          district: 'Mumbai',
          requestedRole: UserRole.PROJECT_IMPLEMENTING_AGENCY,
          password: 'Password123!',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if officer email already exists', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing-officer' });

      await expect(
        service.registerOfficer({
          fullName: 'Duplicate Officer',
          email: 'existing@revenue.gov.in',
          employeeId: 'MAH-REV-001',
          phone: '+91-9876543213',
          designation: 'Officer',
          officeAddress: 'Secretariat, Mumbai',
          departmentName: 'Revenue Dept',
          organizationType: OrganizationType.STATE_AUTHORITY,
          state: 'Maharashtra',
          district: 'Mumbai',
          requestedRole: UserRole.STATE_OFFICER,
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('approvePia', () => {
    it('should transition PENDING_APPROVAL organization to ACTIVE and activate liaison user', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockPendingPiaOrg);
      prisma.organization.update.mockResolvedValue({
        ...mockPendingPiaOrg,
        status: OrganizationStatus.ACTIVE,
      });

      const result = await service.approvePia(
        mockPendingPiaOrg.id,
        { remarks: 'Statutory incorporation documents verified.' },
        'admin-actor-1',
      );

      expect(result.status).toBe(OrganizationStatus.ACTIVE);
      expect(prisma.user.updateMany).toHaveBeenCalledWith({
        where: {
          organizationId: mockPendingPiaOrg.id,
        },
        data: { isActive: true },
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'APPROVE_ORGANIZATION',
          }),
        }),
      );
    });

    it('should reject approval if organization is not PENDING_APPROVAL', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg); // ALREADY ACTIVE

      await expect(
        service.approvePia(
          mockOrg.id,
          { remarks: 'Invalid call' },
          'admin-actor-1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('rejectPia', () => {
    it('should transition PENDING_APPROVAL organization to REJECTED and record reason', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockPendingPiaOrg);
      prisma.organization.update.mockResolvedValue({
        ...mockPendingPiaOrg,
        status: OrganizationStatus.REJECTED,
      });

      const result = await service.rejectPia(
        mockPendingPiaOrg.id,
        { rejectionReason: 'Corporate CIN does not match registry.' },
        'admin-actor-1',
      );

      expect(result.status).toBe(OrganizationStatus.REJECTED);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'REJECT_ORGANIZATION',
          }),
        }),
      );
    });
  });

  describe('suspend / activate', () => {
    it('should suspend an active organization', async () => {
      prisma.organization.findUnique.mockResolvedValue(mockOrg);
      prisma.organization.update.mockResolvedValue({
        ...mockOrg,
        status: OrganizationStatus.SUSPENDED,
      });

      const result = await service.suspend(
        mockOrg.id,
        { suspensionReason: 'Pending audit query.' },
        'admin-actor-1',
      );

      expect(result.status).toBe(OrganizationStatus.SUSPENDED);
    });

    it('should reactivate a suspended organization', async () => {
      prisma.organization.findUnique.mockResolvedValue({
        ...mockOrg,
        status: OrganizationStatus.SUSPENDED,
      });
      prisma.organization.update.mockResolvedValue({
        ...mockOrg,
        status: OrganizationStatus.ACTIVE,
      });

      const result = await service.activate(
        mockOrg.id,
        'admin-actor-1',
      );

      expect(result.status).toBe(OrganizationStatus.ACTIVE);
    });
  });
});
