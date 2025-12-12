import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CurrentWorkspace } from '../auth/decorators/current-workspace.decorator';
import { NotificationType } from '@prisma/client';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async getNotifications(
    @CurrentUser() user: { id: string },
    @CurrentWorkspace() workspace: { id: string },
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.notificationService.getNotifications(
      user.id,
      workspace.id,
      limit ? parseInt(limit, 10) : 50,
      skip ? parseInt(skip, 10) : 0,
    );
  }

  @Get('unread')
  async getUnreadNotifications(
    @CurrentUser() user: { id: string },
    @CurrentWorkspace() workspace: { id: string },
    @Query('limit') limit?: string,
  ) {
    return this.notificationService.getUnreadNotifications(
      user.id,
      workspace.id,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('unread/count')
  async getUnreadCount(
    @CurrentUser() user: { id: string },
    @CurrentWorkspace() workspace: { id: string },
  ) {
    const count = await this.notificationService.getUnreadCount(
      user.id,
      workspace.id,
    );
    return { count };
  }

  @Put(':id/read')
  async markAsRead(
    @Param('id') notificationId: string,
    @CurrentUser() user: { id: string },
  ) {
    await this.notificationService.markAsRead(notificationId, user.id);
    return { success: true };
  }

  @Put('read-all')
  async markAllAsRead(
    @CurrentUser() user: { id: string },
    @CurrentWorkspace() workspace: { id: string },
  ) {
    await this.notificationService.markAllAsRead(user.id, workspace.id);
    return { success: true };
  }

  @Get('preferences')
  async getPreferences(
    @CurrentUser() user: { id: string },
    @CurrentWorkspace() workspace: { id: string },
  ) {
    return this.notificationService.getPreferences(workspace.id, user.id);
  }

  @Put('preferences/:type')
  async updatePreference(
    @Param('type') type: NotificationType,
    @CurrentUser() user: { id: string },
    @CurrentWorkspace() workspace: { id: string },
    @Body() preferences: { email?: boolean; push?: boolean; inApp?: boolean },
  ) {
    return this.notificationService.updatePreference(
      workspace.id,
      type,
      preferences,
      user.id,
    );
  }

  /**
   * Helper endpoint to notify about campaign completion.
   * Can be called from frontend after updating campaign status, or from database triggers.
   */
  @Post('campaign-complete')
  async notifyCampaignComplete(
    @CurrentWorkspace() workspace: { id: string },
    @Body() data: { campaignId: string; campaignName: string },
  ) {
    await this.notificationService.createNotification(
      workspace.id,
      'CAMPAIGN_COMPLETE',
      'Campaign Completed',
      `Campaign "${data.campaignName}" has finished sending all messages.`,
      {
        campaignId: data.campaignId,
      },
    );
    return { success: true };
  }
}

