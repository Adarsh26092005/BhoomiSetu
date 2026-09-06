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
import { AccountType, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import {
  PaginatedUsersResponseDto,
  UserDetailResponseDto,
} from './dto/user-response.dto';
import {
  CreateProjectAssignmentDto,
  ProjectAssignmentResponseDto,
  UpdateProjectAssignmentDto,
} from './dto/project-assignment.dto';

@ApiTags('Users Management')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'List and Filter Users',
    description:
      'Retrieve paginated users with filtering by accountType, role, organization, active status, and search keywords, strictly scoped to caller jurisdiction.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated user directory.',
    type: PaginatedUsersResponseDto,
  })
  async findAll(
    @Query() query: UserQueryDto,
    @CurrentUser() actor?: AuthenticatedUser,
  ): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(query, actor);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get User Profile and Active Project Assignments',
    description:
      'Returns complete user profile details along with active project assignments and organization metadata with jurisdiction enforcement.',
  })
  @ApiResponse({
    status: 200,
    description: 'User details retrieved successfully.',
    type: UserDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() actor?: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.findOne(id, actor);
  }

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Create User Account (Administrative)',
    description:
      'Provisions a new user account. Role and organization validation enforced server-side. Passwords hashed with bcrypt cost factor 12.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
    type: UserDetailResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or organization does not exist.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient privileges or cross-boundary creation attempt.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: Email already registered.',
  })
  async create(
    @Body() dto: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.create(
      dto,
      actor.id,
      actor.role,
      actor.accountType,
      actor.organizationId,
      actor,
    );
  }

  @Patch(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Update User Profile / Role / Status',
    description:
      'Modifies user designation, contact details, active status, or role where authorized.',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
    type: UserDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Unauthorized role elevation.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.update(id, dto, actor.id, actor.role, actor);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Activate User Account',
    description: 'Enables user login access.',
  })
  @ApiResponse({
    status: 200,
    description: 'User activated successfully.',
    type: UserDetailResponseDto,
  })
  async activate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.activate(id, actor.id, actor);
  }

  @Post(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Deactivate User Account & Revoke Active Sessions',
    description:
      'Disables user account and immediately revokes all active auth sessions.',
  })
  @ApiResponse({
    status: 200,
    description: 'User deactivated and active sessions revoked.',
    type: UserDetailResponseDto,
  })
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<UserDetailResponseDto> {
    return this.usersService.deactivate(id, actor.id, actor);
  }

  // ============================================================================
  // PROJECT ASSIGNMENT ENDPOINTS
  // ============================================================================

  @Get(':id/project-assignments')
  @ApiOperation({
    summary: 'List Project Assignments for User',
    description:
      'Retrieves all project assignments and roles mapped to a specific user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of project assignments.',
    type: [ProjectAssignmentResponseDto],
  })
  async getProjectAssignments(
    @Param('id') id: string,
  ): Promise<ProjectAssignmentResponseDto[]> {
    return this.usersService.getProjectAssignments(id);
  }

  @Post(':id/project-assignments')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Assign User to Project',
    description:
      'Assigns a user to a project with a defined working role using the canonical ProjectAssignment model.',
  })
  @ApiResponse({
    status: 201,
    description: 'User assigned to project successfully.',
    type: ProjectAssignmentResponseDto,
  })
  async assignToProject(
    @Param('id') id: string,
    @Body() dto: CreateProjectAssignmentDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ProjectAssignmentResponseDto> {
    return this.usersService.assignToProject(id, dto, actor.id, actor);
  }

  @Patch(':id/project-assignments/:assignmentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Update Project Assignment Role or Status',
    description: 'Modifies an existing project assignment role or active status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project assignment updated successfully.',
    type: ProjectAssignmentResponseDto,
  })
  async updateProjectAssignment(
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateProjectAssignmentDto,
    @CurrentUser('id') actorId: string,
  ): Promise<ProjectAssignmentResponseDto> {
    return this.usersService.updateProjectAssignment(
      id,
      assignmentId,
      dto,
      actorId,
    );
  }

  @Post(':id/project-assignments/:assignmentId/deactivate')
  @HttpCode(HttpStatus.OK)
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
    UserRole.PROJECT_IMPLEMENTING_AGENCY,
  )
  @ApiOperation({
    summary: 'Deactivate / Revoke Project Assignment',
    description:
      'Revokes active working assignment on a project while preserving audit history.',
  })
  @ApiResponse({
    status: 200,
    description: 'Project assignment deactivated.',
    type: ProjectAssignmentResponseDto,
  })
  async deactivateProjectAssignment(
    @Param('id') id: string,
    @Param('assignmentId') assignmentId: string,
    @CurrentUser('id') actorId: string,
  ): Promise<ProjectAssignmentResponseDto> {
    return this.usersService.deactivateProjectAssignment(
      id,
      assignmentId,
      actorId,
    );
  }
}
