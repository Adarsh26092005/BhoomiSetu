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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import {
  PaginatedProjectsResponseDto,
  ProjectDetailResponseDto,
  ProjectSummaryKpiDto,
} from './dto/project-response.dto';

@ApiTags('Projects Management')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register New Land Acquisition Project',
    description:
      'Initiates a new statutory land acquisition project proposal under the RFCTLARR Act 2013. ' +
      'Implementing Agency ownership is automatically enforced server-side for PIA users. ' +
      'State and District Officers are constrained to their authorized administrative jurisdictions.',
  })
  @ApiResponse({
    status: 201,
    description: 'Project proposal created successfully.',
    type: ProjectDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Validation error or invalid agency reference.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient privileges or jurisdiction mismatch.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Project code/gazette reference already exists.',
  })
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.create(dto, actor);
  }

  @Get()
  @ApiOperation({
    summary: 'List / Search Land Acquisition Projects',
    description:
      'Returns a paginated list of projects with multi-tenant and geographical scoping. ' +
      'PIA users see only their organization projects; District/State officers see only projects in their authorized territories; Central administrators have national oversight.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated projects retrieved successfully.',
    type: PaginatedProjectsResponseDto,
  })
  async findAll(
    @Query() query: ProjectQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PaginatedProjectsResponseDto> {
    return this.projectsService.findAll(query, actor);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get Project Register KPI Metrics',
    description:
      'Calculates real-time statutory metrics (total projects, active in process, completed handovers, land area, compensation budget & disbursements) scoped strictly to the authenticated user.',
  })
  @ApiResponse({
    status: 200,
    description: 'KPI summary retrieved successfully.',
    type: ProjectSummaryKpiDto,
  })
  async getSummary(
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ProjectSummaryKpiDto> {
    return this.projectsService.getSummary(actor);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Statutory Project Dossier',
    description:
      'Returns full statutory project details, including implementing agency, assigned officers, parcel counts, document counts, and compensation summaries. Enforces strict boundary verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project dossier retrieved successfully.',
    type: ProjectDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Project is outside authenticated user jurisdiction/organization boundary.',
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found.',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.findOne(id, actor);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update Project Details',
    description:
      'Modifies project metadata, title, scope description, land area, or target timeline. Enforces ownership and jurisdiction checks.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully.',
    type: ProjectDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient privileges or cross-boundary modification attempt.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.update(id, dto, actor);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Transition Statutory Project Lifecycle Status',
    description:
      'Executes a controlled state-machine transition across the 17 statutory project lifecycle stages with role authority validation and audit logging.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project status transitioned successfully.',
    type: ProjectDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid state transition or missing statutory justification.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Actor lacks statutory authority for this stage transition.',
  })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProjectStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ProjectDetailResponseDto> {
    return this.projectsService.updateStatus(id, dto, actor);
  }

  @Get(':id/activity')
  @ApiOperation({
    summary: 'Get Project Statutory Activity & Audit History',
    description:
      'Retrieves the chronological audit stream of administrative and statutory actions for this project.',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity stream retrieved successfully.',
  })
  async getActivity(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.projectsService.getActivity(id, actor);
  }

  @Get(':id/assignments')
  @ApiOperation({
    summary: 'Get Assigned Officers for Project',
    description: 'Lists all active project team members and officer assignments.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project assignments retrieved successfully.',
  })
  async getAssignments(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.projectsService.getAssignments(id, actor);
  }
}
