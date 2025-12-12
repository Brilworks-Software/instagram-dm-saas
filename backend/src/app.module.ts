import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { InstagramModule } from './instagram/instagram.module';
import { NotificationModule } from './notifications/notification.module';
import { CampaignModule } from './campaigns/campaign.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    InstagramModule,
    NotificationModule,
    CampaignModule,
  ],
})
export class AppModule {}
