import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { HealthCheckResponse } from '../common/types';

@Injectable()
export class HealthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  getHealth(): HealthCheckResponse {
    const mem = process.memoryUsage();
    const databaseConfigured = Boolean(
      this.configService.get<string>('database.url'),
    );
    const redisHost = this.configService.get<string>('redis.host');
    const redisConfigured = Boolean(redisHost);

    return {
      status: 'ok',
      service: 'NLAMS Core REST API',
      version: '1.0.0',
      environment: this.configService.get<string>('env') || 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsageMb: {
        rss: Math.round(mem.rss / 1024 / 1024),
        heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
        heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
        external: Math.round(mem.external / 1024 / 1024),
      },
      checks: {
        liveness: {
          status: 'UP',
          timestamp: new Date().toISOString(),
        },
        readiness: {
          status: 'READY',
          databaseConfigured,
          redisConfigured,
        },
      },
    };
  }
}
