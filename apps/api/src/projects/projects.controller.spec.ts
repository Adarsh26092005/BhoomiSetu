import { Test, TestingModule } from '@nestjs/testing';
import { AccountType, ProjectCategory, ProjectStatus, UserRole } from '@prisma/client';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: any;

  const mockUser: AuthenticatedUser = {
    id: 'user-admin-1',
    email: 'admin@nlams.gov.in',
    fullName: 'System Administrator',
    accountType: AccountType.GOVERNMENT_OFFICER,
    role: UserRole.SUPER_ADMIN,
    designation: 'Principal Secretary',
    organizationId: 'org-central-1',
    isActive: true,
  };

  const mockProject = {
    id: 'proj-1',
    code: 'NHAI-BCE-PH2',
    title: 'Bangalore–Chennai Expressway Phase 2',
    category: ProjectCategory.HIGHWAY,
    status: ProjectStatus.DRAFT,
    implementingAgencyOrgId: 'org-pia-1',
    state: 'Karnataka',
    districts: ['Bengaluru Rural', 'Kolar'],
    totalAreaHectares: 350.5,
    estimatedCompensationInr: 1500000000,
    disbursedCompensationInr: 0,
    isActive: true,
    parcelCount: 142,
    documentCount: 24,
    workflowTaskCount: 8,
    affectedHouseholdCount: 320,
    assignments: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockProjectsService = {
      create: jest.fn().mockResolvedValue(mockProject),
      findAll: jest.fn().mockResolvedValue({
        items: [mockProject],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
      findOne: jest.fn().mockResolvedValue(mockProject),
      update: jest.fn().mockResolvedValue({ ...mockProject, title: 'Updated Title' }),
      updateStatus: jest.fn().mockResolvedValue({ ...mockProject, status: ProjectStatus.SUBMITTED }),
      getSummary: jest.fn().mockResolvedValue({
        totalProjects: 1,
        inStatutoryProcess: 1,
        completedHandover: 0,
        totalAreaHectares: 350.5,
        totalEstimatedCompensationInr: 1500000000,
        totalDisbursedCompensationInr: 0,
      }),
      getActivity: jest.fn().mockResolvedValue([]),
      getAssignments: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [{ provide: ProjectsService, useValue: mockProjectsService }],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a project proposal', async () => {
    const dto = {
      code: 'NHAI-BCE-PH2',
      title: 'Bangalore–Chennai Expressway Phase 2',
      state: 'Karnataka',
      districts: ['Bengaluru Rural'],
    };

    const result = await controller.create(dto, mockUser);
    expect(result).toBeDefined();
    expect(service.create).toHaveBeenCalledWith(dto, mockUser);
  });

  it('should retrieve paginated projects list', async () => {
    const query = { page: 1, limit: 20 };
    const result = await controller.findAll(query, mockUser);

    expect(result.items).toHaveLength(1);
    expect(service.findAll).toHaveBeenCalledWith(query, mockUser);
  });

  it('should get project details by ID', async () => {
    const result = await controller.findOne('proj-1', mockUser);
    expect(result.id).toBe('proj-1');
    expect(service.findOne).toHaveBeenCalledWith('proj-1', mockUser);
  });

  it('should update project status', async () => {
    const dto = { status: ProjectStatus.SUBMITTED, remarks: 'Submitted' };
    const result = await controller.updateStatus('proj-1', dto, mockUser);

    expect(result.status).toBe(ProjectStatus.SUBMITTED);
    expect(service.updateStatus).toHaveBeenCalledWith('proj-1', dto, mockUser);
  });

  it('should get summary KPIs', async () => {
    const result = await controller.getSummary(mockUser);
    expect(result.totalProjects).toBe(1);
    expect(service.getSummary).toHaveBeenCalledWith(mockUser);
  });
});
