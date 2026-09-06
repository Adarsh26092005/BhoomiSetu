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
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PiaRegisterDto } from './dto/pia-register.dto';
import { OfficerRegisterDto } from './dto/officer-register.dto';
import { OrganizationActionDto } from './dto/organization-action.dto';
import { OrganizationQueryDto } from './dto/organization-query.dto';
import {
  OrganizationResponseDto,
  PaginatedOrganizationsResponseDto,
} from './dto/organization-response.dto';

import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Organizations Management')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Public()
  @Post('officer/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Government Officer Self-Registration / Access Request',
    description:
      'Allows a central, state, or district government official to request access to the NLAMS platform. ' +
      'Creates a pending officer profile requiring administrative approval before protected access is granted.',
  })
  @ApiResponse({
    status: 201,
    description: 'Officer access request submitted successfully. Pending administrative verification.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Invalid role or organization tier.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: User email already exists.',
  })
  async registerOfficer(@Body() dto: OfficerRegisterDto) {
    return this.organizationsService.registerOfficer(dto);
  }

  @Public()
  @Post('pia/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Project Implementing Agency (PIA) Self-Registration',
    description:
      'Allows a project implementing agency (e.g. NHAI, DFCCIL, Metro Corp, or concessionaire) to submit statutory registration details. ' +
      'Creates a PENDING_APPROVAL organization and an inactive primary liaison account pending government administrative verification.',
  })
  @ApiResponse({
    status: 201,
    description: 'Registration submitted successfully. Pending administrative verification.',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict: User email or organization registration code already exists.',
  })
  async registerPia(@Body() dto: PiaRegisterDto) {
    return this.organizationsService.registerPia(dto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'List / Search Organizations',
    description:
      'Returns paginated organizations with optional filtering by type (Central, State, District, PIA), status, state, and search keyword.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated organizations retrieved successfully.',
    type: PaginatedOrganizationsResponseDto,
  })
  async findAll(
    @Query() query: OrganizationQueryDto,
    @CurrentUser() user?: AuthenticatedUser,
  ): Promise<PaginatedOrganizationsResponseDto> {
    return this.organizationsService.findAll(query, user);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get Organization Details',
    description:
      'Returns detailed profile, hierarchy (parent/children), member counts, and project counts for an organization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization details retrieved successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found.',
  })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER)
  @ApiOperation({
    summary: 'Create / Provision Government Organization (Admin Only)',
    description:
      'Administrative endpoint to create Ministry, State Authority, or District Authority entities in the official hierarchy.',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Requires SUPER_ADMIN or CENTRAL_OFFICER role.',
  })
  async create(
    @Body() dto: CreateOrganizationDto,
    @CurrentUser('id') actorId: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.create(dto, actorId);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER, UserRole.STATE_OFFICER)
  @ApiOperation({
    summary: 'Update Organization Details',
    description: 'Modifies organization name, code, jurisdiction bounds, or parent organization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Insufficient privileges.',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser('id') actorId: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.update(id, dto, actorId);
  }

  @Post(':id/approve')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER, UserRole.STATE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve Pending PIA Organization Registration',
    description:
      'Approves a pending PIA registration request, transitioning organization status to ACTIVE and activating the initial nodal officer account.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization approved and activated.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request: Organization is not in PENDING_APPROVAL status.',
  })
  async approvePia(
    @Param('id') id: string,
    @Body() dto: OrganizationActionDto,
    @CurrentUser('id') actorId: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.approvePia(id, dto, actorId);
  }

  @Post(':id/reject')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER, UserRole.STATE_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject Pending Organization Registration',
    description:
      'Rejects a pending PIA registration request with an auditable statutory reason.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization registration rejected.',
    type: OrganizationResponseDto,
  })
  async rejectPia(
    @Param('id') id: string,
    @Body() dto: OrganizationActionDto,
    @CurrentUser('id') actorId: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.rejectPia(id, dto, actorId);
  }

  @Post(':id/suspend')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suspend Active Organization (Admin Only)',
    description:
      'Suspends an active organization and deactivates all associated user sessions for compliance/administrative holds.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization suspended.',
    type: OrganizationResponseDto,
  })
  async suspend(
    @Param('id') id: string,
    @Body() dto: OrganizationActionDto,
    @CurrentUser('id') actorId: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.suspend(id, dto, actorId);
  }

  @Post(':id/activate')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Activate / Re-activate Organization (Admin Only)',
    description: 'Restores a suspended organization back to ACTIVE status.',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization activated.',
    type: OrganizationResponseDto,
  })
  async activate(
    @Param('id') id: string,
    @CurrentUser('id') actorId: string,
  ): Promise<OrganizationResponseDto> {
    return this.organizationsService.activate(id, actorId);
  }
}
