import { Module } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CampaignController } from './campaign.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { InstagramModule } from '../instagram/instagram.module';

@Module({
  imports: [PrismaModule, InstagramModule],
  providers: [CampaignService],
  controllers: [CampaignController],
  exports: [CampaignService],
})
export class CampaignModule {}

