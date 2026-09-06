import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType, UserRole } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'superadmin@nlams.gov.in' })
  email!: string;

  @ApiProperty({ example: 'Dr. Rajesh Sharma' })
  fullName!: string;

  @ApiPropertyOptional({ example: '+91-9876543210' })
  phone?: string | null;

  @ApiProperty({ enum: AccountType, example: AccountType.GOVERNMENT_OFFICER })
  accountType!: AccountType;

  @ApiProperty({ enum: UserRole, example: UserRole.SUPER_ADMIN })
  role!: UserRole;

  @ApiProperty({ example: 'Chief Land Acquisition Administrator' })
  designation!: string;

  @ApiProperty({ example: 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22' })
  organizationId!: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e' })
  avatarUrl?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiPropertyOptional({ example: '2026-09-04T07:00:00.000Z' })
  lastLoginAt?: Date | null;

  @ApiProperty({ example: '2026-09-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-09-04T00:00:00.000Z' })
  updatedAt!: Date;
}

export class AuthResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user!: UserResponseDto;

  @ApiProperty({
    description: 'Signed JWT access token for authenticating subsequent REST API requests',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Cryptographic refresh token used to rotate expired access tokens',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration lifetime string',
    example: '15m',
  })
  expiresIn!: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    description: 'New signed JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken!: string;

  @ApiProperty({
    description: 'New rotated cryptographic refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken!: string;

  @ApiProperty({
    description: 'Access token expiration lifetime string',
    example: '15m',
  })
  expiresIn!: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Logged out successfully' })
  message!: string;
}
