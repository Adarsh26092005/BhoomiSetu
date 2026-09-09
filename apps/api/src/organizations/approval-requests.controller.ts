import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { Roles } from '../auth/decorators/roles.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { OrganizationsService } from './organizations.service';
import { ApprovalDecisionDto } from '../jurisdiction/dto/jurisdiction.dto';

@ApiTags('Onboarding Approval Requests')
@ApiBearerAuth('JWT-auth')
@Controller('approval-requests')
export class ApprovalRequestsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
  )
  @ApiOperation({
    summary: 'List Pending / Historical Onboarding Approval Requests',
    description:
      'Returns paginated onboarding approval requests for Government Officers and PIAs, strictly scoped to caller jurisdiction / administrative area (e.g. MH-01).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of approval requests.',
  })
  async listApprovalRequests(
    @Query('status') status: any,
    @Query('page') page: any,
    @Query('limit') limit: any,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.listApprovalRequests(
      { status, page, limit },
      user,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
  )
  @ApiOperation({
    summary: 'Get Approval Request Details',
    description: 'Retrieves single approval request details with requester and organization profiles.',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval request details.',
  })
  async getApprovalRequest(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.getApprovalRequest(id, user);
  }

  @Post(':id/approve')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Approve Onboarding Request (Officer or PIA)',
    description:
      'Statutory approval of an officer access request or PIA registration. Activates target user/organization and records audit log.',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding request approved and credentials activated.',
  })
  async approveRequest(
    @Param('id') id: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.approveApprovalRequest(id, dto, user);
  }

  @Post(':id/reject')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reject Onboarding Request with Statutory Reason',
    description:
      'Rejects an onboarding request with an auditable statutory reason.',
  })
  @ApiResponse({
    status: 200,
    description: 'Onboarding request rejected.',
  })
  async rejectRequest(
    @Param('id') id: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.rejectApprovalRequest(id, dto, user);
  }

  @Post(':id/hold')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.CENTRAL_OFFICER,
    UserRole.STATE_OFFICER,
    UserRole.DISTRICT_OFFICER,
  )
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Place Onboarding / Acquisition Request On Hold',
    description:
      'Places an approval request on hold pending document clarification or administrative review.',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval request placed on hold.',
  })
  async holdRequest(
    @Param('id') id: string,
    @Body() dto: ApprovalDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.organizationsService.holdApprovalRequest(id, dto, user);
  }
}
