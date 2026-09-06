import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectCategory, ProjectStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Unique statutory project code / gazette reference',
    example: 'NHAI-BCE-PH2',
  })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({
    description: 'Official title of the acquisition project',
    example: 'Bangalore–Chennai Expressway Alignment Phase 2',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({
    description: 'Detailed scope and alignment description',
    example: 'Four-lane access-controlled greenfield corridor spanning 142.5 km.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Statutory project infrastructure category',
    enum: ProjectCategory,
    default: ProjectCategory.HIGHWAY,
  })
  @IsOptional()
  @IsEnum(ProjectCategory)
  category?: ProjectCategory;

  @ApiPropertyOptional({
    description: 'Initial project status (Defaults to DRAFT)',
    enum: ProjectStatus,
    default: ProjectStatus.DRAFT,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description:
      'Implementing Agency Organization ID. For PIA users, automatically locked to their own organization.',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsString()
  implementingAgencyOrgId?: string;

  @ApiPropertyOptional({
    description: 'Nodal Ministry Organization ID',
    example: 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  })
  @IsOptional()
  @IsString()
  nodalMinistryOrgId?: string;

  @ApiPropertyOptional({
    description: 'State Authority Organization ID',
    example: 'c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  })
  @IsOptional()
  @IsString()
  stateAuthorityOrgId?: string;

  @ApiPropertyOptional({
    description: 'District Authority Organization ID',
    example: 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  })
  @IsOptional()
  @IsString()
  districtAuthorityOrgId?: string;

  @ApiProperty({
    description: 'Primary state under which the project is situated',
    example: 'Maharashtra',
  })
  @IsNotEmpty()
  @IsString()
  state!: string;

  @ApiProperty({
    description: 'List of district names covered by the corridor',
    example: ['Nagpur', 'Wardha'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  districts!: string[];

  @ApiPropertyOptional({
    description: 'Total proposed land area in hectares',
    example: 350.5,
    default: 0.0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAreaHectares?: number;

  @ApiPropertyOptional({
    description: 'Estimated statutory compensation budget in INR',
    example: 1500000000.0,
    default: 0.0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedCompensationInr?: number;

  @ApiPropertyOptional({
    description: 'Corridor spatial geometry / GeoJSON bounds',
    example: { type: 'Polygon', coordinates: [] },
  })
  @IsObject()
  @IsOptional()
  spatialBounds?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Section 4 / Preliminary notification issuance date',
    example: '2026-03-15T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsOptional()
  notifiedOn?: Date;

  @ApiPropertyOptional({
    description: 'Target completion / handover date',
    example: '2028-12-31T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsOptional()
  targetCompletionOn?: Date;

  @ApiPropertyOptional({
    description: 'Extensible metadata for ministry/statutory tracking',
    example: { gazetteNumber: 'GSR-409/2026', cceaApprovalDate: '2026-01-10' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
