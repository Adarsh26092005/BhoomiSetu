import {
  Controller,
  Get,
  Param,
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
import { ParcelsService } from './parcels.service';
import { ParcelQueryDto } from './dto/parcel-query.dto';
import {
  PaginatedParcelsResponseDto,
  ParcelDetailResponseDto,
  ParcelResponseDto,
  ParcelSummaryDto,
} from './dto/parcel-response.dto';

@ApiTags('Cadastral Parcels Management')
@ApiBearerAuth('JWT-auth')
@Controller('parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Get()
  @ApiOperation({
    summary: 'List and Filter Cadastral Parcels',
    description:
      'Returns paginated cadastral land parcels, strictly scoped to caller jurisdiction boundaries.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated parcels list.',
    type: PaginatedParcelsResponseDto,
  })
  async findAll(
    @Query() query: ParcelQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<PaginatedParcelsResponseDto> {
    return this.parcelsService.findAll(query, actor);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get Scoped Parcel Summary KPIs',
    description:
      'Calculates aggregate parcel metrics strictly over permitted jurisdiction boundaries.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary KPIs for accessible parcels.',
    type: ParcelSummaryDto,
  })
  async getSummary(
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ParcelSummaryDto> {
    return this.parcelsService.getSummary(actor);
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export Cadastral Parcels Data',
    description:
      'Exports tabular cadastral parcel dataset restricted to permitted jurisdiction districts/projects.',
  })
  @ApiResponse({
    status: 200,
    description: 'Exported parcel records.',
    type: [ParcelResponseDto],
  })
  async exportParcels(
    @Query() query: ParcelQueryDto,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ParcelResponseDto[]> {
    return this.parcelsService.exportParcels(query, actor);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get Cadastral Parcel Details and Landowners',
    description:
      'Retrieves full details for a cadastral parcel including ownership breakdown with jurisdiction verification.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parcel detail retrieved successfully.',
    type: ParcelDetailResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Parcel is outside caller authorized jurisdiction.',
  })
  @ApiResponse({
    status: 404,
    description: 'Parcel not found.',
  })
  async findOne(
    @Param('id') id: string,
    @CurrentUser() actor: AuthenticatedUser,
  ): Promise<ParcelDetailResponseDto> {
    return this.parcelsService.findOne(id, actor);
  }
}
