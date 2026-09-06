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

  @ApiPropertyOptional({ description: 'Additional statutory authorization metadata or DPR reference notes' })
  @IsOptional()
  metadata?: Record<string, any>;
}
