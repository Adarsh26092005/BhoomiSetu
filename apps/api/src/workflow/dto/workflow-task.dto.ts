import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import {
  WorkflowPriority,
  WorkflowSlaStatus,
  WorkflowTaskStatus,
} from '@prisma/client';

export class WorkflowTaskQueryDto {
  @ApiPropertyOptional({ description: 'Filter by project ID' })
  @IsOptional()
  @IsString()
  projectId?: string;

  @ApiPropertyOptional({ enum: WorkflowTaskStatus, description: 'Filter by task status' })
  @IsOptional()
  @IsEnum(WorkflowTaskStatus)
  status?: WorkflowTaskStatus;

  @ApiPropertyOptional({ description: 'Filter by task type (e.g. SCRUTINY, VERIFICATION)' })
  @IsOptional()
  @IsString()
  taskType?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned officer ID' })
  @IsOptional()
  @IsString()
  assignedOfficerId?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

export class CompleteWorkflowTaskDto {
  @ApiPropertyOptional({ description: 'Officer statutory recommendation/decision' })
  @IsOptional()
  @IsString()
  decision?: string;

  @ApiPropertyOptional({ description: 'Action remarks / justification' })
  @IsOptional()
  @IsString()
  remarks?: string;

  @ApiPropertyOptional({ description: 'Additional officer notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class RejectWorkflowTaskDto {
  @ApiProperty({ description: 'Reason for rejection / remand' })
  @IsString()
  remarks!: string;
}

export class HoldWorkflowTaskDto {
  @ApiProperty({ description: 'Reason for placing task on hold' })
  @IsString()
  remarks!: string;
}

export class ReassignWorkflowTaskDto {
  @ApiProperty({ description: 'Target officer user ID' })
  @IsString()
  newOfficerId!: string;

  @ApiPropertyOptional({ description: 'Reassignment justification remarks' })
  @IsOptional()
  @IsString()
  remarks?: string;
}

export class AddWorkflowCommentDto {
  @ApiProperty({ description: 'Comment text' })
  @IsString()
  comment!: string;

  @ApiPropertyOptional({ description: 'Whether the comment is internal government only', default: true })
  @IsOptional()
  isInternalOnly?: boolean = true;
}
