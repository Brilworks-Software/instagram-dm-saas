import { prisma } from '../prisma/client';
import { instagramCookieService } from '../instagram/cookie-service';

interface ScheduleConfig {
  sendStartTime: string; // HH:mm:ss format
  sendEndTime: string; // HH:mm:ss format
  timezone: string;
  messagesPerDay: number;
  accountIds: string[];
}

export class CampaignService {
  /**
   * Processes a campaign and sends messages to pending recipients.
   * Now supports multiple accounts.
   */
  async processCampaign(campaignId: string): Promise<void> {
    // Use select to explicitly exclude sendStartTime and sendEndTime (TIME columns)
    // that cause Prisma conversion errors. These fields are not needed for processing.
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        id: true,
        status: true,
        messagesPerDay: true,
        steps: {
          orderBy: { stepOrder: "asc" },
        },
        recipients: {
          where: {
            status: { in: ["PENDING", "IN_PROGRESS"] },
          },
          include: {
            contact: true,
            assignedAccount: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    if (campaign.status !== "RUNNING") {
      console.warn(`Campaign ${campaignId} is not in RUNNING status`);
      return;
    }

    if (campaign.steps.length === 0) {
      console.warn(`Campaign ${campaignId} has no steps`);
      return;
    }

    // Get campaign accounts (supports both multi-account and legacy single-account)
    const campaignAccounts = await this.getCampaignAccounts(campaignId);

    if (campaignAccounts.length === 0) {
      throw new Error("No accounts assigned to campaign");
    }

    const now = new Date();
    let processedCount = 0;

    // Process recipients assigned to each account separately
    for (const account of campaignAccounts) {
      const accountRecipients = campaign.recipients.filter(
        (r) => r.assignedAccountId === account.id
      );

      if (accountRecipients.length === 0) continue;

      // Get cookies for this account
      const cookies = await this.getCookiesForAccount(account.id);
      if (!cookies) {
        console.error(`No cookies found for Instagram account ${account.id}`);
        continue;
      }

      // Check daily limit for this account
      const dailyCount = await this.getAccountDailyCount(account.id, now);
      if (dailyCount >= campaign.messagesPerDay) {
        console.log(
          `Account ${account.id} has reached daily limit (${dailyCount}/${campaign.messagesPerDay})`
        );
        continue;
      }

      // Process each recipient for this account
      for (const recipient of accountRecipients) {
        try {
          // Check if it's time to process this recipient
          if (recipient.nextProcessAt && recipient.nextProcessAt > now) {
            continue;
          }

          const currentStep = campaign.steps.find(
            (s) => s.stepOrder === recipient.currentStepOrder + 1
          );

          if (!currentStep) {
            // All steps completed
            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: {
                status: "COMPLETED",
                lastProcessedAt: now,
              },
            });
            continue;
          }

          // Get message template (use variants if available, otherwise use messageTemplate)
          let messageTemplate = currentStep.messageTemplate;

          // Check if variants exist in condition JSON
          if (
            currentStep.condition &&
            typeof currentStep.condition === "object"
          ) {
            const condition = currentStep.condition as any;
            if (
              condition.variants &&
              Array.isArray(condition.variants) &&
              condition.variants.length > 0
            ) {
              // Randomly select a variant
              const randomIndex = Math.floor(
                Math.random() * condition.variants.length
              );
              messageTemplate =
                condition.variants[randomIndex].template || messageTemplate;
            }
          }

          // Personalize message template
          const message = this.personalizeMessage(
            messageTemplate,
            recipient.contact
          );

          // Send DM
          const result = await instagramCookieService.sendDM(cookies, {
            recipientUsername: recipient.contact.igUsername || "",
            message,
          });

          if (result.success) {
            // Calculate next process time (delay for next step)
            const nextStep = campaign.steps.find(
              (s) => s.stepOrder === recipient.currentStepOrder + 2
            );
            const delayMinutes = nextStep?.delayMinutes || 0;
            const nextProcessAt = new Date(
              now.getTime() + delayMinutes * 60 * 1000
            );

            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: {
                status: "IN_PROGRESS",
                currentStepOrder: currentStep.stepOrder,
                lastProcessedAt: now,
                nextProcessAt: nextStep ? nextProcessAt : null,
              },
            });

            // Create message record
            await prisma.message.create({
              data: {
                conversationId: await this.getOrCreateConversation(
                  account.id,
                  recipient.contact.id
                ),
                content: message,
                direction: "OUTBOUND",
                status: "SENT",
                sentAt: now,
                campaignStepId: currentStep.id,
              },
            });

            // Update campaign stats
            await prisma.campaign.update({
              where: { id: campaignId },
              data: {
                sentCount: { increment: 1 },
              },
            });

            // Increment account daily count
            await this.incrementAccountDailyCount(account.id, now);

            processedCount++;
          } else {
            // Failed to send
            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: {
                status: "FAILED",
                errorMessage: result.error || "Unknown error",
              },
            });

            await prisma.campaign.update({
              where: { id: campaignId },
              data: {
                failedCount: { increment: 1 },
              },
            });
          }

