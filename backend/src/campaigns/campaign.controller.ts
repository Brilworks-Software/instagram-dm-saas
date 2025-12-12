import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';

@Controller('campaigns')
@UseGuards(AuthGuard)
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post(':id/process')
  async processCampaign(
    @Param('id') campaignId: string,
    @CurrentWorkspace() workspace: { id: string },
  ) {
    await this.campaignService.processCampaign(campaignId);
    return { success: true };
  }
}

