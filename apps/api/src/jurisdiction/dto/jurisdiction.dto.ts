import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { AdminJurisdictionLevel } from '@prisma/client';

export class CreateAdministrativeAreaDto {
  @ApiProperty({ example: 'MH-01', description: 'Unique administrative area code (e.g., MH-01, MH-02, UP-01)' })
  @IsString()
  @IsNotEmpty({ message: 'Area code is required' })
  @MaxLength(50)
  code!: string;

  @ApiProperty({ example: 'Western Maharashtra Zone', description: 'Display name of the administrative area' })
  @IsString()
  @IsNotEmpty({ message: 'Area name is required' })
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'Maharashtra', description: 'State jurisdiction' })
  @IsString()
  @IsNotEmpty({ message: 'State is required' })
  @MaxLength(100)
  state!: string;

  @ApiPropertyOptional({ example: 'Covers Pune, Satara, Kolhapur districts', description: 'Description or jurisdictional notes' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['Pune', 'Satara', 'Kolhapur'],
    description: 'Array of district names covered under this administrative area',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  districts!: string[];

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreateSuperAdminAssignmentDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', description: 'User ID of the SUPER_ADMIN to assign' })
  @IsUUID('4', { message: 'userId must be a valid UUID' })
  @IsNotEmpty({ message: 'userId is required' })
  userId!: string;

  @ApiPropertyOptional({
    example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    description: 'Administrative Area ID (required if jurisdictionLevel is STATE_AREA)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'administrativeAreaId must be a valid UUID' })
  administrativeAreaId?: string;

  @ApiProperty({
    enum: AdminJurisdictionLevel,
    example: AdminJurisdictionLevel.STATE_AREA,
    description: 'Jurisdiction Level: CENTRAL for nationwide, STATE_AREA for specific area',
  })
  @IsEnum(AdminJurisdictionLevel, { message: 'jurisdictionLevel must be CENTRAL or STATE_AREA' })
  @IsNotEmpty({ message: 'jurisdictionLevel is required' })
  jurisdictionLevel!: AdminJurisdictionLevel;

  @ApiPropertyOptional({ example: true, default: false, description: 'Designates this admin as primary for the area' })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class ApprovalDecisionDto {
  @ApiPropertyOptional({ example: 'All statutory documents verified and approved.', description: 'Approval remarks' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;

  @ApiPropertyOptional({ example: 'Invalid departmental credentials or unverified jurisdiction.', description: 'Reason for rejection' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  rejectionReason?: string;
}
