import { prisma } from '../prisma/client';
import { instagramCookieService } from '../instagram/cookie-service';

export class CampaignService {
  /**
   * Processes a campaign and sends messages to pending recipients.
   */
  async processCampaign(campaignId: string): Promise<void> {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        instagramAccount: true,
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
        recipients: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          include: {
            contact: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new Error(`Campaign ${campaignId} not found`);
    }

    if (campaign.status !== 'RUNNING') {
      console.warn(`Campaign ${campaignId} is not in RUNNING status`);
      return;
    }

    if (campaign.steps.length === 0) {
      console.warn(`Campaign ${campaignId} has no steps`);
      return;
    }

    // Get cookies for the Instagram account
    const cookies = await this.getCookiesForAccount(campaign.instagramAccount.id);
    if (!cookies) {
      console.error(`No cookies found for Instagram account ${campaign.instagramAccount.id}`);
      return;
    }

    const now = new Date();
    let processedCount = 0;

    for (const recipient of campaign.recipients) {
      try {
        // Check if it's time to process this recipient
        if (recipient.nextProcessAt && recipient.nextProcessAt > now) {
          continue;
        }

        const currentStep = campaign.steps.find(
          s => s.stepOrder === recipient.currentStepOrder + 1
        );

        if (!currentStep) {
          // All steps completed
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'COMPLETED',
              lastProcessedAt: now,
            },
          });
          continue;
        }

        // Personalize message template
        const message = this.personalizeMessage(
          currentStep.messageTemplate,
          recipient.contact
        );

        // Send DM
        const result = await instagramCookieService.sendDM(cookies, {
          recipientUsername: recipient.contact.igUsername || '',
          message,
        });

        if (result.success) {
          // Calculate next process time (delay for next step)
          const nextStep = campaign.steps.find(
            s => s.stepOrder === recipient.currentStepOrder + 2
          );
          const delayMinutes = nextStep?.delayMinutes || 0;
          const nextProcessAt = new Date(now.getTime() + delayMinutes * 60 * 1000);

          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'IN_PROGRESS',
              currentStepOrder: currentStep.stepOrder,
              lastProcessedAt: now,
              nextProcessAt: nextStep ? nextProcessAt : null,
            },
          });

          // Create message record
          await prisma.message.create({
            data: {
              conversationId: await this.getOrCreateConversation(
                campaign.instagramAccount.id,
                recipient.contact.id
              ),
              content: message,
              direction: 'OUTBOUND',
              status: 'SENT',
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

          processedCount++;
        } else {
          // Failed to send
          await prisma.campaignRecipient.update({
            where: { id: recipient.id },
            data: {
              status: 'FAILED',
              errorMessage: result.error || 'Unknown error',
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
        await this.delay(1000);
      } catch (error: any) {
        console.error(
          `Error processing recipient ${recipient.id}: ${error?.message}`
        );
        await prisma.campaignRecipient.update({
          where: { id: recipient.id },
          data: {
            status: 'FAILED',
            errorMessage: error?.message,
          },
        });
      }
    }

    // Check if campaign is complete
    const remainingRecipients = await prisma.campaignRecipient.count({
      where: {
        campaignId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    });

    if (remainingRecipients === 0) {
      await prisma.campaign.update({
        where: { id: campaignId },
        data: {
          status: 'COMPLETED',
          completedAt: now,
        },
      });
    }

    console.log(
      `Processed ${processedCount} recipients for campaign ${campaignId}`
    );
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

