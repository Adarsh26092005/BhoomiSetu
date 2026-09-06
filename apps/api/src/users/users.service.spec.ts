import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { AccountType, UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { PrismaService } from '../database/prisma.service';

describe('UsersService (Unit)', () => {
  let service: UsersService;
  let prisma: any;

  const mockUser = {
    id: 'user-officer-1',
    email: 'officer@nlams.gov.in',
    passwordHash: '$2b$12$somehashedpasswordstring',
    fullName: 'Arun Varma',
    phone: '+91-9876543210',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.LAND_ACQUISITION_OFFICER,
    designation: 'Sub-Divisional Magistrate & LAO',
    organizationId: 'org-district-1',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
    organization: {
      id: 'org-district-1',
      name: 'District Collectorate Pune',
      code: 'DIST-PUNE-01',
      type: 'DISTRICT_AUTHORITY',
      status: 'ACTIVE',
      state: 'Maharashtra',
      district: 'Pune',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    },
    projectAssignments: [],
  };

  const mockPiaUser = {
    id: 'user-pia-1',
    email: 'liaison@nhinfra.co.in',
    passwordHash: '$2b$12$somehashedpasswordstring',
    fullName: 'Rajesh Sharma',
    phone: '+91-9123456780',
    accountType: AccountType.PIA_USER,
    role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
    designation: 'Operations Lead',
    organizationId: 'org-pia-1',
    avatarUrl: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-04'),
    organization: {
      id: 'org-pia-1',
      name: 'National Highways Infra Projects Pvt Ltd',
      code: 'PIA-NHAI-001',
      type: 'PROJECT_IMPLEMENTING_AGENCY',
      status: 'ACTIVE',
      state: 'Maharashtra',
      district: 'Mumbai Suburban',
      isActive: true,
      createdAt: new Date('2026-09-01'),
      updatedAt: new Date('2026-09-04'),
    },
    projectAssignments: [],
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      organization: {
        findUnique: jest.fn(),
      },
      project: {
        findUnique: jest.fn(),
      },
      projectAssignment: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      authSession: {
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
      auditLog: {
        create: jest.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      $transaction: jest.fn((cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users excluding password hashes', async () => {
      prisma.user.count.mockResolvedValue(1);
      prisma.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].email).toBe(mockUser.email);
      expect((result.items[0] as any).passwordHash).toBeUndefined();
    });
  });

  describe('findOne', () => {
    it('should return user details and active project assignments', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(mockUser.id);
      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw NotFoundException if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-user')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create (Security Boundaries)', () => {
    it('should create government officer when called by authorized admin', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.organization.findUnique.mockResolvedValue({ id: 'org-district-1' });
      prisma.user.create.mockResolvedValue(mockUser);

      const result = await service.create(
        {
          email: 'officer@nlams.gov.in',
          password: 'SecureOfficerPassword123!',
          fullName: 'Arun Varma',
          designation: 'Sub-Divisional Magistrate & LAO',
          role: UserRole.LAND_ACQUISITION_OFFICER,
          accountType: AccountType.GOVERNMENT_OFFICER,
          organizationId: 'org-district-1',
        },
        'superadmin-id',
        UserRole.SUPER_ADMIN,
        AccountType.GOVERNMENT_OFFICER,
        'org-central-1',
      );

      expect(result.email).toBe(mockUser.email);
      expect((result as any).passwordHash).toBeUndefined();
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'CREATE_USER' }),
        }),
      );
    });

    it('should forbid PIA user from creating Government Officer accounts', async () => {
      await expect(
        service.create(
          {
            email: 'fakegov@nlams.gov.in',
            password: 'Password123!',
            fullName: 'Fake Gov',
            designation: 'Secretary',
            role: UserRole.CENTRAL_OFFICER,
            accountType: AccountType.GOVERNMENT_OFFICER,
            organizationId: 'org-central-1',
          },
          'pia-actor-id',
          UserRole.PROJECT_IMPLEMENTING_AGENCY,
          AccountType.PIA_USER,
          'org-pia-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid PIA user from creating users in another organization', async () => {
      await expect(
        service.create(
          {
            email: 'subliaison@otherpia.com',
            password: 'Password123!',
            fullName: 'Other User',
            designation: 'Engineer',
            role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
            accountType: AccountType.PIA_USER,
            organizationId: 'org-pia-DIFFERENT',
          },
          'pia-actor-id',
          UserRole.PROJECT_IMPLEMENTING_AGENCY,
          AccountType.PIA_USER,
          'org-pia-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should forbid PIA user from assigning non-PIA / government roles', async () => {
      await expect(
        service.create(
          {
            email: 'subliaison@nhinfra.co.in',
            password: 'Password123!',
            fullName: 'Other User',
            designation: 'Officer',
            role: UserRole.LAND_ACQUISITION_OFFICER, // Government role
            accountType: AccountType.PIA_USER,
            organizationId: 'org-pia-1',
          },
          'pia-actor-id',
          UserRole.PROJECT_IMPLEMENTING_AGENCY,
          AccountType.PIA_USER,
          'org-pia-1',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deactivate (Session Revocation & Auditing)', () => {
    it('should deactivate user and revoke active auth sessions', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await service.deactivate(mockUser.id, 'admin-actor-1');

      expect(result.isActive).toBe(false);
      expect(prisma.authSession.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'DEACTIVATE_USER' }),
        }),
      );
    });
  });

  describe('project assignments', () => {
    it('should assign a user to a project using ProjectAssignment model', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      prisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        code: 'NH-66-EXP',
        title: 'Mumbai-Goa Highway Expansion',
      });
      prisma.projectAssignment.upsert.mockResolvedValue({
        id: 'pa-1',
        projectId: 'proj-1',
        userId: mockUser.id,
        role: UserRole.LAND_ACQUISITION_OFFICER,
        assignedById: 'admin-actor-1',
        isActive: true,
        assignedAt: new Date('2026-09-04'),
        project: {
          id: 'proj-1',
          code: 'NH-66-EXP',
          title: 'Mumbai-Goa Highway Expansion',
          status: 'IN_PROGRESS',
          state: 'Maharashtra',
        },
      });

      const result = await service.assignToProject(
        mockUser.id,
        {
          projectId: 'proj-1',
          role: UserRole.LAND_ACQUISITION_OFFICER,
        },
        'admin-actor-1',
      );

      expect(result.id).toBe('pa-1');
      expect(result.projectId).toBe('proj-1');
      expect(result.role).toBe(UserRole.LAND_ACQUISITION_OFFICER);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'ASSIGN_PROJECT_USER' }),
        }),
      );
    });

    it('should deactivate an active project assignment', async () => {
      prisma.projectAssignment.findUnique.mockResolvedValue({
        id: 'pa-1',
        userId: mockUser.id,
        projectId: 'proj-1',
        role: UserRole.LAND_ACQUISITION_OFFICER,
        isActive: true,
      });
      prisma.projectAssignment.update.mockResolvedValue({
        id: 'pa-1',
        userId: mockUser.id,
        projectId: 'proj-1',
        role: UserRole.LAND_ACQUISITION_OFFICER,
        isActive: false,
        assignedById: 'admin-actor-1',
        assignedAt: new Date('2026-09-04'),
        project: null,
      });

      const result = await service.deactivateProjectAssignment(
        mockUser.id,
        'pa-1',
        'admin-actor-1',
      );

      expect(result.isActive).toBe(false);
      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ action: 'UPDATE_PROJECT_ASSIGNMENT' }),
        }),
      );
    });
  });
});
