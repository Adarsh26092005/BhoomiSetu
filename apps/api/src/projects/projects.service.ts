import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  OrganizationType,
  Prisma,
  ProjectCategory,
  ProjectStatus,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
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
    // PIA Submission Check
    if (toStatus === ProjectStatus.SUBMITTED) {
      if (
        actor.accountType !== AccountType.PIA_USER &&
        actor.role !== UserRole.SUPER_ADMIN &&
        actor.role !== UserRole.CENTRAL_OFFICER
      ) {
        throw new ForbiddenException('Only the Implementing Agency or Admin can submit project proposal');
      }
      return;
    }

    // District Approval Check
    if (toStatus === ProjectStatus.DISTRICT_APPROVAL) {
      if (
        actor.role !== UserRole.DISTRICT_OFFICER &&
        actor.role !== UserRole.STATE_OFFICER &&
        actor.role !== UserRole.CENTRAL_OFFICER &&
        actor.role !== UserRole.SUPER_ADMIN
      ) {
        throw new ForbiddenException(
          'District statutory approval requires DISTRICT_OFFICER or authorized administrative authority',
        );
      }
      return;
    }

    // State Approval Check
    if (toStatus === ProjectStatus.STATE_APPROVAL) {
      if (
        actor.role !== UserRole.STATE_OFFICER &&
        actor.role !== UserRole.CENTRAL_OFFICER &&
        actor.role !== UserRole.SUPER_ADMIN
      ) {
        throw new ForbiddenException(
          'State statutory approval requires STATE_OFFICER or authorized administrative authority',
        );
      }
      return;
    }

    // Central Approval Check
    if (toStatus === ProjectStatus.CENTRAL_APPROVAL) {
      if (
        actor.role !== UserRole.CENTRAL_OFFICER &&
        actor.role !== UserRole.SUPER_ADMIN
      ) {
        throw new ForbiddenException(
          'Central statutory approval requires CENTRAL_OFFICER or Central Administrator',
        );
      }
      return;
    }

    // Rejection / Hold Authority
    if (toStatus === ProjectStatus.REJECTED || toStatus === ProjectStatus.ON_HOLD) {
      if (actor.accountType === AccountType.PIA_USER) {
        throw new ForbiddenException('Implementing Agency users cannot reject statutory projects');
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
