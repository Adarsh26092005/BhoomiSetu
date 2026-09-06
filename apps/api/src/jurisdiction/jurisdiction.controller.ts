import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJurisdictionLevel, UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { JurisdictionService } from './jurisdiction.service';
import {
  CreateAdministrativeAreaDto,
  CreateSuperAdminAssignmentDto,
} from './dto/jurisdiction.dto';

@ApiTags('Jurisdiction & Administrative Access Control')
@ApiBearerAuth('JWT-auth')
@Controller('jurisdiction')
export class JurisdictionController {
  constructor(private readonly jurisdictionService: JurisdictionService) {}

  @Get('my-scope')
  @ApiOperation({
    summary: 'Get Current User Effective Jurisdiction Scope',
    description:
      'Resolves and returns the authenticated user effective jurisdiction level, covering state, authorized districts, administrative area code, and query scope boundaries.',
  })
  @ApiResponse({
    status: 200,
    description: 'Effective jurisdiction scope retrieved successfully.',
  })
  async getMyScope(@CurrentUser() user: AuthenticatedUser) {
    return this.jurisdictionService.resolveEffectiveScope(user);
  }

  @Get('administrative-areas')
  @ApiOperation({
    summary: 'List Administrative Areas',
    description:
      'Returns administrative areas and their normalized covered districts, filtered by caller jurisdiction level.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of administrative areas.',
  })
  async listAdministrativeAreas(@CurrentUser() user: AuthenticatedUser) {
    const scope = await this.jurisdictionService.resolveEffectiveScope(user);
    return this.jurisdictionService.listAdministrativeAreas(scope);
  }

  @Post('administrative-areas')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create Administrative Area (Central Super Admin Only)',
    description:
      'Provisions a new statutory administrative area (e.g. MH-01 Western Maharashtra) covering specific districts.',
  })
  @ApiResponse({
    status: 201,
    description: 'Administrative area created successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Requires Central Super Admin privileges.',
  })
  async createAdministrativeArea(
    @Body() dto: CreateAdministrativeAreaDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const scope = await this.jurisdictionService.resolveEffectiveScope(user);
    if (!scope.isCentral) {
      throw new ForbiddenException(
        'Only Central Super Admins can create administrative areas',
      );
    }
    return this.jurisdictionService.createAdministrativeArea(dto, user.id);
  }

  @Get('super-admin-assignments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.CENTRAL_OFFICER)
  @ApiOperation({
    summary: 'List Super Admin Jurisdiction Assignments',
    description: 'Lists active Super Admin assignments and their jurisdictional mapping.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of Super Admin assignments.',
  })
  async listSuperAdminAssignments(@CurrentUser() user: AuthenticatedUser) {
    const scope = await this.jurisdictionService.resolveEffectiveScope(user);
    return this.jurisdictionService.listSuperAdminAssignments(scope);
  }

  @Post('super-admin-assignments')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Assign Super Admin to Administrative Area / Central (Central Super Admin Only)',
    description:
      'Assigns a Super Admin account to Central scope or an Administrative Area (e.g. MH-01).',
  })
  @ApiResponse({
    status: 201,
    description: 'Super Admin assigned to jurisdiction successfully.',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Requires Central Super Admin privileges.',
  })
  async assignSuperAdmin(
    @Body() dto: CreateSuperAdminAssignmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const scope = await this.jurisdictionService.resolveEffectiveScope(user);
    if (!scope.isCentral) {
      throw new ForbiddenException(
        'Only Central Super Admins can assign Super Admin jurisdictions',
      );
    }
    return this.jurisdictionService.assignSuperAdmin(dto, user.id);
  }
}
