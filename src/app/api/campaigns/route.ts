import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma/client';
import { campaignService } from '@/lib/server/campaigns/campaign-service';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const body = await request.json();
    const {
      name,
      description,
      sendStartTime,
      sendEndTime,
      timezone,
      messagesPerDay,
      accountIds, // Array of Instagram account IDs
      contactIds, // Array of contact IDs
      leadIds, // Array of lead IDs (will be converted to contacts)
      steps, // Array of message steps
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return Response.json(
        { success: false, error: 'Campaign name is required' },
        { status: 400 }
      );
    }

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return Response.json(
        { success: false, error: 'At least one Instagram account must be selected' },
        { status: 400 }
      );
    }

    if ((!contactIds || contactIds.length === 0) && (!leadIds || leadIds.length === 0)) {
      return Response.json(
        { success: false, error: 'At least one recipient (contact or lead) must be selected' },
        { status: 400 }
      );
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return Response.json(
        { success: false, error: 'At least one message step is required' },
        { status: 400 }
      );
    }

    // Validate accounts belong to workspace and are active
    const accounts = await prisma.instagramAccount.findMany({
      where: {
        id: { in: accountIds },
        workspaceId: auth.workspaceId,
        isActive: true,
      },
    });

    if (accounts.length !== accountIds.length) {
      return Response.json(
        { success: false, error: 'One or more selected accounts are invalid or inactive' },
        { status: 400 }
      );
    }

    // Get or create contacts from leads
    const allContactIds: string[] = [...(contactIds || [])];
    
    if (leadIds && leadIds.length > 0) {
      const leads = await prisma.lead.findMany({
        where: {
          id: { in: leadIds },
          workspaceId: auth.workspaceId,
        },
      });

      for (const lead of leads) {
        // Check if contact already exists
        let contact = await prisma.contact.findUnique({
          where: {
            igUserId_workspaceId: {
              igUserId: lead.igUserId,
              workspaceId: auth.workspaceId,
            },
          },
        });

        if (!contact) {
          // Create contact from lead
          contact = await prisma.contact.create({
            data: {
              workspaceId: auth.workspaceId,
              igUserId: lead.igUserId,
              igUsername: lead.igUsername,
              name: lead.fullName,
              profilePictureUrl: lead.profilePicUrl,
            },
          });
        }

        allContactIds.push(contact.id);
      }
    }

    // Remove duplicates
    const uniqueContactIds = [...new Set(allContactIds)];
    const totalRecipients = uniqueContactIds.length;

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        workspaceId: auth.workspaceId,
        status: 'DRAFT',
        sendStartTime: sendStartTime || null,
        sendEndTime: sendEndTime || null,
        timezone: timezone || 'America/New_York',
        messagesPerDay: messagesPerDay || 10,
        totalRecipients,
        sentCount: 0,
        failedCount: 0,
        replyCount: 0,
        // Keep instagram_account_id for backward compatibility (use first account)
        instagramAccountId: accountIds[0] || null,
      },
    });

    // Create campaign_accounts junction table entries
    await prisma.campaignAccount.createMany({
      data: accountIds.map((accountId: string) => ({
        campaignId: campaign.id,
        instagramAccountId: accountId,
      })),
    });

    // Create campaign steps
    const createdSteps = await Promise.all(
      steps.map((step: any, index: number) => {
        // First step (index 0) should have no delay
        const delayMinutes =
          index === 0 ? 0 : step.delayDays ? step.delayDays * 1440 : 0;

        // Handle condition - can be object or string
        let conditionValue = null;
        if (step.condition) {
          if (typeof step.condition === "object") {
            conditionValue = step.condition;
          } else if (step.condition === "on_reply") {
            conditionValue = { type: "on_reply", enabled: true };
          } else {
            conditionValue = { type: "time_based", enabled: false };
          }
        }

        // Handle variants - store first variant in messageTemplate, others in condition JSON for now
        // TODO: Add messageVariants JSON field to CampaignStep schema
        let messageTemplate = step.messageTemplate || step.message || "";
        let variantsData = null;

        if (
          step.variants &&
          Array.isArray(step.variants) &&
          step.variants.length > 0
        ) {
          // Use first variant as primary template
          messageTemplate = step.variants[0].template || messageTemplate;
          // Store all variants in condition JSON (temporary solution)
          // In production, add a messageVariants JSON field to the schema
          variantsData = {
            variants: step.variants.map((v: any) => ({
              id: v.id,
              template: v.template,
            })),
          };
        }

        // Merge variants into condition if variants exist
        const finalCondition = variantsData
          ? { ...conditionValue, ...variantsData }
          : conditionValue;

        return prisma.campaignStep.create({
          data: {
            campaignId: campaign.id,
            stepOrder: index + 1,
            messageTemplate,
            delayMinutes,
            condition: finalCondition,
          },
        });
      })
    );

    // Assign recipients to accounts (round-robin)
    const recipientAssignments = uniqueContactIds.map((contactId, index) => {
      const accountIndex = index % accountIds.length;
      return {
        campaignId: campaign.id,
        contactId,
        assignedAccountId: accountIds[accountIndex],
        status: 'PENDING' as const,
        currentStepOrder: 0,
      };
    });

    // Generate random send times for recipients
    const recipientsWithTimes = await campaignService.assignRecipientsAndSchedule(
      campaign.id,
      recipientAssignments,
      {
        sendStartTime: sendStartTime || '09:00:00',
        sendEndTime: sendEndTime || '17:00:00',
        timezone: timezone || 'America/New_York',
        messagesPerDay: messagesPerDay || 10,
        accountIds,
      }
    );

    // Create campaign recipients with scheduled times
    await Promise.all(
      recipientsWithTimes.map((recipient: any) =>
        prisma.campaignRecipient.create({
          data: {
            campaignId: recipient.campaignId,
            contactId: recipient.contactId,
            assignedAccountId: recipient.assignedAccountId,
            status: recipient.status,
            currentStepOrder: recipient.currentStepOrder,
            nextProcessAt: recipient.nextProcessAt,
          },
        })
      )
    );

    return Response.json({
      success: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        totalRecipients: campaign.totalRecipients,
      },
    });
  } catch (error: any) {
    console.error('Failed to create campaign:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

