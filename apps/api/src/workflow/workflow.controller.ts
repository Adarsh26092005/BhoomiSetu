import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { WorkflowService } from './workflow.service';
import {
  AddWorkflowCommentDto,
  CompleteWorkflowTaskDto,
  HoldWorkflowTaskDto,
  ReassignWorkflowTaskDto,
  RejectWorkflowTaskDto,
  WorkflowTaskQueryDto,
} from './dto/workflow-task.dto';

@ApiTags('Workflow & Approvals')
@ApiBearerAuth('JWT-auth')
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('tasks')
  @ApiOperation({
    summary: 'List Scoped Workflow Tasks',
    description: 'Retrieves all workflow tasks scoped strictly to the authenticated officer/agency jurisdiction.',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of workflow tasks.' })
  async findAll(
    @Query() query: WorkflowTaskQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.findAll(query, actor);
  }

  @Get('tasks/:id')
  @ApiOperation({
    summary: 'Get Workflow Task Dossier',
    description: 'Retrieves full details of a workflow task including audit history and comments with jurisdiction validation.',
  })
  @ApiResponse({ status: 200, description: 'Workflow task details.' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.findOne(id, actor);
  }

  @Get('projects/:projectId/active-task')
  @ApiOperation({
    summary: 'Get Active Task for Project',
    description: 'Retrieves the currently pending statutory task for a specific project proposal.',
  })
  async getByProjectId(
    @Param('projectId') projectId: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.getByProjectId(projectId, actor);
  }

  @Post('tasks/:id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete Assigned Workflow Task',
    description: 'Marks an officer specialist task as completed and records decision history. Does not automatically advance project lifecycle status.',
  })
  async completeTask(
    @Param('id') id: string,
    @Body() dto: CompleteWorkflowTaskDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.completeTask(id, dto, actor);
  }

  @Post('tasks/:id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject / Remand Workflow Task',
    description: 'Rejects statutory task and remands proposal.',
  })
  async rejectTask(
    @Param('id') id: string,
    @Body() dto: RejectWorkflowTaskDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.rejectTask(id, dto, actor);
  }

  @Post('tasks/:id/hold')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Place Workflow Task on Hold',
    description: 'Pauses task SLA and marks status ON_HOLD.',
  })
  async holdTask(
    @Param('id') id: string,
    @Body() dto: HoldWorkflowTaskDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.holdTask(id, dto, actor);
  }

  @Patch('tasks/:id/reassign')
  @ApiOperation({
    summary: 'Reassign Task to Officer',
    description: 'Reassigns workflow task to another authorized officer within the same jurisdiction.',
  })
  async reassignTask(
    @Param('id') id: string,
    @Body() dto: ReassignWorkflowTaskDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.reassignTask(id, dto, actor);
  }

  @Post('tasks/:id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add Internal Comment to Workflow Task',
  })
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddWorkflowCommentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.workflowService.addComment(id, dto, actor);
  }
}
