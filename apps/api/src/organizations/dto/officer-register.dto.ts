import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { OrganizationType, UserRole } from '@prisma/client';

export class OfficerRegisterDto {
  @ApiProperty({ example: 'Shri Anand Kumar Verma', description: 'Full legal name of the government officer' })
  @IsString({ message: 'Full name must be a string' })
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(150)
  fullName!: string;

  @ApiProperty({
    example: 'anand.verma@revenue.maharashtra.gov.in',
    description: 'Official government email address (.gov.in or .nic.in preferred)',
  })
  @IsEmail({}, { message: 'Please provide a valid official government email address' })
  @IsNotEmpty({ message: 'Official email is required' })
  email!: string;

  @ApiProperty({ example: '+91-9876543210', description: 'Official mobile or desk contact number' })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Contact phone number is required' })
  @MaxLength(20)
  phone!: string;

  @ApiProperty({ example: 'GOV-MAH-REV-84920', description: 'Official employee / officer identification code' })
  @IsString({ message: 'Employee ID must be a string' })
  @IsNotEmpty({ message: 'Employee/Officer identification code is required' })
  @MaxLength(50)
  employeeId!: string;

  @ApiProperty({ example: 'Deputy Collector / Special Land Acquisition Officer', description: 'Official government designation' })
  @IsString({ message: 'Designation must be a string' })
  @IsNotEmpty({ message: 'Designation is required' })
  @MaxLength(100)
  designation!: string;

  @ApiProperty({ example: 'Department of Revenue & Forest, Govt of Maharashtra', description: 'Parent ministry or state department' })
  @IsString({ message: 'Department/Ministry name must be a string' })
  @IsNotEmpty({ message: 'Department/Ministry name is required' })
  @MaxLength(200)
  departmentName!: string;

  @ApiProperty({
    enum: OrganizationType,
    example: OrganizationType.DISTRICT_AUTHORITY,
    description: 'Statutory government tier of the organization',
  })
  @IsEnum(OrganizationType, {
    message: 'organizationType must be CENTRAL_MINISTRY, STATE_AUTHORITY, or DISTRICT_AUTHORITY',
  })
  @IsNotEmpty({ message: 'Organization tier is required' })
  organizationType!: OrganizationType;

  @ApiProperty({ example: 'Maharashtra', description: 'State of jurisdiction' })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  @MaxLength(100)
  state!: string;

  @ApiProperty({ example: 'Nagpur', description: 'District of jurisdiction (required for jurisdiction routing)' })
  @IsString({ message: 'District must be a string' })
  @IsNotEmpty({ message: 'District is required' })
  @MaxLength(100)
  district!: string;

  @ApiProperty({ example: 'Collectorate Complex, Civil Lines, Nagpur - 440001', description: 'Official office address' })
  @IsString({ message: 'Office address must be a string' })
  @IsNotEmpty({ message: 'Official office address is required' })
  @MaxLength(500)
  officeAddress!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.LAND_ACQUISITION_OFFICER,
    description: 'Requested statutory role (Must be a canonical government role)',
  })
  @IsEnum(UserRole, { message: 'Invalid requested government role' })
  @IsNotEmpty({ message: 'Requested role is required' })
  requestedRole!: UserRole;

  @ApiProperty({ example: 'SecureOfficer2026!', description: 'Account access password (minimum 8 characters)' })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;

  @ApiPropertyOptional({ description: 'Additional jurisdictional metadata or administrative notes' })
  @IsOptional()
  jurisdiction?: Record<string, any>;
}
