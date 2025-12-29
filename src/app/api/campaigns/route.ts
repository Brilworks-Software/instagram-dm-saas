import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/server/auth';
import { prisma } from '@/lib/server/prisma/client';
import { campaignService } from '@/lib/server/campaigns/campaign-service';

/**
 * Validates and normalizes a time string to PostgreSQL TIME format (HH:mm:ss)
 * PostgreSQL TIME type accepts values from 00:00:00 to 23:59:59.999999
 * This function ensures the time is in the exact format PostgreSQL expects
 */
function normalizeTime(time: string | null | undefined): string | null {
  // Handle null/undefined/empty
  if (!time || typeof time !== 'string') return null;
  
  // Remove any whitespace
  const trimmed = time.trim();
  if (!trimmed || trimmed === '') return null;

  // Parse time string - accepts HH:mm or HH:mm:ss format
  // Also handle cases with milliseconds (HH:mm:ss.sss)
  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{1,2})(?:\.\d+)?)?$/);
  if (!timeMatch) {
    throw new Error(`Invalid time format: "${time}". Expected HH:mm or HH:mm:ss`);
  }

  const hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const seconds = parseInt(timeMatch[3] || '0', 10);

  // Validate ranges - PostgreSQL TIME accepts 00:00:00 to 23:59:59.999999
  if (isNaN(hours) || hours < 0 || hours > 23) {
    throw new Error(`Invalid hour: ${hours}. Must be between 0 and 23`);
  }
  if (isNaN(minutes) || minutes < 0 || minutes > 59) {
    throw new Error(`Invalid minutes: ${minutes}. Must be between 0 and 59`);
  }
  if (isNaN(seconds) || seconds < 0 || seconds > 59) {
    throw new Error(`Invalid seconds: ${seconds}. Must be between 0 and 59`);
  }

  // Format as HH:mm:ss (PostgreSQL TIME format, no milliseconds for simplicity)
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  return formatted;
}

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

    // Normalize and validate time values
    let normalizedStartTime: string | null = null;
    let normalizedEndTime: string | null = null;

    try {
      normalizedStartTime = normalizeTime(sendStartTime);
      normalizedEndTime = normalizeTime(sendEndTime);

      // Ensure we don't send empty strings - convert to null
      if (normalizedStartTime === "" || normalizedStartTime === null) {
        normalizedStartTime = null;
      }
      if (normalizedEndTime === "" || normalizedEndTime === null) {
        normalizedEndTime = null;
      }

      // Log for debugging
      console.log("Time normalization:", {
        original: { sendStartTime, sendEndTime },
        normalized: { normalizedStartTime, normalizedEndTime },
      });
    } catch (error: any) {
      console.error("Time normalization error:", error);
      return Response.json(
        { success: false, error: error.message || "Invalid time format" },
        { status: 400 }
      );
    }

    // Validation
    if (!name || !name.trim()) {
      return Response.json(
        { success: false, error: "Campaign name is required" },
        { status: 400 }
      );
    }

    if (!accountIds || !Array.isArray(accountIds) || accountIds.length === 0) {
      return Response.json(
        {
          success: false,
          error: "At least one Instagram account must be selected",
        },
        { status: 400 }
      );
    }

    if (
      (!contactIds || contactIds.length === 0) &&
      (!leadIds || leadIds.length === 0)
    ) {
      return Response.json(
        {
          success: false,
          error: "At least one recipient (contact or lead) must be selected",
        },
        { status: 400 }
      );
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return Response.json(
        { success: false, error: "At least one message step is required" },
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
        {
          success: false,
          error: "One or more selected accounts are invalid or inactive",
        },
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
    const uniqueContactIds = Array.from(new Set(allContactIds));
    const totalRecipients = uniqueContactIds.length;

    // Create campaign - use raw SQL for TIME fields to ensure proper casting
    // Prisma sometimes has issues with String to TIME conversion, so we'll use a transaction
    // First create the campaign without time fields, then update with raw SQL
    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        workspaceId: auth.workspaceId,
        status: "DRAFT",
        // Set time fields to null initially, update with raw SQL below
        sendStartTime: null,
        sendEndTime: null,
        timezone: timezone || "America/New_York",
        messagesPerDay: messagesPerDay || 10,
        totalRecipients,
        sentCount: 0,
        failedCount: 0,
        replyCount: 0,
        // Keep instagram_account_id for backward compatibility (use first account)
        instagramAccountId: accountIds[0] || null,
      },
    });

    // Update time fields with explicit TIME casting using raw SQL
    // This ensures PostgreSQL properly interprets the time strings
    if (normalizedStartTime || normalizedEndTime) {
      if (normalizedStartTime && normalizedEndTime) {
        await prisma.$executeRaw`
          UPDATE campaigns 
          SET 
            send_start_time = ${normalizedStartTime}::TIME,
            send_end_time = ${normalizedEndTime}::TIME
          WHERE id = ${campaign.id}::uuid
        `;
      } else if (normalizedStartTime) {
        await prisma.$executeRaw`
          UPDATE campaigns 
          SET send_start_time = ${normalizedStartTime}::TIME
          WHERE id = ${campaign.id}::uuid
        `;
      } else if (normalizedEndTime) {
        await prisma.$executeRaw`
          UPDATE campaigns 
          SET send_end_time = ${normalizedEndTime}::TIME
          WHERE id = ${campaign.id}::uuid
        `;
      }

      // Assign the normalized time values directly since Prisma has issues
      // reading TIME columns as strings (it tries to convert them to timestamps)
      // We use type assertion here because these are only for in-memory use
      // and won't affect the database (which is already updated via raw SQL above)
      (campaign as any).sendStartTime = normalizedStartTime;
      (campaign as any).sendEndTime = normalizedEndTime;
    }

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
        status: "PENDING" as const,
        currentStepOrder: 0,
      };
    });

    // Generate random send times for recipients
    const recipientsWithTimes =
      await campaignService.assignRecipientsAndSchedule(
        campaign.id,
        recipientAssignments,
        {
          sendStartTime: normalizedStartTime || "09:00:00",
          sendEndTime: normalizedEndTime || "17:00:00",
          timezone: timezone || "America/New_York",
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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    // Fetch campaigns using raw SQL to avoid TIME column type conversion issues
    // Prisma has issues reading TIME columns as strings
    const campaigns = await prisma.$queryRaw<
      Array<{
        id: string;
        name: string;
        description: string | null;
        status: string;
        scheduled_at: Date | null;
        started_at: Date | null;
        completed_at: Date | null;
        total_recipients: number;
        sent_count: number;
        failed_count: number;
        reply_count: number;
        created_at: Date;
        instagram_account_id: string | null;
        send_start_time: string | null;
        send_end_time: string | null;
      }>
    >`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.status,
        c.scheduled_at,
        c.started_at,
        c.completed_at,
        c.total_recipients,
        c.sent_count,
        c.failed_count,
        c.reply_count,
        c.created_at,
        c.instagram_account_id,
        c.send_start_time::text as send_start_time,
        c.send_end_time::text as send_end_time
      FROM campaigns c
      WHERE c.workspace_id = ${auth.workspaceId}::uuid
      ORDER BY c.created_at DESC
    `;

    // Get account usernames for campaigns
    const accountIds = campaigns
      .map((c) => c.instagram_account_id)
      .filter((id): id is string => id !== null);

    const accounts =
      accountIds.length > 0
        ? await prisma.instagramAccount.findMany({
            where: {
              id: { in: accountIds },
            },
            select: {
              id: true,
              igUsername: true,
            },
          })
        : [];

    const accountMap = new Map(accounts.map((a) => [a.id, a.igUsername]));

    // Transform campaigns to match frontend expectations
    const transformedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      status: campaign.status,
      scheduledAt: campaign.scheduled_at,
      startedAt: campaign.started_at,
      completedAt: campaign.completed_at,
      totalRecipients: campaign.total_recipients,
      sentCount: campaign.sent_count,
      failedCount: campaign.failed_count,
      replyCount: campaign.reply_count,
      createdAt: campaign.created_at,
      instagramUsername: campaign.instagram_account_id
        ? accountMap.get(campaign.instagram_account_id) || null
        : null,
    }));

    return Response.json({ success: true, campaigns: transformedCampaigns });
  } catch (error: any) {
    console.error("Failed to fetch campaigns:", error);
    return Response.json(
      { success: false, error: error?.message || "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

