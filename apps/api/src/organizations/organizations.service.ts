import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AccountType, OrganizationStatus, OrganizationType, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PiaRegisterDto } from './dto/pia-register.dto';
import { OfficerRegisterDto } from './dto/officer-register.dto';
import { OrganizationActionDto } from './dto/organization-action.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import {
  OrganizationResponseDto,
  PaginatedOrganizationsResponseDto,
} from './dto/organization-response.dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: OrganizationQueryDto): Promise<PaginatedOrganizationsResponseDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.state) {
      where.state = { contains: query.state, mode: 'insensitive' };
    }

    if (query.district) {
      where.district = { contains: query.district, mode: 'insensitive' };
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { code: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.organization.count({ where }),
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
        include: {
          _count: {
            select: {
              users: true,
              projects: true,
            },
          },
        },
      }),
    ]);

    const mappedItems: OrganizationResponseDto[] = items.map((org) =>
      this.mapToResponse(org),
    );

    return {
      items: mappedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async findOne(id: string): Promise<any> {
    const org = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            status: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            status: true,
          },
        },
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    return this.mapToResponse(org);
  }

  async create(dto: CreateOrganizationDto, actorId?: string): Promise<OrganizationResponseDto> {
    if (dto.code) {
      const existing = await this.prisma.organization.findUnique({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException(`Organization with code "${dto.code}" already exists`);
      }
    }

    if (dto.parentId) {
      const parent = await this.prisma.organization.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent organization "${dto.parentId}" does not exist`);
      }
    }

    const org = await this.prisma.organization.create({
      data: {
        code: dto.code || null,
        name: dto.name.trim(),
        type: dto.type,
        status: dto.status || OrganizationStatus.ACTIVE,
        state: dto.state || null,
        district: dto.district || null,
        parentId: dto.parentId || null,
        jurisdiction: dto.jurisdiction || Prisma.JsonNull,
        isActive: dto.status !== OrganizationStatus.SUSPENDED && dto.status !== OrganizationStatus.REJECTED,
      },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId,
      action: 'CREATE_ORGANIZATION',
      entityType: 'Organization',
      entityId: org.id,
      organizationId: org.id,
      newState: { name: org.name, type: org.type, status: org.status },
    });

    return this.mapToResponse(org);
  }

  async update(
    id: string,
    dto: UpdateOrganizationDto,
    actorId?: string,
  ): Promise<OrganizationResponseDto> {
    const existing = await this.prisma.organization.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    if (dto.code && dto.code !== existing.code) {
      const codeExists = await this.prisma.organization.findUnique({
        where: { code: dto.code },
      });
      if (codeExists) {
        throw new ConflictException(`Organization with code "${dto.code}" already exists`);
      }
    }

    if (dto.parentId && dto.parentId === id) {
      throw new BadRequestException('Organization cannot be its own parent');
    }

    const updated = await this.prisma.organization.update({
      where: { id },
      data: {
        code: dto.code !== undefined ? dto.code : existing.code,
        name: dto.name ? dto.name.trim() : existing.name,
        type: dto.type || existing.type,
        status: dto.status || existing.status,
        state: dto.state !== undefined ? dto.state : existing.state,
        district: dto.district !== undefined ? dto.district : existing.district,
        parentId: dto.parentId !== undefined ? dto.parentId : existing.parentId,
        jurisdiction: dto.jurisdiction !== undefined ? dto.jurisdiction : (existing.jurisdiction as any),
      },
      include: {
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
    });

    await this.logAudit({
      actorId,
      action: 'UPDATE_ORGANIZATION',
      entityType: 'Organization',
      entityId: id,
      organizationId: id,
      previousState: { name: existing.name, status: existing.status, type: existing.type },
      newState: { name: updated.name, status: updated.status, type: updated.type },
    });

    return this.mapToResponse(updated);
  }

  async registerPia(dto: PiaRegisterDto): Promise<{
    message: string;
    organization: OrganizationResponseDto;
    initialUser: { id: string; email: string; fullName: string; role: string; isActive: boolean };
  }> {
    const email = dto.adminEmail.trim().toLowerCase();

    // Check email uniqueness
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    // Check code uniqueness if provided
    if (dto.registrationCode) {
      const existingCode = await this.prisma.organization.findUnique({
        where: { code: dto.registrationCode },
      });
      if (existingCode) {
        throw new ConflictException(
          `An organization with code "${dto.registrationCode}" is already registered`,
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.adminPassword, BCRYPT_SALT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          code: dto.registrationCode || null,
          name: dto.organizationName.trim(),
          type: OrganizationType.PROJECT_IMPLEMENTING_AGENCY,
          status: OrganizationStatus.PENDING_APPROVAL,
          state: dto.state || null,
          district: dto.district || null,
          isActive: false, // Inactive until approved
          jurisdiction: {
            officeAddress: dto.officeAddress,
            metadata: dto.metadata || {},
          },
        },
        include: {
          _count: {
            select: { users: true, projects: true },
          },
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.adminFullName.trim(),
          phone: dto.adminPhone || null,
          accountType: AccountType.PIA_USER,
          role: UserRole.PROJECT_IMPLEMENTING_AGENCY,
          designation: dto.adminDesignation.trim(),
          organizationId: org.id,
          isActive: false, // Inactive until approved
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PIA_REGISTRATION_SUBMITTED',
          entityType: 'Organization',
          entityId: org.id,
          organizationId: org.id,
          newState: {
            organizationName: org.name,
            adminEmail: user.email,
            status: org.status,
          },
        },
      });

      return { org, user };
    });

    this.logger.log(
      `New PIA registration submitted: "${dto.organizationName}" (${email}) - Pending Review`,
    );

    return {
      message:
        'Registration submitted successfully. Your application is pending government administrative verification.',
      organization: this.mapToResponse(result.org),
      initialUser: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        isActive: result.user.isActive,
      },
    };
  }

  async registerOfficer(dto: OfficerRegisterDto): Promise<{
    message: string;
    organization: OrganizationResponseDto;
    user: { id: string; email: string; fullName: string; role: string; accountType: string; isActive: boolean };
  }> {
    const email = dto.email.trim().toLowerCase();

    // 1. Role validation: Public officer registration CANNOT request SUPER_ADMIN or PIA
    if (
      dto.requestedRole === UserRole.SUPER_ADMIN ||
      dto.requestedRole === UserRole.PROJECT_IMPLEMENTING_AGENCY
    ) {
      throw new BadRequestException(
        'Public officer registration cannot request SUPER_ADMIN or PROJECT_IMPLEMENTING_AGENCY roles',
      );
    }

    // 2. Organization tier validation: Cannot register PIA as government tier
    if (dto.organizationType === OrganizationType.PROJECT_IMPLEMENTING_AGENCY) {
      throw new BadRequestException(
        'Government officer registration must specify a Central, State, or District government authority',
      );
    }

    // 3. Email uniqueness check
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new ConflictException('A user with this email address already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const result = await this.prisma.$transaction(async (tx) => {
      // Find or create government organization
      let org = await tx.organization.findFirst({
        where: {
          name: { equals: dto.departmentName.trim(), mode: 'insensitive' },
          type: dto.organizationType,
          state: dto.state ? { equals: dto.state, mode: 'insensitive' } : null,
          district: dto.district ? { equals: dto.district, mode: 'insensitive' } : null,
        },
        include: {
          _count: {
            select: { users: true, projects: true },
          },
        },
      });

      if (!org) {
        org = await tx.organization.create({
          data: {
            name: dto.departmentName.trim(),
            type: dto.organizationType,
            status: OrganizationStatus.PENDING_APPROVAL,
            state: dto.state || null,
            district: dto.district || null,
            isActive: false, // Inactive pending administrative verification
            jurisdiction: {
              officeAddress: dto.officeAddress,
              employeeId: dto.employeeId,
              metadata: dto.jurisdiction || {},
            },
          },
          include: {
            _count: {
              select: { users: true, projects: true },
            },
          },
        });
      }

      // Create pending officer user
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName.trim(),
          phone: dto.phone || null,
          accountType: AccountType.GOVERNMENT_OFFICER,
          role: dto.requestedRole,
          designation: dto.designation.trim(),
          organizationId: org.id,
          isActive: false, // Inactive pending administrative approval
        },
      });

      // Audit log the officer access request
      await tx.auditLog.create({
        data: {
          action: 'OFFICER_ACCESS_REQUESTED',
          entityType: 'User',
          entityId: user.id,
          organizationId: org.id,
          newState: {
            email: user.email,
            fullName: user.fullName,
            requestedRole: user.role,
            accountType: user.accountType,
            departmentName: org.name,
            organizationType: org.type,
            state: org.state,
            district: org.district,
          },
        },
      });

      return { org, user };
    });

    this.logger.log(
      `New Government Officer access request submitted: "${dto.fullName}" <${email}> (${dto.requestedRole}) - Pending Approval`,
    );

    return {
      message:
        'Officer access request submitted successfully. Your account is pending administrative approval.',
      organization: this.mapToResponse(result.org),
      user: {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        role: result.user.role,
        accountType: result.user.accountType,
        isActive: result.user.isActive,
      },
    };
  }

  async approvePia(
    id: string,
    dto: OrganizationActionDto,
    actorId: string,
  ): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    if (org.status !== OrganizationStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Organization is not in PENDING_APPROVAL status (current: ${org.status})`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrg = await tx.organization.update({
        where: { id },
        data: {
          status: OrganizationStatus.ACTIVE,
          isActive: true,
        },
        include: {
          _count: { select: { users: true, projects: true } },
        },
      });

      // Activate the initial administrative user(s) created during registration
      await tx.user.updateMany({
        where: { organizationId: id },
        data: { isActive: true },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'APPROVE_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          organizationId: id,
          previousState: { status: org.status, isActive: org.isActive },
          newState: { status: OrganizationStatus.ACTIVE, isActive: true, remarks: dto.remarks },
        },
      });

      return updatedOrg;
    });

    this.logger.log(`Organization "${org.name}" (${id}) approved by actor ${actorId}`);
    return this.mapToResponse(updated);
  }

  async rejectPia(
    id: string,
    dto: OrganizationActionDto,
    actorId: string,
  ): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    if (org.status !== OrganizationStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Only organizations in PENDING_APPROVAL status can be rejected (current: ${org.status})`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrg = await tx.organization.update({
        where: { id },
        data: {
          status: OrganizationStatus.REJECTED,
          isActive: false,
        },
        include: {
          _count: { select: { users: true, projects: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'REJECT_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          organizationId: id,
          previousState: { status: org.status },
          newState: {
            status: OrganizationStatus.REJECTED,
            rejectionReason: dto.rejectionReason || dto.remarks,
          },
        },
      });

      return updatedOrg;
    });

    this.logger.warn(`Organization "${org.name}" (${id}) rejected by actor ${actorId}`);
    return this.mapToResponse(updated);
  }

  async suspend(
    id: string,
    dto: OrganizationActionDto,
    actorId: string,
  ): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrg = await tx.organization.update({
        where: { id },
        data: {
          status: OrganizationStatus.SUSPENDED,
          isActive: false,
        },
        include: {
          _count: { select: { users: true, projects: true } },
        },
      });

      // Deactivate all users in suspended organization
      await tx.user.updateMany({
        where: { organizationId: id },
        data: { isActive: false },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'SUSPEND_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          organizationId: id,
          previousState: { status: org.status, isActive: org.isActive },
          newState: {
            status: OrganizationStatus.SUSPENDED,
            isActive: false,
            suspensionReason: dto.suspensionReason || dto.remarks,
          },
        },
      });

      return updatedOrg;
    });

    this.logger.warn(`Organization "${org.name}" (${id}) suspended by actor ${actorId}`);
    return this.mapToResponse(updated);
  }

  async activate(id: string, actorId: string): Promise<OrganizationResponseDto> {
    const org = await this.prisma.organization.findUnique({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization with ID "${id}" not found`);
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedOrg = await tx.organization.update({
        where: { id },
        data: {
          status: OrganizationStatus.ACTIVE,
          isActive: true,
        },
        include: {
          _count: { select: { users: true, projects: true } },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          action: 'ACTIVATE_ORGANIZATION',
          entityType: 'Organization',
          entityId: id,
          organizationId: id,
          previousState: { status: org.status, isActive: org.isActive },
          newState: { status: OrganizationStatus.ACTIVE, isActive: true },
        },
      });

      return updatedOrg;
    });

    this.logger.log(`Organization "${org.name}" (${id}) activated by actor ${actorId}`);
    return this.mapToResponse(updated);
  }

  private mapToResponse(org: any): OrganizationResponseDto {
    return {
      id: org.id,
      code: org.code || null,
      name: org.name,
      type: org.type,
      status: org.status,
      state: org.state || null,
      district: org.district || null,
      jurisdiction: org.jurisdiction || null,
      parentId: org.parentId || null,
      isActive: org.isActive,
      userCount: org._count?.users ?? 0,
      projectCount: org._count?.projects ?? 0,
      createdAt: org.createdAt,
      updatedAt: org.updatedAt,
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
