export interface ApiResponseEnvelope<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path?: string;
  correlationId?: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
  correlationId?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  environment: string;
  timestamp: string;
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  checks: {
    liveness: {
      status: 'UP' | 'DOWN';
      timestamp: string;
    };
    readiness: {
      status: 'READY' | 'NOT_READY';
      databaseConfigured: boolean;
      redisConfigured: boolean;
    };
  };
}
