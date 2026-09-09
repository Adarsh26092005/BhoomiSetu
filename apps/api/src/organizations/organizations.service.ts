import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  AccountType,
  ApprovalRequestStatus,
  ApprovalRequestType,
  OrganizationStatus,
  OrganizationType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
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
import { ApprovalDecisionDto } from '../jurisdiction/dto/jurisdiction.dto';

const BCRYPT_SALT_ROUNDS = 12;

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jurisdictionService: JurisdictionService,
  ) {}

  // ============================================================================
  // 1. LIST ORGANIZATIONS (Jurisdiction-Scoped)
  // ============================================================================

  async findAll(
    query: OrganizationQueryDto,
    actor?: AuthenticatedUser,
  ): Promise<PaginatedOrganizationsResponseDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const andConditions: Prisma.OrganizationWhereInput[] = [];

    // Apply actor jurisdiction scoping if caller is authenticated
    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      const scopeWhere = this.jurisdictionService.buildOrganizationWhere(scope);
      if (Object.keys(scopeWhere).length > 0) {
        andConditions.push(scopeWhere);
      }
    }

    if (query.type) {
      andConditions.push({ type: query.type });
    }

    if (query.status) {
      andConditions.push({ status: query.status });
    }

    if (query.state) {
      andConditions.push({ state: { contains: query.state, mode: 'insensitive' } });
    }

    if (query.district) {
      andConditions.push({ district: { contains: query.district, mode: 'insensitive' } });
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { code: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.OrganizationWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

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

  async findOne(id: string, actor?: AuthenticatedUser): Promise<any> {
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

    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (!this.jurisdictionService.canAccessOrganization(scope, org)) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to view this organization',
        );
      }
    }

    return this.mapToResponse(org);
  }

  async create(
    dto: CreateOrganizationDto,
    actorId?: string,
    actor?: AuthenticatedUser,
  ): Promise<OrganizationResponseDto> {
    if (actor) {
      const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
      if (
        !this.jurisdictionService.canAccessOrganization(scope, {
          id: '',
          state: dto.state,
          district: dto.district,
        })
      ) {
        throw new ForbiddenException(
          'Forbidden: You do not have jurisdictional authority to provision organizations in this location',
        );
      }
    }

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
        isActive: dto.isActive !== undefined ? dto.isActive : true,
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
      newState: { name: org.name, code: org.code, type: org.type, status: org.status },
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

  // ============================================================================
  // 2. SELF-REGISTRATION WITH ROUTED APPROVAL REQUESTS
  // ============================================================================

  async registerPia(dto: PiaRegisterDto): Promise<{
    message: string;
    organization: OrganizationResponseDto;
    initialUser: { id: string; email: string; fullName: string; role: string; isActive: boolean };
    approvalRequestId?: string;
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

    // Resolve Target Land Acquisition Jurisdiction vs Company HQ
    const targetState = (dto.targetState || dto.state || '').trim();
    const targetDistrict = (dto.targetDistrict || dto.district || undefined)?.trim();

    // Resolve Target Area & Approvers based on ACQUISITION TARGET (not HQ)
    const targetArea = await this.jurisdictionService.findAreaByStateAndDistrict(
      targetState,
      targetDistrict,
    );
    const approverIds = await this.jurisdictionService.findApproversForArea(
      targetArea?.id,
      targetState,
      targetDistrict,
    );

    const isAcquisitionProposal = Boolean(
      dto.projectName || dto.targetState || dto.targetDistrict || dto.landRequirementArea,
    );
    const requestType = isAcquisitionProposal
      ? ApprovalRequestType.LAND_ACQUISITION_REQUEST
      : ApprovalRequestType.PIA_REGISTRATION;

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
            companyType: dto.companyType || 'CORPORATION',
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

      // Create explicit ApprovalRequest routed to Target AdministrativeArea
      const approvalReq = await tx.approvalRequest.create({
        data: {
          requestType,
          requesterUserId: user.id,
          organizationId: org.id,
          state: targetState || 'National',
          district: targetDistrict || null,
          administrativeAreaId: targetArea?.id || null,
          assignedApproverId: approverIds[0] || null,
          status: ApprovalRequestStatus.PENDING,
          metadata: {
            registrationCode: dto.registrationCode,
            organizationName: dto.organizationName,
            companyType: dto.companyType || 'CORPORATION',
            hqState: dto.state || null,
            hqDistrict: dto.district || null,
            adminFullName: dto.adminFullName,
            adminDesignation: dto.adminDesignation,
            adminEmail: email,
            adminPhone: dto.adminPhone,
            officeAddress: dto.officeAddress,
            // Proposed Land Acquisition Request Details
            projectName: dto.projectName || null,
            projectCode: dto.projectCode || null,
            projectPurpose: dto.projectPurpose || null,
            landRequirementArea: dto.landRequirementArea || null,
            landRequirementUnit: dto.landRequirementUnit || 'HECTARE',
            targetState: targetState || null,
            targetDistrict: targetDistrict || null,
            proposedLandDescription: dto.proposedLandDescription || null,
            projectDescription: dto.projectDescription || null,
            expectedTimelineMonths: dto.expectedTimelineMonths || null,
            supportingDocuments: dto.supportingDocuments || [],
          },
        },
      });

      await tx.auditLog.create({
        data: {
          action: isAcquisitionProposal
            ? 'LAND_ACQUISITION_REQUEST_SUBMITTED'
            : 'PIA_REGISTRATION_SUBMITTED',
          entityType: 'Organization',
          entityId: org.id,
          organizationId: org.id,
          newState: {
            organizationName: org.name,
            adminEmail: user.email,
            status: org.status,
            requestType,
            targetState,
            targetDistrict,
            approvalRequestId: approvalReq.id,
            administrativeAreaId: targetArea?.id,
          },
        },
      });

      return { org, user, approvalReq };
    });

    this.logger.log(
      `New ${requestType} submitted: "${dto.organizationName}" (${email}) - Target Area: ${targetArea?.code || 'Central'} (${targetDistrict || ''}, ${targetState})`,
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
      approvalRequestId: result.approvalReq.id,
    };
  }

  async registerOfficer(dto: OfficerRegisterDto): Promise<{
    message: string;
    organization: OrganizationResponseDto;
    user: { id: string; email: string; fullName: string; role: string; accountType: string; isActive: boolean };
    approvalRequestId?: string;
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

    // Resolve Area & Approvers based on State + District
    const targetArea = await this.jurisdictionService.findAreaByStateAndDistrict(
      dto.state,
      dto.district,
    );
    const approverIds = await this.jurisdictionService.findApproversForArea(
      targetArea?.id,
      dto.state,
      dto.district,
    );

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

      // Create ApprovalRequest record explicitly routed to target AdministrativeArea
      const approvalReq = await tx.approvalRequest.create({
        data: {
          requestType: ApprovalRequestType.OFFICER_REGISTRATION,
          requesterUserId: user.id,
          organizationId: org.id,
          state: dto.state,
          district: dto.district,
          administrativeAreaId: targetArea?.id || null,
          assignedApproverId: approverIds[0] || null,
          status: ApprovalRequestStatus.PENDING,
          metadata: {
            employeeId: dto.employeeId,
            requestedRole: dto.requestedRole,
            designation: dto.designation,
            departmentName: dto.departmentName,
            officeAddress: dto.officeAddress,
            phone: dto.phone,
            organizationType: dto.organizationType,
          },
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
            approvalRequestId: approvalReq.id,
            administrativeAreaId: targetArea?.id,
          },
        },
      });

      return { org, user, approvalReq };
    });

    this.logger.log(
      `New Government Officer access request submitted: "${dto.fullName}" <${email}> (${dto.requestedRole}) - Routed to Area: ${targetArea?.code || 'Central'}`,
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
      approvalRequestId: result.approvalReq.id,
    };
  }

  // ============================================================================
  // 3. APPROVAL REQUEST MANAGEMENT (AREA-SCOPED)
  // ============================================================================

  async listApprovalRequests(
    query: { status?: ApprovalRequestStatus; page?: number; limit?: number },
    actor: AuthenticatedUser,
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const scopeWhere = this.jurisdictionService.buildApprovalRequestWhere(scope);

    const andConditions: Prisma.ApprovalRequestWhereInput[] = [];
    if (Object.keys(scopeWhere).length > 0) {
      andConditions.push(scopeWhere);
    }
    if (query.status) {
      andConditions.push({ status: query.status });
    }

    const where: Prisma.ApprovalRequestWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const [total, items] = await Promise.all([
      this.prisma.approvalRequest.count({ where }),
      this.prisma.approvalRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ submittedAt: 'desc' }],
        include: {
          requesterUser: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              role: true,
              designation: true,
            },
          },
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
          administrativeArea: {
            select: {
              id: true,
              code: true,
              name: true,
              state: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getApprovalRequest(id: string, actor: AuthenticatedUser) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        requesterUser: true,
        organization: true,
        administrativeArea: {
          include: { districts: true },
        },
        reviewedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    if (!request) {
      throw new NotFoundException(`Approval request with ID "${id}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessApprovalRequest(scope, request)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to view this approval request',
      );
    }

    return request;
  }

  async approveApprovalRequest(
    id: string,
    dto: ApprovalDecisionDto,
    actor: AuthenticatedUser,
  ) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        requesterUser: true,
        organization: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Approval request with ID "${id}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessApprovalRequest(scope, request)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to approve this request',
      );
    }

    if (request.status !== ApprovalRequestStatus.PENDING) {
      throw new BadRequestException(
        `Approval request is not in PENDING status (current: ${request.status})`,
      );
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // 1. Update ApprovalRequest status
      const updatedReq = await tx.approvalRequest.update({
        where: { id },
        data: {
          status: ApprovalRequestStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedById: actor.id,
          rejectionReason: null,
          metadata: {
            ...((request.metadata as Record<string, any>) || {}),
            approvalRemarks: dto.remarks || 'Approved by authorized jurisdiction administrator.',
          },
        },
      });

      // 2. Activate User if Officer registration
      if (request.requesterUserId) {
        await tx.user.update({
          where: { id: request.requesterUserId },
          data: { isActive: true },
        });
      }

      // 3. Activate Organization if PIA or pending Gov Org
      if (request.organizationId) {
        await tx.organization.update({
          where: { id: request.organizationId },
          data: {
            status: OrganizationStatus.ACTIVE,
            isActive: true,
          },
        });

        // If PIA or Land Acquisition registration, also activate any primary users
        if (
          request.requestType === ApprovalRequestType.PIA_REGISTRATION ||
          request.requestType === ApprovalRequestType.LAND_ACQUISITION_REQUEST
        ) {
          await tx.user.updateMany({
            where: { organizationId: request.organizationId },
            data: { isActive: true },
          });
        }
      }

      // 4. Record Audit Log
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: 'APPROVE_ONBOARDING_REQUEST',
          entityType: 'ApprovalRequest',
          entityId: id,
          organizationId: request.organizationId || null,
          previousState: { status: request.status },
          newState: {
            status: ApprovalRequestStatus.APPROVED,
            requestType: request.requestType,
            reviewedBy: actor.id,
            remarks: dto.remarks,
          },
        },
      });

      return updatedReq;
    });

    this.logger.log(
      `ApprovalRequest "${id}" (${request.requestType}) approved by ${actor.email}`,
    );

    return updated;
  }

  async rejectApprovalRequest(
    id: string,
    dto: ApprovalDecisionDto,
    actor: AuthenticatedUser,
  ) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Approval request with ID "${id}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessApprovalRequest(scope, request)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to reject this request',
      );
    }

    if (
      request.status !== ApprovalRequestStatus.PENDING &&
      request.status !== ApprovalRequestStatus.ON_HOLD
    ) {
      throw new BadRequestException(
        `Only requests in PENDING or ON_HOLD status can be rejected (current: ${request.status})`,
      );
    }

    const rejectionReason =
      dto.rejectionReason || dto.remarks || 'Rejected by authorized jurisdiction administrator.';

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReq = await tx.approvalRequest.update({
        where: { id },
        data: {
          status: ApprovalRequestStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedById: actor.id,
          rejectionReason,
        },
      });

      if (
        (request.requestType === ApprovalRequestType.PIA_REGISTRATION ||
          request.requestType === ApprovalRequestType.LAND_ACQUISITION_REQUEST) &&
        request.organizationId
      ) {
        await tx.organization.update({
          where: { id: request.organizationId },
          data: {
            status: OrganizationStatus.REJECTED,
            isActive: false,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: 'REJECT_ONBOARDING_REQUEST',
          entityType: 'ApprovalRequest',
          entityId: id,
          organizationId: request.organizationId || null,
          previousState: { status: request.status },
          newState: {
            status: ApprovalRequestStatus.REJECTED,
            requestType: request.requestType,
            reviewedBy: actor.id,
            rejectionReason,
          },
        },
      });

      return updatedReq;
    });

    this.logger.warn(
      `ApprovalRequest "${id}" (${request.requestType}) rejected by ${actor.email}`,
    );

    return updated;
  }

  async holdApprovalRequest(
    id: string,
    dto: ApprovalDecisionDto,
    actor: AuthenticatedUser,
  ) {
    const request = await this.prisma.approvalRequest.findUnique({
      where: { id },
      include: {
        organization: true,
      },
    });

    if (!request) {
      throw new NotFoundException(`Approval request with ID "${id}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessApprovalRequest(scope, request)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to modify this request',
      );
    }

    if (
      request.status !== ApprovalRequestStatus.PENDING &&
      request.status !== ApprovalRequestStatus.ON_HOLD
    ) {
      throw new BadRequestException(
        `Only requests in PENDING status can be placed on hold (current: ${request.status})`,
      );
    }

    const holdRemarks = dto.remarks || dto.rejectionReason || 'Placed on hold for administrative review.';

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedReq = await tx.approvalRequest.update({
        where: { id },
        data: {
          status: ApprovalRequestStatus.ON_HOLD,
          reviewedAt: new Date(),
          reviewedById: actor.id,
          metadata: {
            ...((request.metadata as Record<string, any>) || {}),
            holdRemarks,
          },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: 'HOLD_ONBOARDING_REQUEST',
          entityType: 'ApprovalRequest',
          entityId: id,
          organizationId: request.organizationId || null,
          previousState: { status: request.status },
          newState: {
            status: ApprovalRequestStatus.ON_HOLD,
            requestType: request.requestType,
            reviewedBy: actor.id,
            remarks: holdRemarks,
          },
        },
      });

      return updatedReq;
    });

    this.logger.log(
      `ApprovalRequest "${id}" (${request.requestType}) placed ON_HOLD by ${actor.email}`,
    );

    return updated;
  }

  // ============================================================================
  // 4. PIA DIRECT APPROVAL / REJECTION (Legacy compatibility with ApprovalRequest link)
  // ============================================================================

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

      // Update any pending ApprovalRequest for this org
      await tx.approvalRequest.updateMany({
        where: { organizationId: id, status: ApprovalRequestStatus.PENDING },
        data: {
          status: ApprovalRequestStatus.APPROVED,
          reviewedAt: new Date(),
          reviewedById: actorId,
        },
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

      // Update any pending ApprovalRequest for this org
      await tx.approvalRequest.updateMany({
        where: { organizationId: id, status: ApprovalRequestStatus.PENDING },
        data: {
          status: ApprovalRequestStatus.REJECTED,
          reviewedAt: new Date(),
          reviewedById: actorId,
          rejectionReason: dto.rejectionReason || dto.remarks,
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

  // ============================================================================
  // RESPONSE MAPPERS & AUDIT
  // ============================================================================

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
