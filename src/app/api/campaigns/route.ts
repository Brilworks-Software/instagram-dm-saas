import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma/client";
import { requireAuth } from "@/lib/server/auth";

// DELETE /api/campaigns?id=campaignId
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth;

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("id");
    if (!campaignId) {
      return Response.json({ success: false, error: "Campaign id is required" }, { status: 400 });
    }

    // Check campaign belongs to workspace
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { id: true, workspaceId: true },
    });
    if (!campaign || campaign.workspaceId !== auth.workspaceId) {
      return Response.json({ success: false, error: "Campaign not found or unauthorized" }, { status: 404 });
    }

    // Delete all related data (order matters due to FKs)
    // 1. campaign_accounts
    await prisma.campaignAccount.deleteMany({ where: { campaignId } });
    // 2. campaign_steps and step_variants
    const steps = await prisma.campaignStep.findMany({ where: { campaignId }, select: { id: true } });
    const stepIds = steps.map((s: { id: string }) => s.id);
    if (stepIds.length > 0) {
      await prisma.stepVariant.deleteMany({ where: { stepId: { in: stepIds } } });
      await prisma.campaignStep.deleteMany({ where: { id: { in: stepIds } } });
    }
    // 3. campaign_recipients (and job_queue)
    const recipients = await prisma.campaignRecipient.findMany({ where: { campaignId }, select: { id: true } });
    const recipientIds = recipients.map((r: { id: string }) => r.id);
    if (recipientIds.length > 0) {
      await prisma.jobQueue.deleteMany({ where: { leadId: { in: recipientIds } } });
      await prisma.campaignRecipient.deleteMany({ where: { id: { in: recipientIds } } });
    }
    // 4. campaign itself
    await prisma.campaign.delete({ where: { id: campaignId } });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete campaign:", error);
    return Response.json({ success: false, error: error?.message || "Failed to delete campaign" }, { status: 500 });
  }
}

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
      schedule_type, // "IMMEDIATE" | "SPECIFIC_TIME"
      scheduled_at, // ISO datetime string (optional if IMMEDIATE)
      messages_per_day,
      timezone,
      time_frame, // { start: "09:00", end: "18:00" }
      account_ids, // Array of Instagram account IDs
      contact_ids, // Array of contact IDs
      lead_ids, // Array of lead IDs (will be converted to contacts) - optional for backward compatibility
      steps, // Array of { order: number, variants: string[], delay_hours?: number }
    } = body;

    // Validation
    if (!name || !name.trim()) {
      return Response.json(
        { success: false, error: "Campaign name is required" },
        { status: 400 }
      );
    }

    if (
      !schedule_type ||
      !["IMMEDIATE", "SPECIFIC_TIME"].includes(schedule_type)
    ) {
      return Response.json(
        {
          success: false,
          error: "schedule_type must be IMMEDIATE or SPECIFIC_TIME",
        },
        { status: 400 }
      );
    }

    if (schedule_type === "SPECIFIC_TIME" && !scheduled_at) {
      return Response.json(
        {
          success: false,
          error: "scheduled_at is required when schedule_type is SPECIFIC_TIME",
        },
        { status: 400 }
      );
    }

    if (
      !account_ids ||
      !Array.isArray(account_ids) ||
      account_ids.length === 0
    ) {
      return Response.json(
        {
          success: false,
          error: "At least one Instagram account must be selected",
        },
        { status: 400 }
      );
    }

    if (
      (!contact_ids || contact_ids.length === 0) &&
      (!lead_ids || lead_ids.length === 0)
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

    // Validate each step has variants
    for (const step of steps) {
      if (
        !step.variants ||
        !Array.isArray(step.variants) ||
        step.variants.length === 0
      ) {
        return Response.json(
          {
            success: false,
            error: `Step ${step.order} must have at least one variant`,
          },
          { status: 400 }
        );
      }
    }

    // Validate accounts belong to workspace and are active
    const accounts = await prisma.instagramAccount.findMany({
      where: {
        id: { in: account_ids },
        workspaceId: auth.workspaceId,
        isActive: true,
      },
    });

    if (accounts.length !== account_ids.length) {
      return Response.json(
        {
          success: false,
          error: "One or more selected accounts are invalid or inactive",
        },
        { status: 400 }
      );
    }

    // Get or create contacts from leads (if lead_ids provided)
    const allContactIds: string[] = [...(contact_ids || [])];

    if (lead_ids && lead_ids.length > 0) {
      const leads = await prisma.lead.findMany({
        where: {
          id: { in: lead_ids },
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
              bio: lead.bio,
              profilePictureUrl: lead.profilePicUrl,
            },
          });
        }

        allContactIds.push(contact.id);
      }
    }

    // Validate contacts belong to workspace
    if (allContactIds.length > 0) {
      const contacts = await prisma.contact.findMany({
        where: {
          id: { in: allContactIds },
          workspaceId: auth.workspaceId,
        },
      });

      if (contacts.length !== allContactIds.length) {
        return Response.json(
          {
            success: false,
            error: "One or more selected contacts are invalid",
          },
          { status: 400 }
        );
      }
    }

    // Remove duplicates
    const uniqueContactIds = Array.from(new Set(allContactIds));
    const totalRecipients = uniqueContactIds.length;

    // Normalize time frame values
    let normalizedStartTime: string | null = null;
    let normalizedEndTime: string | null = null;

    if (time_frame) {
      try {
        normalizedStartTime = normalizeTime(time_frame.start);
        normalizedEndTime = normalizeTime(time_frame.end);
      } catch (error: any) {
        console.error("Time normalization error:", error);
        return Response.json(
          { success: false, error: error.message || "Invalid time format" },
          { status: 400 }
        );
      }
    }

    // Determine scheduled_at datetime
    const scheduledDateTime =
      schedule_type === "IMMEDIATE" ? new Date() : new Date(scheduled_at!);

    // ============================================
    // Step 1: Create Campaign Container
    // ============================================
    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        workspaceId: auth.workspaceId,
        status: schedule_type === "IMMEDIATE" ? "RUNNING" : "SCHEDULED", // New campaigns start as RUNNING if immediate, otherwise SCHEDULED
        scheduledAt: scheduledDateTime,
        timezone: timezone || "America/New_York",
        messagesPerDay: messages_per_day || 10,
        totalRecipients,
        sentCount: 0,
        failedCount: 0,
        replyCount: 0,
        // Keep instagram_account_id for backward compatibility (use first account)
        instagramAccountId: account_ids[0] || null,
      },
    });

    // Update time fields with explicit TIME casting using raw SQL
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
    }

    // ============================================
    // Step 2: Link the Sending Accounts
    // ============================================
    await prisma.campaignAccount.createMany({
      data: account_ids.map((accountId: string) => ({
        campaignId: campaign.id,
        instagramAccountId: accountId,
      })),
    });

    // ============================================
    // Step 3: Store the Message Content
    // ============================================
    const createdSteps = await Promise.all(
      steps.map(async (step: any) => {
        // Create the step using raw SQL to support delayDays field
        const stepResult = await prisma.$queryRaw<Array<{ id: string }>>`
          INSERT INTO campaign_steps (campaign_id, step_order, delay_days, message_template)
          VALUES (${campaign.id}::uuid, ${step.order}, ${
          step.delay_days || 0
        }, '')
          RETURNING id
        `;
        const createdStepId = stepResult[0].id;

        // Create variants for this step
        if (step.variants && step.variants.length > 0) {
          await Promise.all(
            step.variants.map(
              (variant: string) =>
                prisma.$executeRaw`
                INSERT INTO step_variants (step_id, message_template)
                VALUES (${createdStepId}::uuid, ${variant})
              `
            )
          );
        }

        return { id: createdStepId };
      })
    );

    // ============================================
    // Step 4: Distribute the Leads (Round-Robin Assignment)
    // ============================================
    // Use raw SQL to insert recipients with nextActionAt field
    // (Prisma client needs regeneration to recognize nextActionAt)
    const recipientValues = uniqueContactIds.map((contactId, index) => {
      const accountIndex = index % account_ids.length;
      return {
        campaignId: campaign.id,
        contactId,
        assignedAccountId: account_ids[accountIndex],
        scheduledAt: scheduledDateTime,
      };
    });

    // Insert recipients using raw SQL to support nextActionAt
    // Using individual inserts in parallel for simplicity
    if (recipientValues.length > 0) {
      await Promise.all(
        recipientValues.map(
          (r) =>
            prisma.$executeRaw`
            INSERT INTO campaign_recipients (
              id,
              campaign_id,
              contact_id,
              assigned_account_id,
              status,
              current_step_order,
              next_action_at,
              next_process_at,
              created_at,
              updated_at
            )
            VALUES (
              gen_random_uuid(),
              ${r.campaignId}::uuid,
              ${r.contactId}::uuid,
              ${r.assignedAccountId}::uuid,
              'PENDING',
              1,
              ${r.scheduledAt}::timestamp with time zone,
              ${r.scheduledAt}::timestamp with time zone,
              NOW(),
              NOW()
            )
          `
        )
      );
    }

    // ============================================
    // Step 5: API Response
    // ============================================
    return Response.json({
      success: true,
      campaign_id: campaign.id,
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
  .map((c: { instagram_account_id: string | null }) => c.instagram_account_id)
  .filter((id: string | null): id is string => id !== null);

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

  const accountMap = new Map(accounts.map((a: { id: string, igUsername: string }) => [a.id, a.igUsername]));

    // Transform campaigns to match frontend expectations
  const transformedCampaigns = campaigns.map((campaign: any) => ({
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

