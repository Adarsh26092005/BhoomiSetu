import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class PiaRegisterDto {
  // Organization Information
  @ApiProperty({ example: 'National Highways Authority of India (PIU Pune)' })
  @IsString({ message: 'Organization name must be a string' })
  @IsNotEmpty({ message: 'Organization name is required' })
  @MaxLength(255)
  organizationName!: string;

  @ApiPropertyOptional({ example: 'NHAI-PIU-PUN-2026', description: 'Official corporate/agency registration code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationCode?: string;

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

  @ApiPropertyOptional({ example: 'NHAI Regional Office, Senapati Bapat Road, Pune' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  officeAddress?: string;

  // Primary Authorized Liaison Officer
  @ApiProperty({ example: 'liaison.officer@nhai.gov.in' })
  @IsEmail({}, { message: 'Please provide a valid official email address' })
  @IsNotEmpty({ message: 'Contact email is required' })
  adminEmail!: string;

  @ApiProperty({ example: 'SecurePassword2026!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  adminPassword!: string;

  @ApiProperty({ example: 'Shri Vikramaditya Patil' })
  @IsString()
  @IsNotEmpty({ message: 'Authorized representative full name is required' })
  @MaxLength(150)
  adminFullName!: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  adminPhone?: string;

  @ApiProperty({ example: 'Chief Project Manager / Nodal Officer' })
  @IsString()
  @IsNotEmpty({ message: 'Designation is required' })
  @MaxLength(100)
  adminDesignation!: string;

  @ApiPropertyOptional({ example: 'PRIVATE_LTD', description: 'Company incorporation type' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  companyType?: string;

  // Proposed Land Acquisition Request (Target Location & Project Scope)
  @ApiPropertyOptional({ example: 'Bengaluru Outer Ring Road Phase 2', description: 'Name of the proposed acquisition project' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  projectName?: string;

  @ApiPropertyOptional({ example: 'KA-BLR-ORR-2026', description: 'Proposed project reference code' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  projectCode?: string;

  @ApiPropertyOptional({ example: 'HIGHWAY', description: 'Proposed project purpose or category' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  projectPurpose?: string;

  @ApiPropertyOptional({ example: 250.5, description: 'Required land area' })
  @IsOptional()
  landRequirementArea?: number;

  @ApiPropertyOptional({ example: 'HECTARE', enum: ['HECTARE', 'ACRE'], description: 'Unit of land requirement' })
  @IsOptional()
  @IsString()
  landRequirementUnit?: string;

  @ApiPropertyOptional({ example: 'Karnataka', description: 'State where land acquisition is targeted' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetState?: string;

  @ApiPropertyOptional({ example: 'Bengaluru', description: 'District where land acquisition is targeted' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  targetDistrict?: string;

  @ApiPropertyOptional({ description: 'Description of targeted land parcels, tehsils, or survey numbers' })
  @IsOptional()
  @IsString()
  proposedLandDescription?: string;

  @ApiPropertyOptional({ description: 'Detailed description of the proposed development project' })
  @IsOptional()
  @IsString()
  projectDescription?: string;

  @ApiPropertyOptional({ example: 36, description: 'Expected execution timeline in months' })
  @IsOptional()
  expectedTimelineMonths?: number;

  @ApiPropertyOptional({ description: 'List or references of uploaded DPR/statutory approval documents' })
  @IsOptional()
  supportingDocuments?: any[];

  @ApiPropertyOptional({ description: 'Additional statutory authorization metadata or DPR reference notes' })
  @IsOptional()
  metadata?: Record<string, any>;
}
