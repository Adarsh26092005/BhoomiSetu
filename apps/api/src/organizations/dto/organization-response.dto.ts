import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationStatus, OrganizationType } from '@prisma/client';

export class OrganizationResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiPropertyOptional({ example: 'MORTH-HQ' })
  code?: string | null;

  @ApiProperty({ example: 'Ministry of Road Transport and Highways' })
  name!: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.CENTRAL_MINISTRY })
  type!: OrganizationType;

  @ApiProperty({ enum: OrganizationStatus, example: OrganizationStatus.ACTIVE })
  status!: OrganizationStatus;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  state?: string | null;

  @ApiPropertyOptional({ example: 'Pune' })
  district?: string | null;

  @ApiPropertyOptional()
  jurisdiction?: any;

  @ApiPropertyOptional({ example: 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  parentId?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: 42 })
  userCount?: number;

  @ApiPropertyOptional({ example: 8 })
  projectCount?: number;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-04T00:00:00.000Z' })
  updatedAt!: Date;
}

export class PaginatedOrganizationsResponseDto {
  @ApiProperty({ type: [OrganizationResponseDto] })
  items!: OrganizationResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}
