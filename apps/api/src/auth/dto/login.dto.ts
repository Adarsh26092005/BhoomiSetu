import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export enum LoginPortalType {
  OFFICER = 'OFFICER',
  AGENCY = 'AGENCY',
  ADMIN = 'ADMIN',
}

export class LoginDto {
  @ApiProperty({
    example: 'superadmin@nlams.gov.in',
    description: 'Registered official email address of the officer or user',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email address is required' })
  email!: string;

  @ApiProperty({
    example: '••••••••••••',
    description: 'Account password (minimum 8 characters)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  password!: string;

  @ApiPropertyOptional({
    enum: LoginPortalType,
    description: 'Designated login access portal (OFFICER, AGENCY, ADMIN)',
    example: LoginPortalType.OFFICER,
  })
  @IsOptional()
  @IsEnum(LoginPortalType, { message: 'loginType must be one of OFFICER, AGENCY, or ADMIN' })
  loginType?: LoginPortalType;
}
