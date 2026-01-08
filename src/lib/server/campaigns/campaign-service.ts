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
    // Fetch campaign with steps and recipients
    // Using raw query to avoid Prisma type issues until client is regenerated
    const campaignData = await prisma.$queryRaw<
      Array<{
        id: string;
        status: string;
        scheduledAt: Date | null;
        messagesPerDay: number;
      }>
    >`
      SELECT id, status, scheduled_at as "scheduledAt", messages_per_day as "messagesPerDay"
      FROM campaigns
      WHERE id = ${campaignId}::uuid
    `;

    if (!campaignData || campaignData.length === 0) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    const campaign = campaignData[0];

    // Fetch steps with variants
    const steps = await prisma.$queryRaw<
      Array<{
        id: string;
        stepOrder: number;
        delayDays: number | null;
        delayHours: number | null;
        delayMinutes: number | null;
        messageTemplate: string | null;
      }>
    >`
      SELECT 
        id,
        step_order as "stepOrder",
        delay_days as "delayDays",
        delay_hours as "delayHours",
        delay_minutes as "delayMinutes",
        message_template as "messageTemplate"
      FROM campaign_steps
      WHERE campaign_id = ${campaignId}::uuid
      ORDER BY step_order ASC
    `;

    // Fetch variants for each step
    const stepIds = steps.map((s) => s.id);
    const variants =
      stepIds.length > 0
        ? await prisma.$queryRaw<
            Array<{
              stepId: string;
              messageTemplate: string;
            }>
          >`
      SELECT 
        step_id as "stepId",
        message_template as "messageTemplate"
      FROM step_variants
      WHERE step_id = ANY(${stepIds}::uuid[])
    `
        : [];

    // Group variants by step
    const stepsWithVariants = steps.map((step) => ({
      ...step,
      variants: variants
        .filter((v) => v.stepId === step.id)
        .map((v) => ({ messageTemplate: v.messageTemplate })),
    }));

    // Fetch recipients
    const recipients = await prisma.campaignRecipient.findMany({
      where: {
        campaignId: campaignId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      include: {
        contact: true,
        assignedAccount: true,
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    // Check if campaign is SCHEDULED and scheduledAt has passed, then update to RUNNING
    const now = new Date();
    if (campaign.status === "SCHEDULED" && campaign.scheduledAt) {
      if (campaign.scheduledAt <= now) {
        await prisma.campaign.update({
          where: { id: campaignId },
          data: {
            status: "RUNNING",
            startedAt: now,
          },
        });
        // Update campaign status in memory
        campaign.status = "RUNNING";
      } else {
        // Campaign is scheduled but not yet time to start
        console.log(
          `Campaign ${campaignId} is scheduled for ${campaign.scheduledAt}, waiting...`
        );
        return;
      }
    }

    if (campaign.status !== "RUNNING") {
      console.warn(
        `Campaign ${campaignId} is not in RUNNING status (current: ${campaign.status})`
      );
      return;
    }

    if (stepsWithVariants.length === 0) {
      console.warn(`Campaign ${campaignId} has no steps`);
      return;
    }

    // Get campaign accounts (supports both multi-account and legacy single-account)
    const campaignAccounts = await this.getCampaignAccounts(campaignId);

    if (campaignAccounts.length === 0) {
      throw new Error("No accounts assigned to campaign");
    }

    let processedCount = 0;

    // Process recipients assigned to each account separately
    for (const account of campaignAccounts) {
      const accountRecipients = recipients.filter(
        (r: any) => r.assignedAccountId === account.id
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
          // Support both nextActionAt (new) and nextProcessAt (backward compatibility)
          const nextActionTime =
            (recipient as any).nextActionAt || recipient.nextProcessAt;
          if (nextActionTime && nextActionTime > now) {
            continue;
          }

          const currentStep = stepsWithVariants.find(
            (s: any) => s.stepOrder === recipient.currentStepOrder + 1
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

          // For follow-up steps (stepOrder > 1), check if recipient has replied
          // Only send follow-up if no reply within delay days
          if (currentStep.stepOrder > 1 && recipient.lastProcessedAt) {
            const hasReplied = await this.hasRecipientReplied(
              account.id,
              recipient.contact.id,
              recipient.lastProcessedAt
            );

            if (hasReplied) {
              // Recipient replied, mark as REPLIED and skip follow-up
              await prisma.campaignRecipient.update({
                where: { id: recipient.id },
                data: {
                  status: "REPLIED",
                },
              });
              continue;
            }
          }

          // Get message template from variants (new approach)
          let messageTemplate: string | null = null;

          // Load variants from StepVariant table (new approach)
          if (currentStep.variants && currentStep.variants.length > 0) {
            // Randomly select a variant
            const randomIndex = Math.floor(
              Math.random() * currentStep.variants.length
            );
            messageTemplate = currentStep.variants[randomIndex].messageTemplate;
          } else if (currentStep.messageTemplate) {
            // Fallback to messageTemplate for backward compatibility
            messageTemplate = currentStep.messageTemplate;
          }

          if (!messageTemplate) {
            console.error(
              `No message template found for step ${currentStep.id}`
            );
            continue;
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
            const nextStep = stepsWithVariants.find(
              (s: any) => s.stepOrder === recipient.currentStepOrder + 2
            );
            // Use delayDays (new) or fallback to delayMinutes/delayHours (backward compatibility)
            let delayDays = 0;
            if (nextStep) {
              if (
                (nextStep as any).delayDays !== null &&
                (nextStep as any).delayDays !== undefined
              ) {
                delayDays = (nextStep as any).delayDays;
              } else if (
                (nextStep as any).delayHours !== null &&
                (nextStep as any).delayHours !== undefined
              ) {
                delayDays = (nextStep as any).delayHours / 24;
              } else if (
                (nextStep as any).delayMinutes !== null &&
                (nextStep as any).delayMinutes !== undefined
              ) {
                delayDays = (nextStep as any).delayMinutes / 1440;
              }
            }
            const nextActionAt = nextStep
              ? new Date(now.getTime() + delayDays * 24 * 60 * 60 * 1000)
              : null;

            const updateData: any = {
              status: "IN_PROGRESS",
              currentStepOrder: currentStep.stepOrder,
              lastProcessedAt: now,
              nextProcessAt: nextActionAt, // Keep for backward compatibility
            };

            // Add nextActionAt if the column exists
            if (nextActionAt) {
              updateData.nextActionAt = nextActionAt;
            }

            await prisma.campaignRecipient.update({
              where: { id: recipient.id },
              data: updateData,
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
      return junctionAccounts.map((ca) => ca.instagramAccount);
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
      status: "PENDING";
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
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Handle midnight crossover
    let rangeMinutes = endMinutes - startMinutes;
    if (rangeMinutes < 0) {
      rangeMinutes += 24 * 60; // Add 24 hours
    }

    // Use weighted random (more messages in middle of range)
    const randomFactor = Math.random() * 0.6 + 0.2; // 0.2 to 0.8 (weighted toward middle)
    const randomMinutes = Math.floor(
      startMinutes + rangeMinutes * randomFactor
    );

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
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

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
  async incrementAccountDailyCount(
    accountId: string,
    date: Date
  ): Promise<void> {
    const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD format

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
    const name = contact.name || contact.igUsername || "there";
    message = message.replace(/\{\{name\}\}/g, name);

    // Replace {{username}} with Instagram username
    message = message.replace(/\{\{username\}\}/g, contact.igUsername || "");

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
          status: "OPEN",
        },
      });
    }

    return conversation.id;
  }

  /**
   * Checks if a recipient has replied after the last campaign message was sent.
   */
  private async hasRecipientReplied(
    instagramAccountId: string,
    contactId: string,
    lastProcessedAt: Date
  ): Promise<boolean> {
    const conversation = await prisma.conversation.findUnique({
      where: {
        instagramAccountId_contactId: {
          instagramAccountId,
          contactId,
        },
      },
    });

    if (!conversation) {
      return false;
    }

    // Check if there are any inbound messages after the last processed time
    const reply = await prisma.message.findFirst({
      where: {
        conversationId: conversation.id,
        direction: "INBOUND",
        sentAt: {
          gt: lastProcessedAt,
        },
      },
    });

    return !!reply;
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
      const decryptedCookies = instagramCookieService.decryptCookies(
        account.accessToken
      );
      return decryptedCookies;
    } catch (error) {
      console.error(
        `Failed to decrypt cookies for account ${accountId}: ${
          (error as Error).message
        }`
      );
      return null;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const campaignService = new CampaignService();
