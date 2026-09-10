import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AccountType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import {
  PaginatedUsersResponseDto,
  UserDetailResponseDto,
} from './dto/user-response.dto';
import {
  CreateProjectAssignmentDto,
  ProjectAssignmentResponseDto,
  UpdateProjectAssignmentDto,
} from './dto/project-assignment.dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jurisdictionService: JurisdictionService,
  ) {}

  async findAll(
    query: UserQueryDto,
    actor?: AuthenticatedUser,
  ): Promise<PaginatedUsersResponseDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.UserWhereInput[] = [];

    // Apply Jurisdiction Scoping
    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      const scopeWhere = this.jurisdictionService.buildUserWhere(scope);
      if (Object.keys(scopeWhere).length > 0) {
        andConditions.push(scopeWhere);
      }
    }

    if (query.accountType) {
      andConditions.push({ accountType: query.accountType });
    }

    if (query.role) {
      andConditions.push({ role: query.role });
    }

    if (query.organizationId) {
      andConditions.push({ organizationId: query.organizationId });
    }

    if (query.isActive !== undefined) {
      andConditions.push({ isActive: query.isActive });
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      andConditions.push({
        OR: [
          { fullName: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { designation: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.UserWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const [total, items] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              code: true,
              type: true,
              status: true,
              state: true,
              district: true,
            },
          },
        },
      }),
    ]);

    const mappedItems: UserDetailResponseDto[] = items.map((user) =>
      this.mapToUserResponse(user),
    );

    return {
      items: mappedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(
    id: string,
    actor?: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        organization: true,
        projectAssignments: {
          where: { isActive: true },
          include: {
            project: {
              select: {
                id: true,
                code: true,
                title: true,
                status: true,
                state: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessUser(scope, user)) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to view this user profile',
        );
      }
    }

    return this.mapToUserResponse(user);
  }

  async create(
    dto: CreateUserDto,
    actorId?: string,
    actorRole?: UserRole,
    actorAccountType?: AccountType,
    actorOrgId?: string,
    actor?: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    const email = dto.email.trim().toLowerCase();

    // Security Rule: PIA users cannot create Government Officer accounts or assign government roles
    if (actorAccountType === AccountType.PIA_USER) {
      if (dto.accountType === AccountType.GOVERNMENT_OFFICER) {
        throw new ForbiddenException(
          'Implementing Agency users are not authorized to create Government Officer accounts',
        );
      }
      if (dto.organizationId !== actorOrgId) {
        throw new ForbiddenException(
          'Implementing Agency administrators can only provision users within their own organization',
        );
      }
      if (
        dto.role !== UserRole.PROJECT_IMPLEMENTING_AGENCY &&
        dto.role !== UserRole.VIEWER
      ) {
        throw new ForbiddenException(
          'Implementing Agency users can only be assigned PROJECT_IMPLEMENTING_AGENCY or VIEWER roles',
        );
      }
    }

    const org = await this.prisma.organization.findUnique({
      where: { id: dto.organizationId },
    });
    if (!org) {
      throw new BadRequestException(`Organization with ID "${dto.organizationId}" does not exist`);
    }

    // Check actor jurisdiction over target organization
    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessOrganization(scope, org)) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to create users in this organization',
        );
      }
    }

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(`A user with email "${email}" already exists`);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: dto.fullName.trim(),
        phone: dto.phone || null,
        accountType: dto.accountType || AccountType.GOVERNMENT_OFFICER,
        role: dto.role,
        designation: dto.designation.trim(),
        organizationId: dto.organizationId,
        avatarUrl: dto.avatarUrl || null,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        organization: true,
      },
    });

    await this.logAudit({
      actorId,
      action: 'CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      organizationId: user.organizationId,
      newState: {
        email: user.email,
        role: user.role,
        accountType: user.accountType,
        organizationId: user.organizationId,
      },
    });

    return this.mapToUserResponse(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorId?: string,
    actorRole?: UserRole,
    actor?: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
    if (!existing) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Jurisdiction check
    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessUser(scope, existing)) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to update this user',
        );
      }
    }

    // Security Rule: Non-superadmin cannot self-elevate role or modify privileged roles arbitrarily
    if (dto.role && dto.role !== existing.role && actorRole !== UserRole.SUPER_ADMIN) {
      if (actorId === id) {
        throw new ForbiddenException('Users are not permitted to elevate their own role');
      }
    }

    let passwordHash: string | undefined;
    if (dto.password) {
      passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);
    }

    if (dto.email && dto.email.trim().toLowerCase() !== existing.email) {
      const emailTaken = await this.prisma.user.findUnique({
        where: { email: dto.email.trim().toLowerCase() },
      });
      if (emailTaken) {
        throw new ConflictException(`Email "${dto.email}" is already in use`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ? dto.email.trim().toLowerCase() : existing.email,
        passwordHash: passwordHash || existing.passwordHash,
        fullName: dto.fullName ? dto.fullName.trim() : existing.fullName,
        phone: dto.phone !== undefined ? dto.phone : existing.phone,
        accountType: dto.accountType || existing.accountType,
        role: dto.role || existing.role,
        designation: dto.designation ? dto.designation.trim() : existing.designation,
        organizationId: dto.organizationId || existing.organizationId,
        avatarUrl: dto.avatarUrl !== undefined ? dto.avatarUrl : existing.avatarUrl,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
      include: {
        organization: true,
      },
    });

    await this.logAudit({
      actorId,
      action: 'UPDATE_USER',
      entityType: 'User',
      entityId: id,
      organizationId: updated.organizationId,
      previousState: { role: existing.role, accountType: existing.accountType, isActive: existing.isActive },
      newState: { role: updated.role, accountType: updated.accountType, isActive: updated.isActive },
    });

    return this.mapToUserResponse(updated);
  }

  async activate(
    id: string,
    actorId: string,
    actor?: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessUser(scope, user)) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to activate this user',
        );
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: { organization: true },
    });

    await this.logAudit({
      actorId,
      action: 'ACTIVATE_USER',
      entityType: 'User',
      entityId: id,
      organizationId: user.organizationId,
      previousState: { isActive: user.isActive },
      newState: { isActive: true },
    });

    return this.mapToUserResponse(updated);
  }

  async deactivate(
    id: string,
    actorId: string,
    actor?: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { organization: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessUser(scope, user)) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to deactivate this user',
        );
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data: { isActive: false },
        include: { organization: true },
      });

      // Revoke all active sessions for security
      await tx.authSession.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'DEACTIVATE_USER',
          entityType: 'User',
          entityId: id,
          organizationId: user.organizationId,
          previousState: { isActive: user.isActive },
          newState: { isActive: false, sessionsRevoked: true },
        },
      });

      return u;
    });

    return this.mapToUserResponse(updated);
  }

  // ============================================================================
  // PROJECT ASSIGNMENTS
  // ============================================================================

  async getProjectAssignments(userId: string): Promise<ProjectAssignmentResponseDto[]> {
    const assignments = await this.prisma.projectAssignment.findMany({
      where: { userId },
      orderBy: [{ assignedAt: 'desc' }],
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            state: true,
          },
        },
      },
    });

    return assignments.map((a) => ({
      id: a.id,
      projectId: a.projectId,
      project: a.project
        ? {
            id: a.project.id,
            code: a.project.code,
            title: a.project.title,
            status: a.project.status,
            state: a.project.state,
          }
        : undefined,
      userId: a.userId,
      role: a.role,
      assignedById: a.assignedById,
      isActive: a.isActive,
      assignedAt: a.assignedAt,
    }));
  }

  async assignToProject(
    userId: string,
    dto: CreateProjectAssignmentDto,
    actorId: string,
    actor?: AuthenticatedUser,
  ): Promise<ProjectAssignmentResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });
    if (!user) {
      throw new NotFoundException(`User "${userId}" not found`);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
      include: { assignments: true },
    });
    if (!project) {
      throw new NotFoundException(`Project "${dto.projectId}" not found`);
    }

    // Jurisdiction check on both user and project
    if (actor) {
      if (
        actor.accountType === AccountType.PIA_USER ||
        actor.role === UserRole.PROJECT_IMPLEMENTING_AGENCY
      ) {
        throw new ForbiddenException(
          'Forbidden: Implementing Agency users cannot assign project team officers',
        );
      }

      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessUser(scope, user)) {
        throw new ForbiddenException(
          'Forbidden: You do not have authority to assign users outside your jurisdiction',
        );
      }
      if (!this.jurisdictionService.canAccessProject(scope, project)) {
        throw new ForbiddenException(
          'Forbidden: You do not have authority over this project jurisdiction',
        );
      }
    }

    const assignment = await this.prisma.projectAssignment.upsert({
      where: {
        projectId_userId: {
          projectId: dto.projectId,
          userId,
        },
      },
      create: {
        projectId: dto.projectId,
        userId,
        role: dto.role,
        assignedById: actorId,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      update: {
        role: dto.role,
        assignedById: actorId,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            state: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId,
      action: 'ASSIGN_PROJECT_USER',
      entityType: 'ProjectAssignment',
      entityId: assignment.id,
      organizationId: user.organizationId,
      newState: {
        projectId: dto.projectId,
        userId,
        role: dto.role,
        isActive: assignment.isActive,
      },
    });

    return {
      id: assignment.id,
      projectId: assignment.projectId,
      project: assignment.project,
      userId: assignment.userId,
      role: assignment.role,
      assignedById: assignment.assignedById,
      isActive: assignment.isActive,
      assignedAt: assignment.assignedAt,
    };
  }

  async updateProjectAssignment(
    userId: string,
    assignmentId: string,
    dto: UpdateProjectAssignmentDto,
    actorId: string,
  ): Promise<ProjectAssignmentResponseDto> {
    const existing = await this.prisma.projectAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            state: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Project assignment "${assignmentId}" not found`);
    }

    if (existing.userId !== userId) {
      throw new BadRequestException('Project assignment does not belong to the specified user');
    }

    const updated = await this.prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: {
        role: dto.role || existing.role,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
      },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            state: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId,
      action: 'UPDATE_PROJECT_ASSIGNMENT',
      entityType: 'ProjectAssignment',
      entityId: assignmentId,
      previousState: { role: existing.role, isActive: existing.isActive },
      newState: { role: updated.role, isActive: updated.isActive },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      project: updated.project,
      userId: updated.userId,
      role: updated.role,
      assignedById: updated.assignedById,
      isActive: updated.isActive,
      assignedAt: updated.assignedAt,
    };
  }

  async deactivateProjectAssignment(
    userId: string,
    assignmentId: string,
    actorId: string,
  ): Promise<ProjectAssignmentResponseDto> {
    const existing = await this.prisma.projectAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            state: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Project assignment "${assignmentId}" not found`);
    }

    if (existing.userId !== userId) {
      throw new BadRequestException('Project assignment does not belong to the specified user');
    }

    const updated = await this.prisma.projectAssignment.update({
      where: { id: assignmentId },
      data: { isActive: false },
      include: {
        project: {
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            state: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId,
      action: 'DEACTIVATE_PROJECT_ASSIGNMENT',
      entityType: 'ProjectAssignment',
      entityId: assignmentId,
      previousState: { isActive: existing.isActive },
      newState: { isActive: false },
    });

    return {
      id: updated.id,
      projectId: updated.projectId,
      project: updated.project,
      userId: updated.userId,
      role: updated.role,
      assignedById: updated.assignedById,
      isActive: updated.isActive,
      assignedAt: updated.assignedAt,
    };
  }

  // ============================================================================
  // RESPONSE MAPPERS
  // ============================================================================

  private mapToUserResponse(user: any): UserDetailResponseDto {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      accountType: user.accountType,
      role: user.role,
      designation: user.designation,
      organizationId: user.organizationId,
      organization: user.organization
        ? {
            id: user.organization.id,
            name: user.organization.name,
            code: user.organization.code || null,
            type: user.organization.type,
            status: user.organization.status,
            state: user.organization.state || null,
            district: user.organization.district || null,
            isActive: user.organization.isActive ?? true,
            createdAt: user.organization.createdAt ?? new Date(),
            updatedAt: user.organization.updatedAt ?? new Date(),
          }
        : undefined,
      avatarUrl: user.avatarUrl || null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      projectAssignments: user.projectAssignments
        ? user.projectAssignments.map((a: any) => ({
            id: a.id,
            projectId: a.projectId,
            project: a.project
              ? {
                  id: a.project.id,
                  code: a.project.code,
                  title: a.project.title,
                  status: a.project.status,
                  state: a.project.state,
                }
              : undefined,
            userId: a.userId,
            role: a.role,
            assignedById: a.assignedById,
            isActive: a.isActive,
            assignedAt: a.assignedAt,
          }))
        : undefined,
    };
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
