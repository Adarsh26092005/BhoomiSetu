import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationType, OrganizationStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiPropertyOptional({ example: 'MORTH-HQ', description: 'Unique administrative code' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  code?: string;

  @ApiProperty({ example: 'Ministry of Road Transport and Highways' })
  @IsString()
  @IsNotEmpty({ message: 'Organization name is required' })
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: OrganizationType, example: OrganizationType.CENTRAL_MINISTRY })
  @IsEnum(OrganizationType, { message: 'Invalid organization type' })
  type!: OrganizationType;

  @ApiPropertyOptional({ enum: OrganizationStatus, example: OrganizationStatus.ACTIVE })
  @IsOptional()
  @IsEnum(OrganizationStatus)
  status?: OrganizationStatus;

  @ApiPropertyOptional({ example: 'Maharashtra' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ example: 'Pune' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({ description: 'Parent organization UUID for hierarchy linking' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Administrative boundary GeoJSON or jurisdiction metadata' })
  @IsOptional()
  jurisdiction?: Record<string, any>;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  isActive?: boolean;
}
