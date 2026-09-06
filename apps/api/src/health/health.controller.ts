import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthCheckResponse } from '../common/types';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('System & Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({
    summary: 'System Liveness & Readiness Health Probe',
    description:
      'Returns process runtime metrics, node memory consumption, and configuration readiness state.',
  })
  @ApiResponse({
    status: 200,
    description: 'System health probe returned successfully.',
  })
  check(): HealthCheckResponse {
    return this.healthService.getHealth();
  }
}
