import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';

describe('NLAMS API Endpoints & Auth (e2e)', () => {
  jest.setTimeout(30000);
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
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
    app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Public Endpoints', () => {
    it('GET /api/v1/health - should return status 200 with structured health metrics', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.status).toBe('ok');
      expect(response.body.service).toBe('NLAMS Core REST API');
      expect(response.body.version).toBe('1.0.0');
      expect(response.body.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(response.body.checks).toBeDefined();
      expect(response.body.checks.liveness.status).toBe('UP');
      expect(response.body.checks.readiness.status).toBe('READY');
    });

    it('GET /api/v1/unknown-endpoint - should return structured 404 error envelope', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/unknown-endpoint')
        .expect(404);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(404);
      expect(response.body.path).toBe('/api/v1/unknown-endpoint');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Auth Validation & Guard Enforcements (e2e)', () => {
    it('POST /api/v1/auth/login - should return 400 Bad Request if email/password missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({})
        .expect(400);

      expect(response.body).toBeDefined();
      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/email/i),
          expect.stringMatching(/password/i),
        ]),
      );
    });

    it('POST /api/v1/auth/login - should reject non-whitelisted payload fields', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'officer@nlams.gov.in',
          password: 'Password123!',
          isAdminHacked: true,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/property isAdminHacked should not exist/i),
        ]),
      );
    });

    it('POST /api/v1/auth/refresh - should return 400 Bad Request if refreshToken missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(400);
    });

    it('GET /api/v1/auth/me - should reject unauthenticated request with 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
    });

    it('POST /api/v1/auth/logout - should reject unauthenticated request with 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .send({})
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.statusCode).toBe(401);
    });
  });
});
