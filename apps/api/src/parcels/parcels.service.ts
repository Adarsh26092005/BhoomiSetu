import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { JurisdictionService } from '../jurisdiction/jurisdiction.service';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { ParcelQueryDto } from './dto/parcel-query.dto';
import {
  PaginatedParcelsResponseDto,
  ParcelDetailResponseDto,
  ParcelResponseDto,
  ParcelSummaryDto,
} from './dto/parcel-response.dto';

@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jurisdictionService: JurisdictionService,
  ) {}

  async findAll(
    query: ParcelQueryDto,
    actor: AuthenticatedUser,
  ): Promise<PaginatedParcelsResponseDto> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const scopeWhere = this.jurisdictionService.buildParcelWhere(scope);

    const andConditions: Prisma.ParcelWhereInput[] = [];
    if (Object.keys(scopeWhere).length > 0) {
      andConditions.push(scopeWhere);
    }

    if (query.projectId) {
      andConditions.push({ projectId: query.projectId });
    }

    if (query.status) {
      andConditions.push({ status: query.status });
    }

    if (query.landType) {
      andConditions.push({ landType: query.landType });
    }

    if (query.state) {
      andConditions.push({ state: { contains: query.state, mode: 'insensitive' } });
    }

    if (query.district) {
      andConditions.push({ district: { contains: query.district, mode: 'insensitive' } });
    }

    if (query.village) {
      andConditions.push({ village: { contains: query.village, mode: 'insensitive' } });
    }

    if (query.surveyNumber) {
      andConditions.push({ surveyNumber: { contains: query.surveyNumber, mode: 'insensitive' } });
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      andConditions.push({
        OR: [
          { surveyNumber: { contains: searchTerm, mode: 'insensitive' } },
          { khasraNumber: { contains: searchTerm, mode: 'insensitive' } },
          { village: { contains: searchTerm, mode: 'insensitive' } },
          { tehsil: { contains: searchTerm, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.ParcelWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const allowedSortFields = [
      'createdAt',
      'updatedAt',
      'surveyNumber',
      'areaHectares',
      'compensationInr',
      'village',
    ];
    const sortBy = allowedSortFields.includes(query.sortBy || '')
      ? query.sortBy!
      : 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      this.prisma.parcel.count({ where }),
      this.prisma.parcel.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ [sortBy]: sortOrder }],
        include: {
          project: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          _count: {
            select: {
              parcelLandowners: true,
            },
          },
        },
      }),
    ]);

    const mappedItems: ParcelResponseDto[] = items.map((p) =>
      this.mapToParcelResponse(p),
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
    actor: AuthenticatedUser,
  ): Promise<ParcelDetailResponseDto> {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id },
      include: {
        project: {
          include: {
            assignments: { where: { isActive: true } },
          },
        },
        parcelLandowners: {
          include: {
            landowner: true,
          },
        },
      },
    });

    if (!parcel) {
      throw new NotFoundException(`Parcel with ID "${id}" not found`);
    }

    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    if (!this.jurisdictionService.canAccessParcel(scope, parcel)) {
      throw new ForbiddenException(
        'Forbidden: You do not have jurisdictional authority to access this parcel',
      );
    }

    const base = this.mapToParcelResponse(parcel);
    return {
      ...base,
      landowners: parcel.parcelLandowners.map((pl) => ({
        id: pl.id,
        landownerId: pl.landownerId,
        fullName: pl.landowner?.fullName || 'Landowner',
        fatherOrSpouseName: pl.landowner?.fatherOrSpouseName || null,
        ownershipPercentage: Number(pl.ownershipPercentage) || 0,
        eligibleAreaHectares: Number(pl.eligibleAreaHectares) || 0,
        verificationStatus: pl.verificationStatus,
      })),
    };
  }

  async getSummary(actor: AuthenticatedUser): Promise<ParcelSummaryDto> {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const scopeWhere = this.jurisdictionService.buildParcelWhere(scope);

    const parcels = await this.prisma.parcel.findMany({
      where: scopeWhere,
      select: {
        status: true,
        areaHectares: true,
        compensationInr: true,
      },
    });

    const totalParcels = parcels.length;
    let verifiedParcels = 0;
    let disputedParcels = 0;
    let compensationPendingParcels = 0;
    let possessionTakenParcels = 0;
    let totalAreaHectares = 0;
    let totalCompensationInr = 0;

    for (const p of parcels) {
      if (p.status === 'VERIFIED') verifiedParcels++;
      if (p.status === 'DISPUTED') disputedParcels++;
      if (p.status === 'COMPENSATION_PENDING') compensationPendingParcels++;
      if (p.status === 'POSSESSION_TAKEN') possessionTakenParcels++;
      totalAreaHectares += Number(p.areaHectares) || 0;
      totalCompensationInr += Number(p.compensationInr) || 0;
    }

    return {
      totalParcels,
      verifiedParcels,
      disputedParcels,
      compensationPendingParcels,
      possessionTakenParcels,
      totalAreaHectares: Math.round(totalAreaHectares * 100) / 100,
      totalCompensationInr: Math.round(totalCompensationInr * 100) / 100,
    };
  }

  async exportParcels(
    query: ParcelQueryDto,
    actor: AuthenticatedUser,
  ): Promise<ParcelResponseDto[]> {
    const scope = await this.jurisdictionService.resolveEffectiveScope(actor);
    const scopeWhere = this.jurisdictionService.buildParcelWhere(scope);

    const andConditions: Prisma.ParcelWhereInput[] = [];
    if (Object.keys(scopeWhere).length > 0) {
      andConditions.push(scopeWhere);
    }
    if (query.projectId) andConditions.push({ projectId: query.projectId });
    if (query.status) andConditions.push({ status: query.status });
    if (query.state) andConditions.push({ state: { contains: query.state, mode: 'insensitive' } });
    if (query.district) andConditions.push({ district: { contains: query.district, mode: 'insensitive' } });

    const where: Prisma.ParcelWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const items = await this.prisma.parcel.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: 1000,
      include: {
        project: { select: { id: true, code: true, title: true } },
        _count: { select: { parcelLandowners: true } },
      },
    });

    return items.map((p) => this.mapToParcelResponse(p));
  }

  private mapToParcelResponse(p: any): ParcelResponseDto {
    return {
      id: p.id,
      surveyNumber: p.surveyNumber,
      khasraNumber: p.khasraNumber || null,
      projectId: p.projectId,
      projectTitle: p.project?.title,
      projectCode: p.project?.code,
      village: p.village,
      tehsil: p.tehsil || null,
      district: p.district,
      state: p.state,
      landType: p.landType,
      areaHectares: Number(p.areaHectares) || 0,
      status: p.status,
      marketRateInrPerHectare: Number(p.marketRateInrPerHectare) || 0,
      compensationInr: Number(p.compensationInr) || 0,
      centroidLat: p.centroidLat ? Number(p.centroidLat) : null,
      centroidLng: p.centroidLng ? Number(p.centroidLng) : null,
      spatialGeometry: p.spatialGeometry || null,
      gisPolygonReference: p.gisPolygonReference || null,
      metadata: p.metadata || null,
      landownerCount: p._count?.parcelLandowners ?? 0,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  }
}
