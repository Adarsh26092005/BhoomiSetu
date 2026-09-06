import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3001);
  const apiPrefix = configService.get<string>('apiPrefix', 'api/v1');
  const corsOrigin = configService.get<string>('corsOrigin', 'http://localhost:5173');
  const env = configService.get<string>('env', 'development');

  // Security Headers (Helmet)
  app.use(
    helmet({
      contentSecurityPolicy: env === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(',').map((o) => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Correlation-Id'],
  });

  // Global Routing Prefix
  app.setGlobalPrefix(apiPrefix);

  // Global Input Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global Exception Filters (Order matters: AllExceptionsFilter catches general, HttpExceptionFilter catches HTTP specifics)
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Global HTTP Request Logging Interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Graceful Shutdown Hooks
  app.enableShutdownHooks();

  // Swagger / OpenAPI Specification
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NLAMS API')
      .setDescription(
        'National Land Acquisition & Management System (NLAMS) — Core REST API Documentation. ' +
          'Provides endpoints for land acquisition lifecycle workflows, cadastral parcel administration, ' +
          'statutory compensation ledgers, Section 38 possession handovers, and Second Schedule R&R management.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT Authorization',
          description: 'Enter your JWT access token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication & RBAC', 'Authentication, session rotation, JWT tokens, and role-based access control')
      .addTag('System & Health', 'Health probes, runtime telemetry, and readiness status')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
      customSiteTitle: 'NLAMS API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true,
      },
    });
  }

  await app.listen(port, '0.0.0.0');
  logger.log(`========================================================`);
  logger.log(`  NLAMS REST API Server running on port : ${port}`);
  logger.log(`  Environment                          : ${env}`);
  logger.log(`  Global API Prefix                    : /${apiPrefix}`);
  logger.log(`  Health Probe                         : http://localhost:${port}/${apiPrefix}/health`);
  logger.log(`  Swagger OpenAPI Docs                 : http://localhost:${port}/${apiPrefix}/docs`);
  logger.log(`========================================================`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during NLAMS API bootstrap:', err);
  process.exit(1);
});