          // Small delay to avoid rate limits
          await this.delay(5000);
        } catch (error: any) {
          console.error(
            `Error processing recipient ${recipient.id}: ${error?.message}`
          );
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: "FAILED",
              errorMessage: error?.message,
            },
          });
        }
      }
    }

    // Check if campaign is complete
    const remainingRecipients = await prisma.campaignRecipient.count({
      where: {
        campaignId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    });

    if (remainingRecipients === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: "COMPLETED",
          completedAt: now,
        },
      });
    }

    console.log(
      `Processed ${processedCount} recipients for campaign ${campaignId}`
    );
  }

  /**
   * Gets campaign accounts (supports both multi-account and legacy single-account)
   */
  async getCampaignAccounts(campaignId: string) {
    // Check campaign_accounts junction table first (multi-account)
    const junctionAccounts = await prisma.campaignAccount.findMany({
      where: { campaignId },
      include: { instagramAccount: true },
    });
    
    if (junctionAccounts.length > 0) {
      return junctionAccounts.map(ca => ca.instagramAccount);
    }
    
    // Fallback to legacy single account
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { instagramAccount: true },
    });
    
    if (campaign?.instagramAccount) {
      return [campaign.instagramAccount];
    }
    
    return [];
  }

  /**
   * Assigns recipients to accounts and generates random send times
   */
  async assignRecipientsAndSchedule(
    campaignId: string,
    recipientAssignments: Array<{
      campaignId: string;
      contactId: string;
      assignedAccountId: string;
      status: 'PENDING';
      currentStepOrder: number;
    }>,
    config: ScheduleConfig
  ) {
    const today = new Date();
    const recipientsWithTimes = [];

    // Group recipients by account
    const recipientsByAccount: Record<string, typeof recipientAssignments> = {};
    for (const assignment of recipientAssignments) {
      if (!recipientsByAccount[assignment.assignedAccountId]) {
        recipientsByAccount[assignment.assignedAccountId] = [];
      }
      recipientsByAccount[assignment.assignedAccountId].push(assignment);
    }

    // For each account, schedule recipients
    for (const [accountId, recipients] of Object.entries(recipientsByAccount)) {
      const dailyCount = await this.getAccountDailyCount(accountId, today);
      const scheduledTimes: Date[] = [];

      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];
        let scheduledDate = today;
        let scheduledTime: Date;

        // Check if account has reached daily limit
        if (dailyCount + i >= config.messagesPerDay) {
          // Schedule for next day
          scheduledDate = new Date(today);
          scheduledDate.setDate(scheduledDate.getDate() + 1);
        }

        // Generate random time within time range
        const randomTime = this.generateRandomTime(
          config.sendStartTime,
          config.sendEndTime,
          scheduledDate
        );

        // Ensure minimum 5-minute gap from previous scheduled sends
        scheduledTime = this.ensureMinimumGap(randomTime, scheduledTimes, 5);

        scheduledTimes.push(scheduledTime);

        recipientsWithTimes.push({
          ...recipient,
          nextProcessAt: scheduledTime,
        });
      }
    }

    return recipientsWithTimes;
  }

  /**
   * Generates a random time within the specified time range
   */
  private generateRandomTime(
    startTime: string,
    endTime: string,
    date: Date
  ): Date {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle midnight crossover
    let rangeMinutes = endMinutes - startMinutes;
    if (rangeMinutes < 0) {
      rangeMinutes += 24 * 60; // Add 24 hours
    }

    // Use weighted random (more messages in middle of range)
    const randomFactor = Math.random() * 0.6 + 0.2; // 0.2 to 0.8 (weighted toward middle)
    const randomMinutes = Math.floor(startMinutes + rangeMinutes * randomFactor);

    const scheduledTime = new Date(date);
    scheduledTime.setHours(Math.floor(randomMinutes / 60));
    scheduledTime.setMinutes(randomMinutes % 60);
    scheduledTime.setSeconds(Math.floor(Math.random() * 60));

    return scheduledTime;
  }

  /**
   * Ensures minimum gap between scheduled times
   */
  private ensureMinimumGap(
    time: Date,
    existingTimes: Date[],
    minGapMinutes: number
  ): Date {
    const minGapMs = minGapMinutes * 60 * 1000;
    let adjustedTime = new Date(time);

    for (const existingTime of existingTimes) {
      const diff = Math.abs(adjustedTime.getTime() - existingTime.getTime());
      if (diff < minGapMs) {
        // Adjust time to maintain gap
        adjustedTime = new Date(existingTime.getTime() + minGapMs);
        // Add some random variation (0-10 minutes)
        adjustedTime = new Date(
          adjustedTime.getTime() + Math.random() * 10 * 60 * 1000
        );
      }
    }

    return adjustedTime;
  }

  /**
   * Gets daily message count for an account
   */
  async getAccountDailyCount(accountId: string, date: Date): Promise<number> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    const count = await prisma.accountDailyMessageCount.findUnique({
      where: {
        instagramAccountId_date: {
          instagramAccountId: accountId,
          date: new Date(dateStr),
        },
      },
    });

    return count?.messageCount || 0;
  }

  /**
   * Increments daily message count for an account
   */
  async incrementAccountDailyCount(accountId: string, date: Date): Promise<void> {
    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format

    await prisma.accountDailyMessageCount.upsert({
      where: {
        instagramAccountId_date: {
          instagramAccountId: accountId,
          date: new Date(dateStr),
        },
      },
      update: {
        messageCount: { increment: 1 },
        updatedAt: new Date(),
      },
      create: {
        instagramAccountId: accountId,
        date: new Date(dateStr),
        messageCount: 1,
      },
    });
  }

  /**
   * Personalizes a message template with contact data.
   */
  private personalizeMessage(template: string, contact: any): string {
    let message = template;
    
    // Replace {{name}} with contact name or username
    const name = contact.name || contact.igUsername || 'there';
    message = message.replace(/\{\{name\}\}/g, name);
    
    // Replace {{username}} with Instagram username
    message = message.replace(/\{\{username\}\}/g, contact.igUsername || '');
    
    return message;
  }

  /**
   * Gets or creates a conversation for a contact.
   */
  private async getOrCreateConversation(
    instagramAccountId: string,
    contactId: string
  ): Promise<string> {
    let conversation = await prisma.conversation.findUnique({
      where: {
        instagramAccountId_contactId: {
          instagramAccountId,
          contactId,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          instagramAccountId,
          contactId,
          status: 'OPEN',
        },
      });
    }

    return conversation.id;
  }

  /**
   * Gets cookies for an Instagram account.
   */
  private async getCookiesForAccount(accountId: string): Promise<any> {
    const account = await prisma.instagramAccount.findUnique({
      where: { id: accountId },
    });

    if (!account || !account.accessToken) {
      return null;
    }

    // Decrypt cookies from accessToken field
    try {
      const decryptedCookies = instagramCookieService.decryptCookies(account.accessToken);
      return decryptedCookies;
    } catch (error) {
      console.error(`Failed to decrypt cookies for account ${accountId}: ${(error as Error).message}`);
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const campaignService = new CampaignService();
