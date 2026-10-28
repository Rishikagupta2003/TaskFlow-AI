import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    if (process.env.DATABASE_URL) {
      try {
        await this.$connect();
        this.logger.log('Connected to PostgreSQL database via Prisma');
      } catch (error) {
        this.logger.warn(`Could not connect to database on startup: ${(error as Error).message}`);
      }
    } else {
      this.logger.log('DATABASE_URL not configured; skipping Prisma $connect on startup');
    }
  }

  async onModuleDestroy() {
    if (process.env.DATABASE_URL) {
      await this.$disconnect();
    }
  }
}
