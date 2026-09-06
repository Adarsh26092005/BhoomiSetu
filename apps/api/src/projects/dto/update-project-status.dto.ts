import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '@prisma/client';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'Target statutory project lifecycle status',
    enum: ProjectStatus,
  })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status!: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Statutory notes, approval remarks, or administrative justification',
    example: 'Approved under Section 15(1) preliminary scrutiny report.',
  })
  @IsString()
  @IsOptional()
  remarks?: string;

  @ApiPropertyOptional({
    description: 'Statutory reason for rejection (required if status is REJECTED)',
    example: 'Alignment conflicts with critical wildlife sanctuary corridor buffer zone.',
  })
  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @ApiPropertyOptional({
    description: 'Administrative hold reason (required if status is ON_HOLD)',
    example: 'Pending High Court stay order resolution regarding Section 4 notification.',
  })
  @IsString()
  @IsOptional()
  holdReason?: string;
}
