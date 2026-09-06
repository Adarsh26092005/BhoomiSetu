import { LandType, ParcelStatus } from '@prisma/client';

export class ParcelResponseDto {
  id!: string;
  surveyNumber!: string;
  khasraNumber?: string | null;
  projectId!: string;
  projectTitle?: string;
  projectCode?: string;
  village!: string;
  tehsil?: string | null;
  district!: string;
  state!: string;
  landType!: LandType;
  areaHectares!: number;
  status!: ParcelStatus;
  marketRateInrPerHectare!: number;
  compensationInr!: number;
  centroidLat?: number | null;
  centroidLng?: number | null;
  spatialGeometry?: any;
  gisPolygonReference?: string | null;
  metadata?: any;
  landownerCount?: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}

export class PaginatedParcelsResponseDto {
  items!: ParcelResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
  totalPages!: number;
}

export class ParcelDetailResponseDto extends ParcelResponseDto {
  landowners?: Array<{
    id: string;
    landownerId: string;
    fullName: string;
    fatherOrSpouseName?: string | null;
    ownershipPercentage: number;
    eligibleAreaHectares: number;
    verificationStatus: string;
  }>;
}

export class ParcelSummaryDto {
  totalParcels!: number;
  verifiedParcels!: number;
  disputedParcels!: number;
  compensationPendingParcels!: number;
  possessionTakenParcels!: number;
  totalAreaHectares!: number;
  totalCompensationInr!: number;
}
