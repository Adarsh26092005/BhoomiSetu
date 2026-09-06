import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProjectAssignmentDto {
  @ApiProperty({ description: 'Target Project UUID', example: 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  @IsString()
  @IsNotEmpty({ message: 'Project ID is required' })
  projectId!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SURVEY_OFFICER, description: 'Functional role assigned on this project' })
  @IsEnum(UserRole, { message: 'Invalid project assignment role' })
  role!: UserRole;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}

export class UpdateProjectAssignmentDto {
  @ApiPropertyOptional({ enum: UserRole, example: UserRole.SURVEY_OFFICER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ProjectAssignmentResponseDto {
  @ApiProperty({ example: 'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  id!: string;

  @ApiProperty({ example: 'p0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  projectId!: string;

  @ApiPropertyOptional()
  project?: {
    id: string;
    code: string;
    title: string;
    status: string;
    state: string;
  };

  @ApiProperty({ example: 'u0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' })
  userId!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.SURVEY_OFFICER })
  role!: UserRole;

  @ApiPropertyOptional({ example: 'admin-uuid-1' })
  assignedById?: string | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-09-04T00:00:00.000Z' })
  assignedAt!: Date;
}
