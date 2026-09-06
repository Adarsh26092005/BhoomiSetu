import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private isConnected = false;

  async onModuleInit() {
    try {
      if (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test') {
        const connectPromise = this.$connect();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database connection timeout (2000ms)')), 2000),
        );
        await Promise.race([connectPromise, timeoutPromise]);
        this.isConnected = true;
        this.logger.log('Prisma ORM connected to PostgreSQL database successfully.');
      } else {
        this.logger.log('Prisma ORM running in deferred/test database connection mode.');
      }
    } catch (error) {
      this.logger.warn(
        `Database connection could not be established on startup: ${(error as Error).message}. Will connect lazily on query.`,
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
      this.logger.log('Prisma ORM disconnected from PostgreSQL database.');
    }
  }

  get isDbConnected(): boolean {
    return this.isConnected;
  }
}
