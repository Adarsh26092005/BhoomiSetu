import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType, UserRole } from '@prisma/client';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'officer.deshmukh@nlams.gov.in' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email!: string;

  @ApiProperty({ example: 'TemporaryPassword2026!' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Shri Anand Deshmukh' })
  @IsString()
  @IsNotEmpty({ message: 'Full name is required' })
  @MaxLength(150)
  fullName!: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ enum: AccountType, default: AccountType.GOVERNMENT_OFFICER })
  @IsOptional()
  @IsEnum(AccountType)
  accountType?: AccountType = AccountType.GOVERNMENT_OFFICER;

  @ApiProperty({ enum: UserRole, example: UserRole.LAND_ACQUISITION_OFFICER })
  @IsEnum(UserRole, { message: 'Invalid domain role' })
  role!: UserRole;

  @ApiProperty({ example: 'Special Land Acquisition Officer (CALA)' })
  @IsString()
  @IsNotEmpty({ message: 'Designation is required' })
  @MaxLength(100)
  designation!: string;

  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', description: 'Assigned Organization UUID' })
  @IsString()
  @IsNotEmpty({ message: 'Organization ID is required' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
