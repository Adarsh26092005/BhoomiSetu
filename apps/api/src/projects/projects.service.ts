import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import {
  AccountType,
  OrganizationType,
  Prisma,
  ProjectCategory,
  ProjectStatus,
  UserRole,
  WorkflowPriority,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { WorkflowService } from '../workflow/workflow.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import {
  PaginatedProjectsResponseDto,
  ProjectDetailResponseDto,
  ProjectResponseDto,
  ProjectSummaryKpiDto,
} from './dto/project-response.dto';

// Centralized Canonical 17-Stage Transition Rules
const ALLOWED_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.DRAFT]: [
    ProjectStatus.SUBMITTED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.SUBMITTED]: [
    ProjectStatus.UNDER_SCRUTINY,
    ProjectStatus.DOCUMENT_VERIFICATION,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.UNDER_SCRUTINY]: [
    ProjectStatus.DOCUMENT_VERIFICATION,
    ProjectStatus.DISTRICT_APPROVAL,
    ProjectStatus.STATE_APPROVAL,
    ProjectStatus.CENTRAL_APPROVAL,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.DOCUMENT_VERIFICATION]: [
    ProjectStatus.DISTRICT_APPROVAL,
    ProjectStatus.STATE_APPROVAL,
    ProjectStatus.CENTRAL_APPROVAL,
    ProjectStatus.NOTIFICATION_ISSUED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.DISTRICT_APPROVAL]: [
    ProjectStatus.STATE_APPROVAL,
    ProjectStatus.CENTRAL_APPROVAL,
    ProjectStatus.NOTIFICATION_ISSUED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.STATE_APPROVAL]: [
    ProjectStatus.CENTRAL_APPROVAL,
    ProjectStatus.NOTIFICATION_ISSUED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.CENTRAL_APPROVAL]: [
    ProjectStatus.NOTIFICATION_ISSUED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.NOTIFICATION_ISSUED]: [
    ProjectStatus.AWARD_DECLARED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.AWARD_DECLARED]: [
    ProjectStatus.COMPENSATION_ASSESSED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.COMPENSATION_ASSESSED]: [
    ProjectStatus.COMPENSATION_DISBURSED,
    ProjectStatus.POSSESSION_PENDING,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.COMPENSATION_DISBURSED]: [
    ProjectStatus.POSSESSION_PENDING,
    ProjectStatus.POSSESSION_COMPLETED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.POSSESSION_PENDING]: [
    ProjectStatus.POSSESSION_COMPLETED,
    ProjectStatus.REJECTED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.POSSESSION_COMPLETED]: [
    ProjectStatus.R_AND_R_IN_PROGRESS,
    ProjectStatus.COMPLETED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.R_AND_R_IN_PROGRESS]: [
    ProjectStatus.COMPLETED,
    ProjectStatus.ON_HOLD,
  ],
  [ProjectStatus.ON_HOLD]: [
    ProjectStatus.DRAFT,
    ProjectStatus.SUBMITTED,
    ProjectStatus.UNDER_SCRUTINY,
    ProjectStatus.DOCUMENT_VERIFICATION,
    ProjectStatus.DISTRICT_APPROVAL,
    ProjectStatus.STATE_APPROVAL,
    ProjectStatus.CENTRAL_APPROVAL,
    ProjectStatus.NOTIFICATION_ISSUED,
    ProjectStatus.AWARD_DECLARED,
    ProjectStatus.COMPENSATION_ASSESSED,
    ProjectStatus.COMPENSATION_DISBURSED,
    ProjectStatus.POSSESSION_PENDING,
    ProjectStatus.POSSESSION_COMPLETED,
    ProjectStatus.R_AND_R_IN_PROGRESS,
    ProjectStatus.REJECTED,
  ],
  [ProjectStatus.REJECTED]: [ProjectStatus.DRAFT],
  [ProjectStatus.COMPLETED]: [],
};

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jurisdictionService: JurisdictionService,
    @Optional() private readonly workflowService?: WorkflowService,
  ) {}

  // ============================================================================
  // 1. LIST PROJECTS (Multi-Tenant & Geographical Scoping)
  // ============================================================================

  async findAll(
    query: ProjectQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedProjectsResponseDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const scopeWhere = this.jurisdictionService.buildProjectWhere(scope);

    const where: Prisma.ProjectWhereInput = {
      AND: [scopeWhere],
    };

    const andConditions: Prisma.ProjectWhereInput[] = [];

    if (query.status) {
      andConditions.push({ status: query.status });
    }

    if (query.category) {
      andConditions.push({ category: query.category });
    }

    if (query.state) {
      andConditions.push({ state: { contains: query.state, mode: 'insensitive' } });
    }

    if (query.district) {
      andConditions.push({
        districts: {
          array_contains: query.district,
        },
      });
    }

    if (query.implementingAgencyOrgId) {
      if (
        actor.accountType === AccountType.PIA_USER &&
        query.implementingAgencyOrgId !== actor.organizationId
      ) {
        throw new ForbiddenException(
          'Implementing Agency users cannot query other organizations projects',
        );
      }
      andConditions.push({ implementingAgencyOrgId: query.implementingAgencyOrgId });
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      andConditions.push({
        OR: [
          { title: { contains: searchTerm, mode: 'insensitive' } },
          { code: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    if (andConditions.length > 0) {
      (where.AND as Prisma.ProjectWhereInput[]).push(...andConditions);
    }

    // Determine Sort Field
    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'title',
      'code',
      'totalAreaHectares',
      'estimatedCompensationInr',
    ];
    const sortBy = allowedSortFields.includes(query.sortBy || '') ? query.sortBy! : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      this.prisma.project.count({ where }),
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: sortOrder }],
        include: {
          implementingAgencyOrg: {
            select: {
              id: true,
              name: true,
              code: true,
              state: true,
              district: true,
            },
          },
          _count: {
            select: {
              parcels: true,
              documents: true,
              workflowTasks: true,
              affectedHouseholds: true,
            },
          },
        },
      }),
    ]);

    const mappedItems: ProjectResponseDto[] = items.map((p) => this.mapToProjectResponse(p));

    return {
      items: mappedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // ============================================================================
  // 2. GET PROJECT DETAILS (Direct Access Security Validation)
  // ============================================================================

  async findOne(id: string, actor: AuthenticatedUser): Promise<ProjectDetailResponseDto> {
    const actorOrg = await this.getActorOrganization(actor.organizationId);

    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        implementingAgencyOrg: {
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
            district: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            parcels: true,
            documents: true,
            workflowTasks: true,
            affectedHouseholds: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    // Enforce Boundary Check
    await this.assertProjectAccess(project, actor, actorOrg);

    return this.mapToProjectDetailResponse(project);
  }

  // ============================================================================
  // 3. CREATE PROJECT
  // ============================================================================

  async create(dto: CreateProjectDto, actor: AuthenticatedUser): Promise<ProjectDetailResponseDto> {
    if (actor.role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers are not authorized to create projects');
    }

    const actorOrg = await this.getActorOrganization(actor.organizationId);

    // Validate Unique Code
    const existingCode = await this.prisma.project.findUnique({
      where: { code: dto.code.trim() },
    });
    if (existingCode) {
      throw new ConflictException(`A project with code "${dto.code}" already exists`);
    }

    // Determine Implementing Agency
    let implementingAgencyOrgId: string;
    if (actor.accountType === AccountType.PIA_USER) {
      implementingAgencyOrgId = actor.organizationId;
    } else {
      implementingAgencyOrgId = dto.implementingAgencyOrgId || actor.organizationId;
    }

    // Verify Implementing Agency exists and is active
    const targetAgency = await this.prisma.organization.findUnique({
      where: { id: implementingAgencyOrgId },
    });
    if (!targetAgency) {
      throw new BadRequestException(
        `Implementing Agency organization "${implementingAgencyOrgId}" does not exist`,
      );
    }
    if (!targetAgency.isActive) {
      throw new BadRequestException(
        `Implementing Agency organization "${targetAgency.name}" is not active`,
      );
    }

    // Validate Geographical Jurisdiction Scope for Creator
    if (actor.accountType === AccountType.GOVERNMENT_OFFICER) {
      if (
        actorOrg.type === OrganizationType.STATE_AUTHORITY ||
        actor.role === UserRole.STATE_OFFICER
      ) {
        if (actorOrg.state && dto.state.toLowerCase() !== actorOrg.state.toLowerCase()) {
          throw new ForbiddenException(
            `State Officers can only initiate projects within ${actorOrg.state}`,
          );
        }
      } else if (
        actorOrg.type === OrganizationType.DISTRICT_AUTHORITY ||
        actor.role === UserRole.DISTRICT_OFFICER
      ) {
        if (actorOrg.state && dto.state.toLowerCase() !== actorOrg.state.toLowerCase()) {
          throw new ForbiddenException(
            `District Officers can only initiate projects within ${actorOrg.state}`,
          );
        }
        if (
          actorOrg.district &&
          !dto.districts.some((d) => d.toLowerCase() === actorOrg.district!.toLowerCase())
        ) {
          throw new ForbiddenException(
            `District Officers must include their assigned district (${actorOrg.district})`,
          );
        }
      }
    }

    const created = await this.prisma.project.create({
      data: {
        code: dto.code.trim(),
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        category: dto.category || ProjectCategory.HIGHWAY,
        status: dto.status || ProjectStatus.DRAFT,
        implementingAgencyOrgId,
        state: dto.state.trim(),
        districts: dto.districts,
        totalAreaHectares: dto.totalAreaHectares !== undefined ? dto.totalAreaHectares : 0.0,
        estimatedCompensationInr:
          dto.estimatedCompensationInr !== undefined ? dto.estimatedCompensationInr : 0.0,
        spatialBounds: dto.spatialBounds || Prisma.JsonNull,
        notifiedOn: dto.notifiedOn ? new Date(dto.notifiedOn) : null,
        targetCompletionOn: dto.targetCompletionOn ? new Date(dto.targetCompletionOn) : null,
        metadata: dto.metadata || Prisma.JsonNull,
        isActive: true,
      },
      include: {
        implementingAgencyOrg: {
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
            district: true,
          },
        },
        assignments: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        _count: {
          select: {
            parcels: true,
            documents: true,
            workflowTasks: true,
            affectedHouseholds: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId: actor.id,
      action: 'CREATE_PROJECT',
      entityType: 'Project',
      entityId: created.id,
      organizationId: created.implementingAgencyOrgId,
      newState: {
        code: created.code,
        title: created.title,
        status: created.status,
        state: created.state,
        districts: created.districts,
      },
    });

    this.logger.log(`Project "${created.title}" (${created.code}) created by actor ${actor.id}`);

    if (created.status === ProjectStatus.SUBMITTED && this.workflowService) {
      try {
        await this.workflowService.createRoutedTask({
          projectId: created.id,
          projectTitle: created.title,
          projectCode: created.code,
          projectState: created.state,
          projectDistricts: created.districts as string[],
          currentStage: ProjectStatus.SUBMITTED,
          targetStage: ProjectStatus.UNDER_SCRUTINY,
          taskType: 'SCRUTINY',
          title: `Statutory Preliminary Scrutiny — ${created.code}`,
          description: `Conduct Section 4 SIA / DPR preliminary boundary review for project ${created.title}`,
          preferredRole: UserRole.LAND_ACQUISITION_OFFICER,
          slaDays: 7,
          priority: WorkflowPriority.HIGH,
        });
      } catch (err) {
        this.logger.warn(`Could not automatically route scrutiny task for project ${created.id}: ${err}`);
      }
    }

    return this.mapToProjectDetailResponse(created);
  }

  // ============================================================================
  // 4. UPDATE PROJECT
  // ============================================================================

  async update(
    id: string,
    dto: UpdateProjectDto,
    actor: AuthenticatedUser,
  ): Promise<ProjectDetailResponseDto> {
    if (actor.role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers are not authorized to modify projects');
    }

    const actorOrg = await this.getActorOrganization(actor.organizationId);
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    await this.assertProjectAccess(existing, actor, actorOrg);

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title ? dto.title.trim() : existing.title,
        description: dto.description !== undefined ? dto.description : existing.description,
        category: dto.category || existing.category,
        state: dto.state ? dto.state.trim() : existing.state,
        districts: dto.districts !== undefined ? dto.districts : (existing.districts as any),
        totalAreaHectares:
          dto.totalAreaHectares !== undefined
            ? dto.totalAreaHectares
            : existing.totalAreaHectares,
        estimatedCompensationInr:
          dto.estimatedCompensationInr !== undefined
            ? dto.estimatedCompensationInr
            : existing.estimatedCompensationInr,
        spatialBounds:
          dto.spatialBounds !== undefined
            ? dto.spatialBounds
            : (existing.spatialBounds as any),
        notifiedOn: dto.notifiedOn ? new Date(dto.notifiedOn) : existing.notifiedOn,
        targetCompletionOn: dto.targetCompletionOn
          ? new Date(dto.targetCompletionOn)
          : existing.targetCompletionOn,
        metadata: dto.metadata !== undefined ? dto.metadata : (existing.metadata as any),
      },
      include: {
        implementingAgencyOrg: {
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
            district: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        _count: {
          select: {
            parcels: true,
            documents: true,
            workflowTasks: true,
            affectedHouseholds: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId: actor.id,
      action: 'UPDATE_PROJECT',
      entityType: 'Project',
      entityId: id,
      organizationId: updated.implementingAgencyOrgId,
      previousState: {
        title: existing.title,
        category: existing.category,
        state: existing.state,
      },
      newState: {
        title: updated.title,
        category: updated.category,
        state: updated.state,
      },
    });

    return this.mapToProjectDetailResponse(updated);
  }

  // ============================================================================
  // 5. CONTROLLED STATUS TRANSITIONS
  // ============================================================================

  async updateStatus(
    id: string,
    dto: UpdateProjectStatusDto,
    actor: AuthenticatedUser,
  ): Promise<ProjectDetailResponseDto> {
    if (actor.role === UserRole.VIEWER) {
      throw new ForbiddenException('Viewers are not authorized to change project status');
    }

    const actorOrg = await this.getActorOrganization(actor.organizationId);
    const existing = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    await this.assertProjectAccess(existing, actor, actorOrg);

    const currentStatus = existing.status;
    const targetStatus = dto.status;

    if (currentStatus === targetStatus) {
      throw new BadRequestException(`Project is already in status "${currentStatus}"`);
    }

    // 1. Validate State Machine Graph
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from "${currentStatus}" to "${targetStatus}". ` +
          `Allowed transitions: [${allowed.join(', ')}]`,
      );
    }

    // 2. Validate Role-Specific Transition Authority
    this.assertStatusTransitionAuthority(currentStatus, targetStatus, actor, actorOrg);

    // 3. Validate Required Remarks for Rejection / Hold
    if (targetStatus === ProjectStatus.REJECTED && !dto.rejectionReason && !dto.remarks) {
      throw new BadRequestException(
        'Rejection reason or remarks are mandatory when rejecting a statutory project proposal',
      );
    }

    if (targetStatus === ProjectStatus.ON_HOLD && !dto.holdReason && !dto.remarks) {
      throw new BadRequestException(
        'Hold reason or remarks are mandatory when placing a project on administrative hold',
      );
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data: {
        status: targetStatus,
      },
      include: {
        implementingAgencyOrg: {
          select: {
            id: true,
            name: true,
            code: true,
            state: true,
            district: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
        _count: {
          select: {
            parcels: true,
            documents: true,
            workflowTasks: true,
            affectedHouseholds: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId: actor.id,
      action: 'UPDATE_PROJECT_STATUS',
      entityType: 'Project',
      entityId: id,
      organizationId: updated.implementingAgencyOrgId,
      previousState: { status: currentStatus },
      newState: {
        status: targetStatus,
        remarks: dto.remarks || null,
        rejectionReason: dto.rejectionReason || null,
        holdReason: dto.holdReason || null,
      },
    });

    this.logger.log(
      `Project "${existing.title}" status changed: ${currentStatus} -> ${targetStatus} by actor ${actor.id}`,
    );

    // Trigger automated task routing on lifecycle milestone transitions
    if (this.workflowService) {
      try {
        if (targetStatus === ProjectStatus.SUBMITTED) {
          await this.workflowService.createRoutedTask({
            projectId: id,
            projectTitle: existing.title,
            projectCode: existing.code,
            projectState: existing.state,
            projectDistricts: existing.districts as string[],
            currentStage: ProjectStatus.SUBMITTED,
            targetStage: ProjectStatus.UNDER_SCRUTINY,
            taskType: 'SCRUTINY',
            title: `Statutory Preliminary Scrutiny — ${existing.code}`,
            description: `Conduct Section 4 SIA / DPR preliminary boundary review for project ${existing.title}`,
            preferredRole: UserRole.LAND_ACQUISITION_OFFICER,
            slaDays: 7,
            priority: WorkflowPriority.HIGH,
          });
        } else if (targetStatus === ProjectStatus.UNDER_SCRUTINY) {
          // Spawn specialist tasks
          await Promise.allSettled([
            this.workflowService.createRoutedTask({
              projectId: id,
              projectTitle: existing.title,
              projectCode: existing.code,
              projectState: existing.state,
              projectDistricts: existing.districts as string[],
              currentStage: ProjectStatus.UNDER_SCRUTINY,
              targetStage: ProjectStatus.DOCUMENT_VERIFICATION,
              taskType: 'DOCUMENT_VERIFICATION',
              title: `Cadastral & Title Document Verification — ${existing.code}`,
              description: `Verify ownership titles, revenue records, and gazette notifications for ${existing.title}`,
              preferredRole: UserRole.VERIFICATION_OFFICER,
              slaDays: 14,
              priority: WorkflowPriority.MEDIUM,
            }),
            this.workflowService.createRoutedTask({
              projectId: id,
              projectTitle: existing.title,
              projectCode: existing.code,
              projectState: existing.state,
              projectDistricts: existing.districts as string[],
              currentStage: ProjectStatus.UNDER_SCRUTINY,
              taskType: 'SURVEY_VERIFICATION',
              title: `Cadastral Survey & Boundary Verification — ${existing.code}`,
              description: `Perform field survey and verify GIS spatial boundaries for ${existing.title}`,
              preferredRole: UserRole.SURVEY_OFFICER,
              slaDays: 14,
              priority: WorkflowPriority.MEDIUM,
            }),
            this.workflowService.createRoutedTask({
              projectId: id,
              projectTitle: existing.title,
              projectCode: existing.code,
              projectState: existing.state,
              projectDistricts: existing.districts as string[],
              currentStage: ProjectStatus.UNDER_SCRUTINY,
              taskType: 'REVENUE_VERIFICATION',
              title: `Revenue Record & Landowner Verification — ${existing.code}`,
              description: `Verify Record of Rights (RoR) and title authenticity for ${existing.title}`,
              preferredRole: UserRole.REVENUE_OFFICER,
              slaDays: 14,
              priority: WorkflowPriority.MEDIUM,
            }),
          ]);
        } else if (targetStatus === ProjectStatus.DOCUMENT_VERIFICATION) {
          await this.workflowService.createRoutedTask({
            projectId: id,
            projectTitle: existing.title,
            projectCode: existing.code,
            projectState: existing.state,
            projectDistricts: existing.districts as string[],
            currentStage: ProjectStatus.DOCUMENT_VERIFICATION,
            targetStage: ProjectStatus.DISTRICT_APPROVAL,
            taskType: 'DISTRICT_APPROVAL',
            title: `Collectorate Statutory Clearance — ${existing.code}`,
            description: `Review verified records and accord Section 11/15 statutory clearance for ${existing.title}`,
            preferredRole: UserRole.DISTRICT_OFFICER,
            slaDays: 14,
            priority: WorkflowPriority.HIGH,
          });
        } else if (targetStatus === ProjectStatus.AWARD_DECLARED) {
          await this.workflowService.createRoutedTask({
            projectId: id,
            projectTitle: existing.title,
            projectCode: existing.code,
            projectState: existing.state,
            projectDistricts: existing.districts as string[],
            currentStage: ProjectStatus.AWARD_DECLARED,
            targetStage: ProjectStatus.COMPENSATION_ASSESSED,
            taskType: 'COMPENSATION_ASSESSMENT',
            title: `Statutory Compensation Assessment Determination — ${existing.code}`,
            description: `Calculate solatium, market value, and determine individual awards for ${existing.title}`,
            preferredRole: UserRole.FINANCE_OFFICER,
            slaDays: 21,
            priority: WorkflowPriority.HIGH,
          });
        } else if (targetStatus === ProjectStatus.COMPENSATION_ASSESSED) {
          await this.workflowService.createRoutedTask({
            projectId: id,
            projectTitle: existing.title,
            projectCode: existing.code,
            projectState: existing.state,
            projectDistricts: existing.districts as string[],
            currentStage: ProjectStatus.COMPENSATION_ASSESSED,
            targetStage: ProjectStatus.COMPENSATION_DISBURSED,
            taskType: 'COMPENSATION_DISBURSEMENT',
            title: `PFMS Direct Benefit Disbursement — ${existing.code}`,
            description: `Execute direct treasury disbursement to verified landholders for ${existing.title}`,
            preferredRole: UserRole.FINANCE_OFFICER,
            slaDays: 14,
            priority: WorkflowPriority.HIGH,
          });
        } else if (targetStatus === ProjectStatus.COMPENSATION_DISBURSED) {
          await this.workflowService.createRoutedTask({
            projectId: id,
            projectTitle: existing.title,
            projectCode: existing.code,
            projectState: existing.state,
            projectDistricts: existing.districts as string[],
            currentStage: ProjectStatus.COMPENSATION_DISBURSED,
            targetStage: ProjectStatus.POSSESSION_COMPLETED,
            taskType: 'POSSESSION',
            title: `Section 38 Statutory Land Handover & Panchnama — ${existing.code}`,
            description: `Conduct physical site possession and execute panchnama handover for ${existing.title}`,
            preferredRole: UserRole.LAND_ACQUISITION_OFFICER,
            slaDays: 30,
            priority: WorkflowPriority.MEDIUM,
          });
        }
      } catch (err) {
        this.logger.warn(`Could not automatically route workflow task on status change: ${err}`);
      }
    }

    return this.mapToProjectDetailResponse(updated);
  }

  // ============================================================================
  // 6. SCOPED SUMMARY KPIS
  // ============================================================================

  async getSummary(actor: AuthenticatedUser): Promise<ProjectSummaryKpiDto> {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const scopeWhere = this.jurisdictionService.buildProjectWhere(scope);

    const projects = await this.prisma.project.findMany({
      where: scopeWhere,
      select: {
        status: true,
        totalAreaHectares: true,
        estimatedCompensationInr: true,
        disbursedCompensationInr: true,
      },
    });

    const totalProjects = projects.length;
    let inStatutoryProcess = 0;
    let completedHandover = 0;
    let totalAreaHectares = 0;
    let totalEstimatedCompensationInr = 0;
    let totalDisbursedCompensationInr = 0;

    for (const p of projects) {
      if (p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.REJECTED) {
        inStatutoryProcess++;
      }
      if (
        p.status === ProjectStatus.POSSESSION_COMPLETED ||
        p.status === ProjectStatus.COMPLETED
      ) {
        completedHandover++;
      }
      totalAreaHectares += Number(p.totalAreaHectares) || 0;
      totalEstimatedCompensationInr += Number(p.estimatedCompensationInr) || 0;
      totalDisbursedCompensationInr += Number(p.disbursedCompensationInr) || 0;
    }

    return {
      totalProjects,
      inStatutoryProcess,
      completedHandover,
      totalAreaHectares: Math.round(totalAreaHectares * 100) / 100,
      totalEstimatedCompensationInr: Math.round(totalEstimatedCompensationInr * 100) / 100,
      totalDisbursedCompensationInr: Math.round(totalDisbursedCompensationInr * 100) / 100,
    };
  }

  // ============================================================================
  // 7. PROJECT ACTIVITY STREAM (Audit Logs)
  // ============================================================================

  async getActivity(id: string, actor: AuthenticatedUser): Promise<any[]> {
    const actorOrg = await this.getActorOrganization(actor.organizationId);
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    await this.assertProjectAccess(project, actor, actorOrg);

    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType: 'Project',
        entityId: id,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 50,
      include: {
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      actorName: log.actor?.fullName || 'System Automated Process',
      actorRole: log.actor?.role || 'SYSTEM',
      previousState: log.previousState,
      newState: log.newState,
      createdAt: log.createdAt,
    }));
  }

  // ============================================================================
  // 8. PROJECT ASSIGNMENTS
  // ============================================================================

  async getAssignments(id: string, actor: AuthenticatedUser) {
    const actorOrg = await this.getActorOrganization(actor.organizationId);
    const project = await this.prisma.project.findUnique({ where: { id } });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    await this.assertProjectAccess(project, actor, actorOrg);

    const assignments = await this.prisma.projectAssignment.findMany({
      where: { projectId: id, isActive: true },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            designation: true,
            role: true,
            organization: { select: { id: true, name: true, type: true } },
          },
        },
      },
    });

    return assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      user: a.user,
      role: a.role,
      assignedAt: a.assignedAt,
      isActive: a.isActive,
    }));
  }

  // ============================================================================
  // HELPER: BUILD MULTI-TENANT & GEOGRAPHICAL SCOPE FILTER
  // ============================================================================

  private async buildScopeFilter(
    actor: AuthenticatedUser,
    actorOrg?: any,
  ): Promise<Prisma.ProjectWhereInput> {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    return this.jurisdictionService.buildProjectWhere(scope);
  }

  // ============================================================================
  // HELPER: ASSERT DIRECT PROJECT ACCESS (Security Guard)
  // ============================================================================

  private async assertProjectAccess(
    project: any,
    actor: AuthenticatedUser,
    actorOrg?: any,
  ): Promise<void> {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessProject(scope, project)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to access this project',
      );
    }
  }

  // ============================================================================
  // HELPER: STATUS TRANSITION AUTHORITY MATRIX
  // ============================================================================

  private assertStatusTransitionAuthority(
    fromStatus: ProjectStatus,
    toStatus: ProjectStatus,
    actor: AuthenticatedUser,
    actorOrg: any,
  ): void {
    const isPiaActor =
      actor.accountType === AccountType.PIA_USER ||
      actor.role === UserRole.PROJECT_IMPLEMENTING_AGENCY;

    // 1. Strict PIA Enforcement:
    // PIA accounts are purely applicants. They can only submit DRAFT -> SUBMITTED
    // or withdraw/hold their draft (DRAFT -> ON_HOLD).
    // All post-SUBMITTED government statutory transitions are strictly 403 Forbidden.
    if (isPiaActor) {
      if (
        fromStatus === ProjectStatus.DRAFT &&
        (toStatus === ProjectStatus.SUBMITTED || toStatus === ProjectStatus.ON_HOLD)
      ) {
        return;
      }
      throw new ForbiddenException(
        'Forbidden: Project Implementing Agency accounts cannot execute statutory government lifecycle transitions.',
      );
    }

    // 2. Submission by Government / Admin
    if (toStatus === ProjectStatus.SUBMITTED) {
      return;
    }

    // 3. Preliminary Scrutiny
    if (toStatus === ProjectStatus.UNDER_SCRUTINY) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Statutory preliminary scrutiny requires LAND_ACQUISITION_OFFICER or authorized administrative authority',
        );
      }
      return;
    }

    // 4. Document & Cadastral Verification
    if (toStatus === ProjectStatus.DOCUMENT_VERIFICATION) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.VERIFICATION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Document and cadastral verification requires VERIFICATION_OFFICER, LAND_ACQUISITION_OFFICER, or authorized authority',
        );
      }
      return;
    }

    // 5. District Statutory Clearance
    if (toStatus === ProjectStatus.DISTRICT_APPROVAL) {
      const allowedRoles: UserRole[] = [
        UserRole.DISTRICT_OFFICER,
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'District statutory approval requires DISTRICT_OFFICER or authorized administrative authority',
        );
      }
      return;
    }

    // 6. State Statutory Clearance
    if (toStatus === ProjectStatus.STATE_APPROVAL) {
      const allowedRoles: UserRole[] = [
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'State statutory approval requires STATE_OFFICER or authorized administrative authority',
        );
      }
      return;
    }

    // 7. Central Statutory Clearance
    if (toStatus === ProjectStatus.CENTRAL_APPROVAL) {
      const allowedRoles: UserRole[] = [
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Central statutory approval requires CENTRAL_OFFICER or Central Administrator',
        );
      }
      return;
    }

    // 8. Section 11 Preliminary Notification
    if (toStatus === ProjectStatus.NOTIFICATION_ISSUED) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Issuing statutory preliminary notification requires LAND_ACQUISITION_OFFICER, DISTRICT_OFFICER, or competent authority',
        );
      }
      return;
    }

    // 9. Section 23 Statutory Award Declaration
    if (toStatus === ProjectStatus.AWARD_DECLARED) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Statutory award declaration requires LAND_ACQUISITION_OFFICER, DISTRICT_OFFICER, or competent authority',
        );
      }
      return;
    }

    // 10. Compensation Assessment Determination
    if (toStatus === ProjectStatus.COMPENSATION_ASSESSED) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.FINANCE_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Compensation assessment requires FINANCE_OFFICER, LAND_ACQUISITION_OFFICER, or competent authority',
        );
      }
      return;
    }

    // 11. Compensation Disbursed (PFMS / Treasury)
    if (toStatus === ProjectStatus.COMPENSATION_DISBURSED) {
      const allowedRoles: UserRole[] = [
        UserRole.FINANCE_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Compensation disbursement requires FINANCE_OFFICER or authorized treasury authority',
        );
      }
      return;
    }

    // 12. Possession Pending
    if (toStatus === ProjectStatus.POSSESSION_PENDING) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.FINANCE_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Initiating possession proceedings requires LAND_ACQUISITION_OFFICER or competent authority',
        );
      }
      return;
    }

    // 13. Section 38 Physical Land Possession Taken
    if (toStatus === ProjectStatus.POSSESSION_COMPLETED) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Executing Section 38 statutory land handover requires LAND_ACQUISITION_OFFICER or competent authority',
        );
      }
      return;
    }

    // 14. Rehabilitation & Resettlement In Progress
    if (toStatus === ProjectStatus.R_AND_R_IN_PROGRESS) {
      const allowedRoles: UserRole[] = [
        UserRole.R_AND_R_OFFICER,
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Managing R&R schemes requires R_AND_R_OFFICER or competent authority',
        );
      }
      return;
    }

    // 15. Final Statutory Project Completion
    if (toStatus === ProjectStatus.COMPLETED) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Statutory project completion requires LAND_ACQUISITION_OFFICER, DISTRICT_OFFICER, or competent authority',
        );
      }
      return;
    }

    // 16. Rejection / Hold Authority
    if (toStatus === ProjectStatus.REJECTED || toStatus === ProjectStatus.ON_HOLD) {
      const allowedRoles: UserRole[] = [
        UserRole.LAND_ACQUISITION_OFFICER,
        UserRole.DISTRICT_OFFICER,
        UserRole.STATE_OFFICER,
        UserRole.CENTRAL_OFFICER,
        UserRole.SUPER_ADMIN,
      ];
      if (!allowedRoles.includes(actor.role)) {
        throw new ForbiddenException(
          'Statutory rejection or stay requires authorized government authority',
        );
      }
    }
  }

  // ============================================================================
  // RESPONSE MAPPERS
  // ============================================================================

  private mapToProjectResponse(p: any): ProjectResponseDto {
    return {
      id: p.id,
      code: p.code,
      title: p.title,
      description: p.description || null,
      category: p.category,
      status: p.status,
      implementingAgencyOrgId: p.implementingAgencyOrgId,
      implementingAgency: p.implementingAgencyOrg
        ? {
            id: p.implementingAgencyOrg.id,
            name: p.implementingAgencyOrg.name,
            code: p.implementingAgencyOrg.code || null,
            state: p.implementingAgencyOrg.state || null,
            district: p.implementingAgencyOrg.district || null,
          }
        : undefined,
      state: p.state,
      districts: p.districts as string[],
      totalAreaHectares: Number(p.totalAreaHectares) || 0,
      estimatedCompensationInr: Number(p.estimatedCompensationInr) || 0,
      disbursedCompensationInr: Number(p.disbursedCompensationInr) || 0,
      spatialBounds: p.spatialBounds || null,
      notifiedOn: p.notifiedOn || null,
      targetCompletionOn: p.targetCompletionOn || null,
      metadata: p.metadata || null,
      isActive: p.isActive,
      parcelCount: p._count?.parcels ?? 0,
      documentCount: p._count?.documents ?? 0,
      workflowTaskCount: p._count?.workflowTasks ?? 0,
      affectedHouseholdCount: p._count?.affectedHouseholds ?? 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }

  private mapToProjectDetailResponse(p: any): ProjectDetailResponseDto {
    const base = this.mapToProjectResponse(p);
    return {
      ...base,
      assignments: (p.assignments || []).map((a: any) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user?.fullName || 'Assigned Officer',
        userEmail: a.user?.email || '',
        role: a.role,
        assignedAt: a.assignedAt,
        isActive: a.isActive,
      })),
    };
  }

  private async getActorOrganization(orgId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    });
    if (!org) {
      throw new NotFoundException(`Organization with ID "${orgId}" not found`);
    }
    return org;
  }

  private async logAudit(params: {
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    organizationId?: string;
    previousState?: any;
    newState?: any;
  }) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: params.actorId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId,
          organizationId: params.organizationId || null,
          previousState: params.previousState || Prisma.JsonNull,
          newState: params.newState || Prisma.JsonNull,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to record audit log: ${err}`);
    }
  }
}
