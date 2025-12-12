import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a notification for users in a workspace based on their preferences.
   */
  async createNotification(
    workspaceId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
  ): Promise<void> {
    try {
      // Get all users in the workspace
      const users = await this.prisma.user.findMany({
        where: { workspaceId },
      });

      if (users.length === 0) {
        this.logger.debug(`No users found for workspace ${workspaceId}`);
        return;
      }

      // Create notifications for each user based on their preferences
      for (const user of users) {
        // Get user's preference for this notification type, or use workspace default
        const preference = await this.prisma.notificationPreference.findFirst({
          where: {
            workspaceId,
            userId: user.id,
            type,
          },
        });

        // If no user preference, check workspace-level preference (userId is null)
        const workspacePreference = preference
          ? null
          : await this.prisma.notificationPreference.findFirst({
              where: {
                workspaceId,
                userId: null,
                type,
              },
            });

        const effectivePreference = preference || workspacePreference;

        // Only create in-app notification if enabled (default is true if no preference)
        const shouldCreateInApp =
          effectivePreference?.inApp !== false || !effectivePreference;

        if (shouldCreateInApp) {
          await this.prisma.notification.create({
            data: {
              workspaceId,
              userId: user.id,
              type,
              title,
              message,
              metadata: metadata || {},
            },
          });
        }

        // TODO: Send email notification if enabled
        if (effectivePreference?.email) {
          this.logger.debug(`Email notification enabled for ${user.email} (not implemented)`);
          // await this.sendEmailNotification(user.email, title, message);
        }

        // TODO: Send push notification if enabled
        if (effectivePreference?.push) {
          this.logger.debug(`Push notification enabled for ${user.id} (not implemented)`);
          // await this.sendPushNotification(user.id, title, message);
        }
      }

      this.logger.log(`Created ${type} notification for workspace ${workspaceId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create notification: ${(error as Error).message}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  /**
   * Gets unread notifications for a user.
   */
  async getUnreadNotifications(userId: string, workspaceId: string, limit = 50) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        workspaceId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  /**
   * Gets all notifications for a user.
   */
  async getNotifications(
    userId: string,
    workspaceId: string,
    limit = 50,
    skip = 0,
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        workspaceId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
    });
  }

  /**
   * Gets unread notification count for a user.
   */
  async getUnreadCount(userId: string, workspaceId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        workspaceId,
        read: false,
      },
    });
  }

  /**
   * Marks a notification as read.
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId, // Ensure user owns this notification
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Marks all notifications as read for a user.
   */
  async markAllAsRead(userId: string, workspaceId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: {
        userId,
        workspaceId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Gets notification preferences for a user or workspace.
   */
  async getPreferences(workspaceId: string, userId?: string) {
    if (userId) {
      // Get user-specific preferences, falling back to workspace defaults
      const userPrefs = await this.prisma.notificationPreference.findMany({
        where: {
          workspaceId,
          userId,
        },
      });

      const workspacePrefs = await this.prisma.notificationPreference.findMany({
        where: {
          workspaceId,
          userId: null,
        },
      });

      // Merge preferences (user-specific override workspace defaults)
      const allTypes: NotificationType[] = [
        'NEW_MESSAGE',
        'CAMPAIGN_COMPLETE',
        'NEW_FOLLOWER',
        'WEEKLY_REPORT',
      ];

      return allTypes.map((type) => {
        const userPref = userPrefs.find((p) => p.type === type);
        const workspacePref = workspacePrefs.find((p) => p.type === type);
        return userPref || workspacePref || null;
      }).filter(Boolean);
    } else {
      // Get workspace-level preferences only
      return this.prisma.notificationPreference.findMany({
        where: {
          workspaceId,
          userId: null,
        },
      });
    }
  }

  /**
   * Updates notification preferences.
   */
  async updatePreference(
    workspaceId: string,
    type: NotificationType,
    preferences: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    },
    userId?: string,
  ) {
    // First try to find existing preference
    const existing = await this.prisma.notificationPreference.findFirst({
      where: {
        workspaceId,
        userId: userId || null,
        type,
      },
    });

    if (existing) {
      return this.prisma.notificationPreference.update({
        where: { id: existing.id },
        data: preferences,
      });
    } else {
      return this.prisma.notificationPreference.create({
        data: {
          workspaceId,
          userId: userId || null,
          type,
          email: preferences.email ?? true,
          push: preferences.push ?? false,
          inApp: preferences.inApp ?? true,
        },
      });
    }
  }
}

