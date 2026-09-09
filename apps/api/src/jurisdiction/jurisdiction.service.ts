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
  AdminJurisdictionLevel,
  ApprovalRequestStatus,
  ApprovalRequestType,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import {
  AdministrativeAreaResponse,
  EffectiveJurisdictionScope,
  SuperAdminAssignmentResponse,
} from './jurisdiction.types';
import {
  CreateAdministrativeAreaDto,
  CreateSuperAdminAssignmentDto,
} from './dto/jurisdiction.dto';

@Injectable()
export class JurisdictionService {
  private readonly logger = new Logger(JurisdictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // 1. RESOLVE EFFECTIVE SCOPE
  // ============================================================================

  async resolveEffectiveScope(user: {
    id: string;
    role: UserRole;
    accountType?: AccountType;
    organizationId?: string;
  }): Promise<EffectiveJurisdictionScope> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organization: true,
        superAdminAssignments: {
          where: { isActive: true },
          include: {
            administrativeArea: {
              include: {
                districts: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        projectAssignments: {
          where: { isActive: true },
          select: { projectId: true },
        },
      },
    });

    const role = dbUser?.role || user.role;
    const accountType = dbUser?.accountType || user.accountType || AccountType.GOVERNMENT_OFFICER;
    const org = dbUser?.organization;
    const assignedProjectIds = (dbUser?.projectAssignments || []).map((p) => p.projectId);

    // Default base scope template
    const baseScope: EffectiveJurisdictionScope = {
      userId: user.id,
      role,
      accountType,
      level: 'CENTRAL',
      isCentral: false,
      isStateArea: false,
      isStateScoped: false,
      isDistrictScoped: false,
      isProjectRestricted: false,
      state: org?.state || null,
      districts: [],
      administrativeAreaId: null,
      administrativeAreaCode: null,
      administrativeAreaName: null,
      adminJurisdictionLevel: null,
      organizationId: org?.id || user.organizationId || null,
      organizationType: org?.type || null,
      organizationState: org?.state || null,
      organizationDistrict: org?.district || null,
      assignedProjectIds,
    };

    // A. SUPER_ADMIN SCOPING
    if (role === UserRole.SUPER_ADMIN) {
      const activeAssignment = dbUser?.superAdminAssignments?.[0];

      if (activeAssignment) {
        if (activeAssignment.jurisdictionLevel === AdminJurisdictionLevel.CENTRAL) {
          return {
            ...baseScope,
            level: 'CENTRAL',
            jurisdictionLevel: 'CENTRAL',
            isCentral: true,
            administrativeArea: null,
            districts: [],
            adminJurisdictionLevel: AdminJurisdictionLevel.CENTRAL,
          };
        }

        if (
          activeAssignment.jurisdictionLevel === AdminJurisdictionLevel.STATE_AREA &&
          activeAssignment.administrativeArea
        ) {
          const area = activeAssignment.administrativeArea;
          const districtNames = area.districts.map((d) => d.district);
          return {
            ...baseScope,
            level: 'STATE_AREA',
            jurisdictionLevel: 'STATE_AREA',
            isStateArea: true,
            state: area.state,
            districts: districtNames,
            administrativeAreaId: area.id,
            administrativeAreaCode: area.code,
            administrativeAreaName: area.name,
            administrativeArea: {
              id: area.id,
              code: area.code,
              name: area.name,
              state: area.state,
            },
            adminJurisdictionLevel: AdminJurisdictionLevel.STATE_AREA,
          };
        }
      }

      // Fallback if no SuperAdminAssignment record:
      // If organization has state/district, scope to it; else central nationwide
      if (org?.state && org?.district) {
        return {
          ...baseScope,
          level: 'DISTRICT',
          isDistrictScoped: true,
          state: org.state,
          districts: [org.district],
        };
      }
      if (org?.state) {
        return {
          ...baseScope,
          level: 'STATE',
          isStateScoped: true,
          state: org.state,
          districts: [],
        };
      }

      return {
        ...baseScope,
        level: 'CENTRAL',
        isCentral: true,
        adminJurisdictionLevel: AdminJurisdictionLevel.CENTRAL,
      };
    }

    // B. CENTRAL OFFICER
    if (role === UserRole.CENTRAL_OFFICER) {
      return {
        ...baseScope,
        level: 'CENTRAL',
        isCentral: true,
      };
    }

    // C. STATE OFFICER
    if (role === UserRole.STATE_OFFICER) {
      return {
        ...baseScope,
        level: 'STATE',
        isStateScoped: true,
        state: org?.state || null,
      };
    }

    // D. DISTRICT OFFICER & SPECIALIZED LOCAL OFFICERS
    if (
      role === UserRole.DISTRICT_OFFICER ||
      role === UserRole.LAND_ACQUISITION_OFFICER ||
      role === UserRole.SURVEY_OFFICER ||
      role === UserRole.REVENUE_OFFICER ||
      role === UserRole.VERIFICATION_OFFICER ||
      role === UserRole.FINANCE_OFFICER ||
      role === UserRole.R_AND_R_OFFICER
    ) {
      return {
        ...baseScope,
        level: org?.district ? 'DISTRICT' : org?.state ? 'STATE' : 'CENTRAL',
        isDistrictScoped: !!org?.district,
        isStateScoped: !org?.district && !!org?.state,
        state: org?.state || null,
        districts: org?.district ? [org.district] : [],
      };
    }

    // E. PIA & VIEWER
    return {
      ...baseScope,
      level: 'PROJECT_RESTRICTED',
      isProjectRestricted: true,
      state: org?.state || null,
      districts: org?.district ? [org.district] : [],
    };
  }

  // ============================================================================
  // 2. QUERY FILTER BUILDERS (PRISMA WHERE CLAUSES)
  // ============================================================================

  buildProjectWhere(scope: EffectiveJurisdictionScope): Prisma.ProjectWhereInput {
    if (scope.isCentral) {
      return {};
    }

    if (scope.isStateArea) {
      const conditions: Prisma.ProjectWhereInput[] = [];
      if (scope.state) {
        conditions.push({ state: { equals: scope.state, mode: 'insensitive' } });
      }
      if (scope.districts && scope.districts.length > 0) {
        conditions.push({
          OR: scope.districts.map((district) => ({
            districts: { array_contains: district },
          })),
        });
      }
      return { AND: conditions };
    }

    if (scope.isStateScoped) {
      return scope.state
        ? { state: { equals: scope.state, mode: 'insensitive' } }
        : {};
    }

    if (scope.isDistrictScoped) {
      const orConditions: Prisma.ProjectWhereInput[] = [
        { assignments: { some: { userId: scope.userId, isActive: true } } },
      ];

      if (scope.state || scope.districts.length > 0) {
        const geoScope: Prisma.ProjectWhereInput = {};
        if (scope.state) {
          geoScope.state = { equals: scope.state, mode: 'insensitive' };
        }
        if (scope.districts.length > 0) {
          geoScope.OR = scope.districts.map((d) => ({
            districts: { array_contains: d },
          }));
        }
        orConditions.push(geoScope);
      }

      return { OR: orConditions };
    }

    // PROJECT_RESTRICTED
    return {
      OR: [
        { implementingAgencyOrgId: scope.organizationId || undefined },
        { assignments: { some: { userId: scope.userId, isActive: true } } },
      ],
    };
  }

  buildParcelWhere(scope: EffectiveJurisdictionScope): Prisma.ParcelWhereInput {
    if (scope.isCentral) {
      return {};
    }

    if (scope.isStateArea) {
      const where: Prisma.ParcelWhereInput = {};
      if (scope.state) {
        where.state = { equals: scope.state, mode: 'insensitive' };
      }
      if (scope.districts.length > 0) {
        where.district = { in: scope.districts, mode: 'insensitive' };
      }
      return where;
    }

    if (scope.isStateScoped) {
      return scope.state
        ? { state: { equals: scope.state, mode: 'insensitive' } }
        : {};
    }

    if (scope.isDistrictScoped) {
      const orConditions: Prisma.ParcelWhereInput[] = [
        { project: { assignments: { some: { userId: scope.userId, isActive: true } } } },
      ];

      const geoScope: Prisma.ParcelWhereInput = {};
      if (scope.state) {
        geoScope.state = { equals: scope.state, mode: 'insensitive' };
      }
      if (scope.districts.length > 0) {
        geoScope.district = { in: scope.districts, mode: 'insensitive' };
      }
      orConditions.push(geoScope);

      return { OR: orConditions };
    }

    // PROJECT_RESTRICTED
    return {
      OR: [
        { project: { implementingAgencyOrgId: scope.organizationId || undefined } },
        { project: { assignments: { some: { userId: scope.userId, isActive: true } } } },
      ],
    };
  }

  buildUserWhere(scope: EffectiveJurisdictionScope): Prisma.UserWhereInput {
    if (scope.isCentral) {
      return {};
    }

    if (scope.isStateArea) {
      const orgWhere = this.buildOrganizationWhere(scope);
      return {
        organization: orgWhere,
      };
    }

    if (scope.isStateScoped) {
      return {
        organization: {
          state: scope.state ? { equals: scope.state, mode: 'insensitive' } : undefined,
        },
      };
    }

    if (scope.isDistrictScoped) {
      return {
        organization: {
          state: scope.state ? { equals: scope.state, mode: 'insensitive' } : undefined,
          district:
            scope.districts.length > 0
              ? { in: scope.districts, mode: 'insensitive' }
              : undefined,
        },
      };
    }

    // PROJECT_RESTRICTED
    return {
      organizationId: scope.organizationId || undefined,
    };
  }

  buildOrganizationWhere(scope: EffectiveJurisdictionScope): Prisma.OrganizationWhereInput {
    if (scope.isCentral) {
      return {};
    }

    if (scope.isStateArea) {
      const orClauses: Prisma.OrganizationWhereInput[] = [];

      // 1. District authorities / entities in covered districts
      if (scope.state && scope.districts.length > 0) {
        orClauses.push({
          state: { equals: scope.state, mode: 'insensitive' },
          district: { in: scope.districts, mode: 'insensitive' },
        });
      }

      // 2. Parent state-level authority in caller state (where district is null/empty)
      if (scope.state) {
        orClauses.push({
          state: { equals: scope.state, mode: 'insensitive' },
          district: null,
        });
      }

      // 3. User's own organization
      if (scope.organizationId) {
        orClauses.push({
          id: scope.organizationId,
        });
      }

      return { OR: orClauses };
    }

    if (scope.isStateScoped) {
      return {
        state: scope.state ? { equals: scope.state, mode: 'insensitive' } : undefined,
      };
    }

    if (scope.isDistrictScoped) {
      return {
        state: scope.state ? { equals: scope.state, mode: 'insensitive' } : undefined,
        district:
          scope.districts.length > 0
            ? { in: scope.districts, mode: 'insensitive' }
            : undefined,
      };
    }

    return {
      id: scope.organizationId || undefined,
    };
  }

  buildApprovalRequestWhere(scope: EffectiveJurisdictionScope): Prisma.ApprovalRequestWhereInput {
    if (scope.isCentral) {
      return {};
    }

    if (scope.isStateArea) {
      const orConditions: Prisma.ApprovalRequestWhereInput[] = [];
      if (scope.userId) {
        orConditions.push({ assignedApproverId: scope.userId });
        orConditions.push({ reviewedById: scope.userId });
      }
      if (scope.administrativeAreaId) {
        orConditions.push({ administrativeAreaId: scope.administrativeAreaId });
      }
      if (scope.state && scope.districts.length > 0) {
        orConditions.push({
          state: { equals: scope.state, mode: 'insensitive' },
          district: { in: scope.districts, mode: 'insensitive' },
        });
      }
      return { OR: orConditions.length > 0 ? orConditions : undefined };
    }

    if (scope.isStateScoped) {
      return {
        state: scope.state ? { equals: scope.state, mode: 'insensitive' } : undefined,
      };
    }

    if (scope.isDistrictScoped) {
      return {
        state: scope.state ? { equals: scope.state, mode: 'insensitive' } : undefined,
        district:
          scope.districts.length > 0
            ? { in: scope.districts, mode: 'insensitive' }
            : undefined,
      };
    }

    return {
      organizationId: scope.organizationId || undefined,
    };
  }

  buildAuditLogWhere(scope: EffectiveJurisdictionScope): Prisma.AuditLogWhereInput {
    if (scope.isCentral) {
      return {};
    }

    if (scope.isStateArea || scope.isStateScoped || scope.isDistrictScoped) {
      return {
        OR: [
          { actorId: scope.userId },
          { organizationId: scope.organizationId || undefined },
        ],
      };
    }

    return {
      OR: [
        { actorId: scope.userId },
        { organizationId: scope.organizationId || undefined },
      ],
    };
  }

  // ============================================================================
  // 3. FINE-GRAINED ENTITY ACCESS VALIDATORS
  // ============================================================================

  canAccessProject(
    scope: EffectiveJurisdictionScope,
    project: {
      id: string;
      state: string;
      districts: any;
      implementingAgencyOrgId: string;
      assignments?: { userId: string; isActive: boolean }[];
    },
  ): boolean {
    if (scope.isCentral) return true;

    // Check direct assignment
    const isAssigned = project.assignments?.some(
      (a) => a.userId === scope.userId && a.isActive,
    );
    if (isAssigned) return true;

    if (scope.isProjectRestricted) {
      return project.implementingAgencyOrgId === scope.organizationId;
    }

    if (scope.isStateArea) {
      if (
        scope.state &&
        project.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (scope.districts && scope.districts.length > 0) {
        const projectDistricts = Array.isArray(project.districts)
          ? (project.districts as string[]).map((d) => d.toLowerCase())
          : [];
        const hasOverlap = scope.districts.some((d) =>
          projectDistricts.includes(d.toLowerCase()),
        );
        return hasOverlap;
      }
      return true;
    }

    if (scope.isStateScoped) {
      if (
        scope.state &&
        project.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      return true;
    }

    if (scope.isDistrictScoped) {
      if (
        scope.state &&
        project.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (scope.districts && scope.districts.length > 0) {
        const projectDistricts = Array.isArray(project.districts)
          ? (project.districts as string[]).map((d) => d.toLowerCase())
          : [];
        const hasOverlap = scope.districts.some((d) =>
          projectDistricts.includes(d.toLowerCase()),
        );
        return hasOverlap;
      }
      return true;
    }

    return false;
  }

  canAccessParcel(
    scope: EffectiveJurisdictionScope,
    parcel: {
      id: string;
      state: string;
      district: string;
      projectId?: string;
      project?: {
        id: string;
        state: string;
        districts: any;
        implementingAgencyOrgId: string;
        assignments?: { userId: string; isActive: boolean }[];
      };
    },
  ): boolean {
    if (scope.isCentral) return true;

    if (parcel.project) {
      return this.canAccessProject(scope, parcel.project);
    }

    if (scope.isStateArea) {
      if (
        scope.state &&
        parcel.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (scope.districts.length > 0) {
        return scope.districts.some(
          (d) => d.toLowerCase() === parcel.district.toLowerCase(),
        );
      }
      return true;
    }

    if (scope.isStateScoped) {
      return (
        !scope.state ||
        parcel.state.toLowerCase() === scope.state.toLowerCase()
      );
    }

    if (scope.isDistrictScoped) {
      if (
        scope.state &&
        parcel.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (scope.districts.length > 0) {
        return scope.districts.some(
          (d) => d.toLowerCase() === parcel.district.toLowerCase(),
        );
      }
      return true;
    }

    return false;
  }

  canAccessUser(
    scope: EffectiveJurisdictionScope,
    targetUser: {
      id: string;
      organizationId: string;
      organization?: {
        id?: string;
        state?: string | null;
        district?: string | null;
      } | null;
    },
  ): boolean {
    if (scope.isCentral) return true;
    if (targetUser.id === scope.userId) return true;

    if (scope.isProjectRestricted) {
      return targetUser.organizationId === scope.organizationId;
    }

    const org = targetUser.organization;
    if (!org) return false;

    return this.canAccessOrganization(scope, {
      id: targetUser.organizationId || (org as any).id || '',
      state: org.state,
      district: org.district,
    });
  }

  canAccessOrganization(
    scope: EffectiveJurisdictionScope,
    org: {
      id: string;
      state?: string | null;
      district?: string | null;
    },
  ): boolean {
    if (scope.isCentral) return true;
    if (org.id && scope.organizationId && org.id === scope.organizationId) return true;

    if (scope.isProjectRestricted) {
      return org.id === scope.organizationId;
    }

    if (scope.isStateArea) {
      if (
        scope.state &&
        org.state &&
        org.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (org.district && scope.districts.length > 0) {
        return scope.districts.some(
          (d) => d.toLowerCase() === org.district!.toLowerCase(),
        );
      }
      if (!org.district && scope.state && org.state && org.state.toLowerCase() === scope.state.toLowerCase()) {
        return true;
      }
      return false;
    }

    if (scope.isStateScoped) {
      return (
        !scope.state ||
        !org.state ||
        org.state.toLowerCase() === scope.state.toLowerCase()
      );
    }

    if (scope.isDistrictScoped) {
      if (
        scope.state &&
        org.state &&
        org.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (scope.districts.length > 0) {
        if (!org.district) return false;
        return scope.districts.some(
          (d) => d.toLowerCase() === org.district!.toLowerCase(),
        );
      }
      return true;
    }

    return false;
  }

  canAccessApprovalRequest(
    scope: EffectiveJurisdictionScope,
    req: {
      id: string;
      administrativeAreaId?: string | null;
      assignedApproverId?: string | null;
      reviewedById?: string | null;
      state: string;
      district?: string | null;
      organizationId?: string | null;
    },
  ): boolean {
    if (scope.isCentral) return true;

    if (scope.isStateArea) {
      if (req.assignedApproverId && req.assignedApproverId === scope.userId) {
        return true;
      }
      if (req.reviewedById && req.reviewedById === scope.userId) {
        return true;
      }
      if (
        req.administrativeAreaId &&
        scope.administrativeAreaId &&
        req.administrativeAreaId === scope.administrativeAreaId
      ) {
        return true;
      }
      if (
        scope.state &&
        req.state.toLowerCase() !== scope.state.toLowerCase()
      ) {
        return false;
      }
      if (scope.districts.length > 0) {
        if (!req.district) return false;
        return scope.districts.some(
          (d) => d.toLowerCase() === req.district!.toLowerCase(),
        );
      }
      return false;
    }

    if (scope.isStateScoped) {
      return req.state.toLowerCase() === (scope.state || '').toLowerCase();
    }

    if (scope.isDistrictScoped) {
      if (req.state.toLowerCase() !== (scope.state || '').toLowerCase()) {
        return false;
      }
      if (scope.districts.length > 0 && req.district) {
        return scope.districts.some(
          (d) => d.toLowerCase() === req.district!.toLowerCase(),
        );
      }
      return false;
    }

    return req.organizationId === scope.organizationId;
  }

  canAccessDocument(
    scope: EffectiveJurisdictionScope,
    doc: { id: string; project?: any; parcel?: any },
  ): boolean {
    if (scope.isCentral) return true;
    if (doc.project) {
      return this.canAccessProject(scope, doc.project);
    }
    if (doc.parcel) {
      return this.canAccessParcel(scope, doc.parcel);
    }
    return false;
  }

  canAccessWorkflowTask(
    scope: EffectiveJurisdictionScope,
    task: {
      id: string;
      projectId: string;
      project?: any;
      assignedOfficerId?: string;
      assignedOrgId?: string;
    },
  ): boolean {
    if (scope.isCentral) return true;
    if (task.assignedOfficerId === scope.userId) return true;
    if (task.assignedOrgId === scope.organizationId) return true;
    if (task.project) {
      return this.canAccessProject(scope, task.project);
    }
    return false;
  }

  canAccessCompensation(
    scope: EffectiveJurisdictionScope,
    comp: {
      id: string;
      projectId: string;
      parcelId: string;
      project?: any;
      parcel?: any;
    },
  ): boolean {
    if (scope.isCentral) return true;
    if (comp.project) {
      return this.canAccessProject(scope, comp.project);
    }
    if (comp.parcel) {
      return this.canAccessParcel(scope, comp.parcel);
    }
    return false;
  }

  canAccessPossession(
    scope: EffectiveJurisdictionScope,
    poss: {
      id: string;
      projectId: string;
      parcelId: string;
      assignedOfficerId?: string;
      project?: any;
      parcel?: any;
    },
  ): boolean {
    if (scope.isCentral) return true;
    if (poss.assignedOfficerId === scope.userId) return true;
    if (poss.project) {
      return this.canAccessProject(scope, poss.project);
    }
    if (poss.parcel) {
      return this.canAccessParcel(scope, poss.parcel);
    }
    return false;
  }

  canAccessRAndR(
    scope: EffectiveJurisdictionScope,
    randr: { id: string; projectId: string; project?: any },
  ): boolean {
    if (scope.isCentral) return true;
    if (randr.project) {
      return this.canAccessProject(scope, randr.project);
    }
    return false;
  }

  // ============================================================================
  // 4. ADMINISTRATIVE AREA & SUPER ADMIN RESOLUTION HELPERS
  // ============================================================================

  async findAreaByStateAndDistrict(
    state: string,
    district?: string | null,
  ): Promise<{ id: string; code: string; name: string; state: string } | null> {
    const trimmedState = state.trim();
    if (district && district.trim()) {
      const trimmedDistrict = district.trim();
      const areaDistrict = await this.prisma.administrativeAreaDistrict.findFirst({
        where: {
          district: { equals: trimmedDistrict, mode: 'insensitive' },
          administrativeArea: {
            state: { equals: trimmedState, mode: 'insensitive' },
            active: true,
          },
        },
        include: {
          administrativeArea: true,
        },
      });
      if (areaDistrict?.administrativeArea) {
        return areaDistrict.administrativeArea;
      }
    }

    // Check all active administrative areas in this state
    const matchingAreas =
      (await this.prisma.administrativeArea.findMany({
        where: {
          state: { equals: trimmedState, mode: 'insensitive' },
          active: true,
        },
      })) || [];

    if (matchingAreas.length > 1 && !district) {
      throw new BadRequestException(
        'District is required because this state has multiple administrative areas.',
      );
    }

    if (matchingAreas.length === 1) {
      return matchingAreas[0];
    }

    return null;
  }

  async findApproversForArea(
    administrativeAreaId?: string | null,
    _state?: string | null,
    _district?: string | null,
  ): Promise<string[]> {
    if (administrativeAreaId) {
      const assignments =
        (await this.prisma.superAdminAssignment.findMany({
          where: {
            administrativeAreaId,
            isActive: true,
          },
          select: { userId: true },
        })) || [];
      if (assignments.length > 0) {
        return assignments.map((a) => a.userId);
      }
    }

    // Fallback: Central Super Admins
    const centralAssignments =
      (await this.prisma.superAdminAssignment.findMany({
        where: {
          jurisdictionLevel: AdminJurisdictionLevel.CENTRAL,
          isActive: true,
        },
        select: { userId: true },
      })) || [];
    if (centralAssignments.length > 0) {
      return centralAssignments.map((a) => a.userId);
    }

    // Default: all active Super Admins
    const superAdmins = await this.prisma.user.findMany({
      where: {
        role: UserRole.SUPER_ADMIN,
        isActive: true,
      },
      select: { id: true },
    });

    return superAdmins.map((u) => u.id);
  }

  // ============================================================================
  // 5. ADMINISTRATIVE AREA & ASSIGNMENT CRUD (CENTRAL SUPER ADMIN ONLY)
  // ============================================================================

  async createAdministrativeArea(
    dto: CreateAdministrativeAreaDto,
    actorId?: string,
  ): Promise<AdministrativeAreaResponse> {
    const existing = await this.prisma.administrativeArea.findUnique({
      where: { code: dto.code.trim().toUpperCase() },
    });
    if (existing) {
      throw new ConflictException(
        `Administrative Area with code "${dto.code}" already exists`,
      );
    }

    const area = await this.prisma.$transaction(async (tx) => {
      const created = await tx.administrativeArea.create({
        data: {
          code: dto.code.trim().toUpperCase(),
          name: dto.name.trim(),
          state: dto.state.trim(),
          description: dto.description?.trim() || null,
          active: dto.active !== undefined ? dto.active : true,
          districts: {
            create: (dto.districts || []).map((d) => ({
              district: d.trim(),
            })),
          },
        },
        include: {
          districts: true,
        },
      });

      if (actorId) {
        await tx.auditLog.create({
          data: {
            actorId,
            action: 'CREATE_ADMINISTRATIVE_AREA',
            entityType: 'AdministrativeArea',
            entityId: created.id,
            newState: {
              code: created.code,
              name: created.name,
              state: created.state,
              districts: dto.districts,
            },
          },
        });
      }

      return created;
    });

    return {
      id: area.id,
      code: area.code,
      name: area.name,
      state: area.state,
      description: area.description,
      active: area.active,
      districts: area.districts.map((d) => d.district),
      createdAt: area.createdAt,
      updatedAt: area.updatedAt,
    };
  }

  async listAdministrativeAreas(
    scope: EffectiveJurisdictionScope,
  ): Promise<AdministrativeAreaResponse[]> {
    const where: Prisma.AdministrativeAreaWhereInput = {};

    if (!scope.isCentral) {
      if (scope.isStateArea && scope.administrativeAreaId) {
        where.id = scope.administrativeAreaId;
      } else if (scope.state) {
        where.state = { equals: scope.state, mode: 'insensitive' };
      }
    }

    const areas = await this.prisma.administrativeArea.findMany({
      where,
      include: {
        districts: true,
      },
      orderBy: [{ state: 'asc' }, { code: 'asc' }],
    });

    return areas.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      state: a.state,
      description: a.description,
      active: a.active,
      districts: a.districts.map((d) => d.district),
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));
  }

  async assignSuperAdmin(
    dto: CreateSuperAdminAssignmentDto,
    actorId?: string,
  ): Promise<SuperAdminAssignmentResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${dto.userId}" not found`);
    }
    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new BadRequestException('User must have SUPER_ADMIN role for Super Admin assignment');
    }

    if (
      dto.jurisdictionLevel === AdminJurisdictionLevel.STATE_AREA &&
      !dto.administrativeAreaId
    ) {
      throw new BadRequestException(
        'administrativeAreaId is required when jurisdictionLevel is STATE_AREA',
      );
    }

    if (dto.administrativeAreaId) {
      const area = await this.prisma.administrativeArea.findUnique({
        where: { id: dto.administrativeAreaId },
      });
      if (!area) {
        throw new NotFoundException(
          `Administrative Area with ID "${dto.administrativeAreaId}" not found`,
        );
      }
    }

    const assignment = await this.prisma.$transaction(async (tx) => {
      // Deactivate previous active assignments for this user if primary
      await tx.superAdminAssignment.updateMany({
        where: { userId: dto.userId, isActive: true },
        data: { isActive: false },
      });

      const created = await tx.superAdminAssignment.create({
        data: {
          userId: dto.userId,
          administrativeAreaId:
            dto.jurisdictionLevel === AdminJurisdictionLevel.STATE_AREA
              ? dto.administrativeAreaId
              : null,
          jurisdictionLevel: dto.jurisdictionLevel,
          isPrimary: dto.isPrimary ?? false,
          isActive: true,
          assignedById: actorId || null,
        },
        include: {
          user: { select: { fullName: true, email: true } },
          administrativeArea: { select: { code: true, name: true } },
        },
      });

      if (actorId) {
        await tx.auditLog.create({
          data: {
            actorId,
            action: 'ASSIGN_SUPER_ADMIN_JURISDICTION',
            entityType: 'SuperAdminAssignment',
            entityId: created.id,
            newState: {
              userId: created.userId,
              jurisdictionLevel: created.jurisdictionLevel,
              administrativeAreaId: created.administrativeAreaId,
              isPrimary: created.isPrimary,
            },
          },
        });
      }

      return created;
    });

    return {
      id: assignment.id,
      userId: assignment.userId,
      userFullName: assignment.user.fullName,
      userEmail: assignment.user.email,
      administrativeAreaId: assignment.administrativeAreaId,
      administrativeAreaCode: assignment.administrativeArea?.code || null,
      administrativeAreaName: assignment.administrativeArea?.name || null,
      jurisdictionLevel: assignment.jurisdictionLevel,
      isPrimary: assignment.isPrimary,
      isActive: assignment.isActive,
      assignedAt: assignment.assignedAt,
      assignedById: assignment.assignedById,
    };
  }

  async listSuperAdminAssignments(
    scope: EffectiveJurisdictionScope,
  ): Promise<SuperAdminAssignmentResponse[]> {
    const where: Prisma.SuperAdminAssignmentWhereInput = {
      isActive: true,
    };

    if (!scope.isCentral) {
      if (scope.isStateArea && scope.administrativeAreaId) {
        where.administrativeAreaId = scope.administrativeAreaId;
      } else {
        where.userId = scope.userId;
      }
    }

    const assignments = await this.prisma.superAdminAssignment.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true } },
        administrativeArea: { select: { code: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return assignments.map((a) => ({
      id: a.id,
      userId: a.userId,
      userFullName: a.user.fullName,
      userEmail: a.user.email,
      administrativeAreaId: a.administrativeAreaId,
      administrativeAreaCode: a.administrativeArea?.code || null,
      administrativeAreaName: a.administrativeArea?.name || null,
      jurisdictionLevel: a.jurisdictionLevel,
      isPrimary: a.isPrimary,
      isActive: a.isActive,
      assignedAt: a.assignedAt,
      assignedById: a.assignedById,
    }));
  }
}
