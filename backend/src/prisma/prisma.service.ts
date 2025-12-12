import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isConnected = false;

  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Database connected');
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(`Database connection failed: ${(error as Error).message}`);
      this.logger.warn('App will run without database - some features may be limited');
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      this.logger.log('Disconnecting from database...');
      await this.$disconnect();
    }
  }
}

