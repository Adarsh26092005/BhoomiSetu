import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectCategory } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Updated project title',
    example: 'Bangalore–Chennai Expressway Alignment Phase 2 (Amended)',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated scope description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Infrastructure category',
    enum: ProjectCategory,
  })
  @IsEnum(ProjectCategory)
  @IsOptional()
  category?: ProjectCategory;

  @ApiPropertyOptional({
    description: 'Updated state jurisdiction',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Updated districts list',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  districts?: string[];

  @ApiPropertyOptional({
    description: 'Total land area in hectares',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalAreaHectares?: number;

  @ApiPropertyOptional({
    description: 'Estimated compensation in INR',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  estimatedCompensationInr?: number;

  @ApiPropertyOptional({
    description: 'Spatial bounds GeoJSON',
  })
  @IsObject()
  @IsOptional()
  spatialBounds?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Notification date',
  })
  @IsOptional()
  notifiedOn?: string | Date;

  @ApiPropertyOptional({
    description: 'Target completion date',
  })
  @IsOptional()
  targetCompletionOn?: string | Date;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
