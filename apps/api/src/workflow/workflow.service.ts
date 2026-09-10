import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  Prisma,
  ProjectStatus,
  UserRole,
  WorkflowPriority,
  WorkflowSlaStatus,
  WorkflowTaskStatus,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import {
  AddWorkflowCommentDto,
  CompleteWorkflowTaskDto,
  HoldWorkflowTaskDto,
  ReassignWorkflowTaskDto,
  RejectWorkflowTaskDto,
  WorkflowTaskQueryDto,
} from './dto/workflow-task.dto';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jurisdictionService: JurisdictionService,
  ) {}

  /**
   * List workflow tasks scoped to caller jurisdiction and role.
   */
  async findAll(query: WorkflowTaskQueryDto, actor: AuthenticatedUser) {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.WorkflowTaskWhereInput = {};

    if (query.projectId) {
      where.projectId = query.projectId;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.taskType) {
      where.taskType = query.taskType;
    }
    if (query.assignedOfficerId) {
      where.assignedOfficerId = query.assignedOfficerId;
    }

    // PIA user scoping vs Government scoping
    if (actor.accountType === AccountType.PIA_USER) {
      where.project = {
        implementingAgencyOrgId: actor.organizationId,
      };
    } else if (!scope.isCentral) {
      const allowedDistricts = scope.districts || [];
      const districtConditions: Prisma.WorkflowTaskWhereInput[] = [];

      if (scope.userId) {
        districtConditions.push({ assignedOfficerId: scope.userId });
      }
      if (scope.organizationId) {
        districtConditions.push({ assignedOrgId: scope.organizationId });
      }
      if (scope.state) {
        districtConditions.push({
          project: {
            state: { equals: scope.state, mode: 'insensitive' },
          },
        });
      }
      if (allowedDistricts.length > 0) {
        for (const dist of allowedDistricts) {
          districtConditions.push({
            project: {
              districts: {
                array_contains: dist,
              },
            },
          });
        }
      }

      if (districtConditions.length > 0) {
        where.OR = districtConditions;
      }
    }

    const [total, items] = await Promise.all([
      this.prisma.workflowTask.count({ where }),
      this.prisma.workflowTask.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueAt: 'asc' }, { createdAt: 'desc' }],
        include: {
          project: {
            select: {
              id: true,
              code: true,
              title: true,
              status: true,
              state: true,
              districts: true,
              implementingAgencyOrgId: true,
            },
          },
          assignedOfficer: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              designation: true,
            },
          },
          assignedOrg: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              state: true,
              district: true,
            },
          },
          history: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              performedBy: {
                select: {
                  id: true,
                  fullName: true,
                  role: true,
                },
              },
            },
          },
        },
      }),
    ]);

    // Secondary jurisdiction filter to guarantee zero leakage
    const scopedItems = items.filter((task) =>
      this.jurisdictionService.canAccessWorkflowTask(scope, task),
    );

    return {
      items: scopedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single workflow task by ID with jurisdiction verification.
   */
  async findOne(id: string, actor: AuthenticatedUser) {
    const task = await this.prisma.workflowTask.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            implementingAgencyOrg: true,
          },
        },
        assignedOfficer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            designation: true,
          },
        },
        assignedOrg: true,
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            performedBy: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Workflow task with ID "${id}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessWorkflowTask(scope, task)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to view this workflow task',
      );
    }

    // PIA user cannot view internal comments
    if (actor.accountType === AccountType.PIA_USER) {
      return {
        ...task,
        comments: task.comments.filter((c) => !c.isInternalOnly),
      };
    }

    return task;
  }

  /**
   * Get the active workflow task for a specific project.
   */
  async getByProjectId(projectId: string, actor: AuthenticatedUser) {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const task = await this.prisma.workflowTask.findFirst({
      where: {
        projectId,
        status: { in: [WorkflowTaskStatus.PENDING, WorkflowTaskStatus.IN_REVIEW] },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        project: true,
        assignedOfficer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            designation: true,
          },
        },
        assignedOrg: true,
        history: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!task) return null;

    if (!this.jurisdictionService.canAccessWorkflowTask(scope, task)) {
      throw new ForbiddenException('Forbidden: Task outside authorized jurisdiction');
    }

    return task;
  }

  /**
   * Complete a workflow task (marks task COMPLETED).
   * Note: As per architecture rules, completing a task records the decision
   * and does NOT automatically execute a ProjectStatus transition.
   */
  async completeTask(
    id: string,
    dto: CompleteWorkflowTaskDto,
    actor: AuthenticatedUser,
  ) {
    if (actor.accountType === AccountType.PIA_USER) {
      throw new ForbiddenException('PIA users cannot complete government workflow tasks');
    }

    const task = await this.findOne(id, actor);

    // Ensure actor is the assigned officer or an authorized jurisdiction officer
    this.assertOfficerTaskAuthority(task, actor);

    const updated = await this.prisma.workflowTask.update({
      where: { id },
      data: {
        status: WorkflowTaskStatus.COMPLETED,
        slaStatus: WorkflowSlaStatus.COMPLETED,
        completedAt: new Date(),
        remarks: dto.remarks || task.remarks,
        history: {
          create: {
            action: 'COMPLETED',
            fromStatus: task.status,
            toStatus: WorkflowTaskStatus.COMPLETED,
            performedById: actor.id,
            remarks: dto.remarks || 'Task completed by assigned officer',
          },
        },
      },
      include: {
        history: true,
      },
    });

    this.logger.log(`Workflow task ${id} marked COMPLETED by officer ${actor.id}`);
    return updated;
  }

  /**
   * Reject / Remand a workflow task.
   */
  async rejectTask(
    id: string,
    dto: RejectWorkflowTaskDto,
    actor: AuthenticatedUser,
  ) {
    if (actor.accountType === AccountType.PIA_USER) {
      throw new ForbiddenException('PIA users cannot reject government workflow tasks');
    }

    const task = await this.findOne(id, actor);
    this.assertOfficerTaskAuthority(task, actor);

    const updated = await this.prisma.workflowTask.update({
      where: { id },
      data: {
        status: WorkflowTaskStatus.REJECTED,
        remarks: dto.remarks,
        history: {
          create: {
            action: 'REJECTED',
            fromStatus: task.status,
            toStatus: WorkflowTaskStatus.REJECTED,
            performedById: actor.id,
            remarks: dto.remarks,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Put a workflow task on hold.
   */
  async holdTask(
    id: string,
    dto: HoldWorkflowTaskDto,
    actor: AuthenticatedUser,
  ) {
    if (actor.accountType === AccountType.PIA_USER) {
      throw new ForbiddenException('PIA users cannot place government workflow tasks on hold');
    }

    const task = await this.findOne(id, actor);
    this.assertOfficerTaskAuthority(task, actor);

    const updated = await this.prisma.workflowTask.update({
      where: { id },
      data: {
        status: WorkflowTaskStatus.ON_HOLD,
        remarks: dto.remarks,
        history: {
          create: {
            action: 'HOLD',
            fromStatus: task.status,
            toStatus: WorkflowTaskStatus.ON_HOLD,
            performedById: actor.id,
            remarks: dto.remarks,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Reassign a task to another authorized officer in the same jurisdiction.
   */
  async reassignTask(
    id: string,
    dto: ReassignWorkflowTaskDto,
    actor: AuthenticatedUser,
  ) {
    if (actor.accountType === AccountType.PIA_USER) {
      throw new ForbiddenException('PIA users cannot reassign government workflow tasks');
    }

    const task = await this.findOne(id, actor);
    const newOfficer = await this.prisma.user.findUnique({
      where: { id: dto.newOfficerId },
      include: { organization: true },
    });

    if (!newOfficer) {
      throw new NotFoundException(`Target officer "${dto.newOfficerId}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessUser(scope, newOfficer)) {
      throw new ForbiddenException('Cannot reassign to an officer outside authorized jurisdiction');
    }

    const updated = await this.prisma.workflowTask.update({
      where: { id },
      data: {
        assignedOfficerId: newOfficer.id,
        assignedOrgId: newOfficer.organizationId,
        assignedRoleId: newOfficer.role,
        history: {
          create: {
            action: 'REASSIGNED',
            performedById: actor.id,
            remarks: dto.remarks || `Reassigned to ${newOfficer.fullName} (${newOfficer.role})`,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Add comment to workflow task.
   */
  async addComment(
    id: string,
    dto: AddWorkflowCommentDto,
    actor: AuthenticatedUser,
  ) {
    await this.findOne(id, actor);

    return this.prisma.workflowComment.create({
      data: {
        taskId: id,
        authorId: actor.id,
        comment: dto.comment,
        isInternalOnly: dto.isInternalOnly !== false,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Helper: Automatically routes and creates a WorkflowTask for a project
   * targeting the appropriate regional officer based on project.state and project.districts.
   */
  async createRoutedTask(params: {
    projectId: string;
    projectTitle: string;
    projectCode: string;
    projectState: string;
    projectDistricts: string[];
    currentStage: ProjectStatus;
    targetStage?: ProjectStatus;
    taskType: string;
    title: string;
    description: string;
    preferredRole: UserRole;
    slaDays?: number;
    priority?: WorkflowPriority;
  }) {
    // 1. Resolve authorized officer in target jurisdiction
    const officer = await this.findAuthorizedRegionalOfficer(
      params.projectState,
      params.projectDistricts,
      params.preferredRole,
    );

    const defaultOrg = officer?.organizationId
      ? officer.organizationId
      : (await this.prisma.organization.findFirst({ where: { state: params.projectState } }))?.id ||
        (await this.prisma.organization.findFirst({ where: { type: 'CENTRAL_MINISTRY' } }))?.id!;

    const defaultOfficerId =
      officer?.id ||
      (await this.prisma.user.findFirst({ where: { role: params.preferredRole, isActive: true } }))?.id ||
      (await this.prisma.user.findFirst({ where: { role: UserRole.SUPER_ADMIN, isActive: true } }))?.id!;

    const slaDays = params.slaDays || 7;
    const dueAt = new Date(Date.now() + slaDays * 24 * 60 * 60 * 1000);

    const task = await this.prisma.workflowTask.create({
      data: {
        projectId: params.projectId,
        currentStage: params.currentStage,
        targetStage: params.targetStage,
        taskType: params.taskType,
        title: params.title,
        description: params.description,
        assignedRoleId: params.preferredRole,
        assignedOfficerId: defaultOfficerId,
        assignedOrgId: defaultOrg,
        status: WorkflowTaskStatus.PENDING,
        priority: params.priority || WorkflowPriority.MEDIUM,
        slaDays,
        slaStatus: WorkflowSlaStatus.ON_TRACK,
        dueAt,
        availableActions: ['APPROVE', 'REJECT', 'HOLD'],
        remarks: `Automatically routed to ${params.projectState} regional authority.`,
      },
    });

    this.logger.log(
      `Created ${params.taskType} task for project ${params.projectCode} assigned to officer ${defaultOfficerId}`,
    );

    return task;
  }

  /**
   * Helper: Resolves the best regional officer matching state, district and role.
   */
  private async findAuthorizedRegionalOfficer(
    state: string,
    districts: string[],
    role: UserRole,
  ) {
    // 1. Try district-level match
    if (districts.length > 0) {
      const districtOfficer = await this.prisma.user.findFirst({
        where: {
          role,
          isActive: true,
          organization: {
            state: { equals: state, mode: 'insensitive' },
            district: { in: districts, mode: 'insensitive' },
          },
        },
      });
      if (districtOfficer) return districtOfficer;
    }

    // 2. Try state-level match
    const stateOfficer = await this.prisma.user.findFirst({
      where: {
        role,
        isActive: true,
        organization: {
          state: { equals: state, mode: 'insensitive' },
        },
      },
    });
    if (stateOfficer) return stateOfficer;

    // 3. Fallback to any active officer of that role
    return this.prisma.user.findFirst({
      where: {
        role,
        isActive: true,
      },
    });
  }

  private assertOfficerTaskAuthority(task: any, actor: AuthenticatedUser) {
    if (actor.role === UserRole.SUPER_ADMIN) return;
    if (task.assignedOfficerId === actor.id) return;
    if (task.assignedRoleId === actor.role) return;

    // Also allow higher statutory authorities in same jurisdiction (e.g. District Officer / LAO)
    if (
      actor.role === UserRole.DISTRICT_OFFICER ||
      actor.role === UserRole.STATE_OFFICER ||
      actor.role === UserRole.CENTRAL_OFFICER ||
      actor.role === UserRole.LAND_ACQUISITION_OFFICER
    ) {
      return;
    }

    throw new ForbiddenException(
      'Forbidden: You do not have authority to act on this workflow task',
    );
  }
}
