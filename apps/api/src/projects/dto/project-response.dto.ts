import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectCategory, ProjectStatus, UserRole } from '@prisma/client';

export class ImplementingAgencySummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  code?: string | null;

  @ApiPropertyOptional()
  state?: string | null;

  @ApiPropertyOptional()
  district?: string | null;
}

export class ProjectAssignmentSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  userName!: string;

  @ApiProperty()
  userEmail!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty()
  assignedAt!: Date;

  @ApiProperty()
  isActive!: boolean;
}

export class ProjectResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty({ enum: ProjectCategory })
  category!: ProjectCategory;

  @ApiProperty({ enum: ProjectStatus })
  status!: ProjectStatus;

  @ApiProperty()
  implementingAgencyOrgId!: string;

  @ApiPropertyOptional({ type: ImplementingAgencySummaryDto })
  implementingAgency?: ImplementingAgencySummaryDto;

  @ApiProperty()
  state!: string;

  @ApiProperty({ type: [String] })
  districts!: string[];

  @ApiProperty()
  totalAreaHectares!: number;

  @ApiProperty()
  estimatedCompensationInr!: number;

  @ApiProperty()
  disbursedCompensationInr!: number;

  @ApiPropertyOptional()
  spatialBounds?: any;

  @ApiPropertyOptional()
  notifiedOn?: Date | null;

  @ApiPropertyOptional()
  targetCompletionOn?: Date | null;

  @ApiPropertyOptional()
  metadata?: any;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  parcelCount!: number;

  @ApiProperty()
  documentCount!: number;

  @ApiProperty()
  workflowTaskCount!: number;

  @ApiProperty()
  affectedHouseholdCount!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ProjectDetailResponseDto extends ProjectResponseDto {
  @ApiProperty({ type: [ProjectAssignmentSummaryDto] })
  assignments!: ProjectAssignmentSummaryDto[];
}

export class PaginatedProjectsResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  items!: ProjectResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}

export class ProjectSummaryKpiDto {
  @ApiProperty({ description: 'Total projects in authorized scope' })
  totalProjects!: number;

  @ApiProperty({ description: 'Projects currently in statutory process' })
  inStatutoryProcess!: number;

  @ApiProperty({ description: 'Projects with possession completed / handover' })
  completedHandover!: number;

  @ApiProperty({ description: 'Total land area under acquisition in hectares' })
  totalAreaHectares!: number;

  @ApiProperty({ description: 'Total estimated compensation budget in INR' })
  totalEstimatedCompensationInr!: number;

  @ApiProperty({ description: 'Total compensation disbursed in INR' })
  totalDisbursedCompensationInr!: number;
}
