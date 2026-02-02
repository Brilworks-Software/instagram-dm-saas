import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma/client";

/**
 * Create a Date object representing a specific local time in a given timezone
 * Uses a simple approach: create date strings and use Intl to find the UTC equivalent
 * @param year - Year
 * @param month - Month (1-12)
 * @param day - Day (1-31)
 * @param hour - Hour (0-23) in local timezone
 * @param minute - Minute (0-59) in local timezone
 * @param timezone - IANA timezone string (e.g., "America/New_York")
 * @returns Date object in UTC representing the local time
 */
function createDateInTimezone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timezone: string
): Date {
  // Create a date string in ISO format (YYYY-MM-DDTHH:mm:ss)
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
  
  // Use Intl to format this as if it were in the target timezone, then parse back
  // We'll use a roundabout method: create dates and compare
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  
  // Try different UTC times until we find one that matches our desired local time
  // Start with assuming the time is the same in UTC (will be wrong, but gives us a starting point)
  let testDate = new Date(`${dateStr}Z`);
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const parts = formatter.formatToParts(testDate);
    const tzHour = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const tzMinute = parseInt(parts.find((p) => p.type === "minute")?.value || "0");
    
    if (tzHour === hour && tzMinute === minute) {
      // Found the right UTC time!
      return testDate;
    }
    
    // Adjust: if timezone hour is less than desired, we need to go back in UTC
    // If timezone hour is more than desired, we need to go forward in UTC
    const diffMinutes = (hour * 60 + minute) - (tzHour * 60 + tzMinute);
    testDate = new Date(testDate.getTime() + diffMinutes * 60 * 1000);
    attempts++;
  }
  
  // Fallback: return the test date (should be close)
  return testDate;
}

/**
 * POST /api/campaigns/jobs/check-time-window
 * Checks if current time is within the campaign's send time window
 * and updates scheduledAt accordingly:
 * - If time exceeds end time: update scheduledAt to next day's start time
 * - If time is before start time: update scheduledAt to today's start time
 * - If within window: return current scheduledAt (no update needed, even if in the past)
 * 
 * Note: Jobs with scheduledAt in the past are left unchanged and will be processed as-is.
 * 
 * Body: { jobId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId } = body ?? {};

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "jobId is required" },
        { status: 400 }
      );
    }

    // Fetch job
    const job = await prisma.jobQueue.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    // Fetch campaign details separately (no relation defined in Prisma schema)
    const campaign = await prisma.campaign.findUnique({
      where: { id: job.campaignId },
      select: {
        id: true,
        sendStartTime: true,
        sendEndTime: true,
        timezone: true,
        messagesPerDay: true,
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // If campaign has no time window set, skip check
    if (!campaign.sendStartTime || !campaign.sendEndTime) {
      return NextResponse.json({
        success: true,
        updated: false,
        scheduledAt: job.scheduledAt.toISOString(),
        reason: "Campaign has no time window configured",
      });
    }

    // Get campaign timezone (default to America/New_York)
    const timezone = campaign.timezone || "America/New_York";

    // Parse start and end times from Time fields
    // These are stored as Time (HH:mm:ss) representing local time in the campaign's timezone
    const startTime = campaign.sendStartTime as unknown as Date | string;
    const endTime = campaign.sendEndTime as unknown as Date | string;

    // Extract hours and minutes from the Time fields
    let startHours = 0;
    let startMinutes = 0;
    let endHours = 0;
    let endMinutes = 0;

    if (startTime instanceof Date) {
      // If it's a Date object, extract hours/minutes (stored as UTC time representing local time)
      startHours = startTime.getUTCHours();
      startMinutes = startTime.getUTCMinutes();
    } else if (typeof startTime === "string") {
      const [hours, minutes] = startTime.split(":").map(Number);
      startHours = hours || 0;
      startMinutes = minutes || 0;
    }

    if (endTime instanceof Date) {
      endHours = endTime.getUTCHours();
      endMinutes = endTime.getUTCMinutes();
    } else if (typeof endTime === "string") {
      const [hours, minutes] = endTime.split(":").map(Number);
      endHours = hours || 0;
      endMinutes = minutes || 0;
    }

    // Get current time in campaign's timezone
    const now = new Date();
    
    // Format current time in campaign timezone to get local date/time components
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const currentYear = parseInt(parts.find((p) => p.type === "year")?.value || "0");
    const currentMonth = parseInt(parts.find((p) => p.type === "month")?.value || "0") - 1; // 0-indexed
    const currentDay = parseInt(parts.find((p) => p.type === "day")?.value || "0");
    const currentHours = parseInt(parts.find((p) => p.type === "hour")?.value || "0");
    const currentMinutes = parseInt(parts.find((p) => p.type === "minute")?.value || "0");

    // Create today's start time in the campaign timezone, converted to UTC
    const todayStartUTC = createDateInTimezone(
      currentYear,
      currentMonth + 1,
      currentDay,
      startHours,
      startMinutes,
      timezone
    );

    // Calculate current time in minutes for comparison
    const currentTimeMinutes = currentHours * 60 + currentMinutes;
    const startTimeMinutes = startHours * 60 + startMinutes;
    const endTimeMinutes = endHours * 60 + endMinutes;

    let newScheduledAt: Date | null = null;
    let updateReason = "";

    // Check daily limit first (if set)
    let dailyLimitReached = false;
    let jobsSentToday = 0;
    if (campaign.messagesPerDay && campaign.messagesPerDay > 0) {
      // Get today's date range in campaign timezone (start of day to end of day)
      const todayStartOfDay = createDateInTimezone(
        currentYear,
        currentMonth + 1,
        currentDay,
        0,
        0,
        timezone
      );
      
      const todayEndOfDay = createDateInTimezone(
        currentYear,
        currentMonth + 1,
        currentDay,
        23,
        59,
        timezone
      );
      // Count jobs sent today for this campaign
      jobsSentToday = await prisma.jobQueue.count({
        where: {
          campaignId: job.campaignId,
          sentAt: {
            gte: todayStartOfDay,
            lte: todayEndOfDay,
          },
        },
      });
      
      // Check if daily limit reached
      if (jobsSentToday >= campaign.messagesPerDay) {
        dailyLimitReached = true;
      }
    }

    // Check if current time is before start time
    if (currentTimeMinutes < startTimeMinutes) {
      // If daily limit reached, schedule for tomorrow's start time
      if (dailyLimitReached) {
        const tomorrowStart = new Date(todayStartUTC);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        newScheduledAt = tomorrowStart;
        updateReason = `Daily limit reached (${jobsSentToday}/${campaign.messagesPerDay} messages sent today). Current time (${currentHours}:${String(currentMinutes).padStart(2, "0")}) is before start time (${startHours}:${String(startMinutes).padStart(2, "0")}). Scheduled for tomorrow's start time.`;
      } else {
        // Update scheduledAt to today's start time
        newScheduledAt = todayStartUTC;
        updateReason = `Current time (${currentHours}:${String(currentMinutes).padStart(2, "0")}) is before start time (${startHours}:${String(startMinutes).padStart(2, "0")}). Scheduled for today's start time.`;
      }
    }
    // Check if current time exceeds end time
    else if (currentTimeMinutes >= endTimeMinutes) {
      // Update scheduledAt to next day's start time
      const tomorrowStart = new Date(todayStartUTC);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      newScheduledAt = tomorrowStart;
      updateReason = `Current time (${currentHours}:${String(currentMinutes).padStart(2, "0")}) exceeds end time (${endHours}:${String(endMinutes).padStart(2, "0")}). Scheduled for tomorrow's start time.`;
    }
    // Current time is within the window
    else {
      // If daily limit not reached, no update needed - leave scheduledAt as is
      if (!dailyLimitReached) {
        return NextResponse.json({
          success: true,
          updated: false,
          scheduledAt: job.scheduledAt.toISOString(),
          reason: `Current time is within the send window (${startHours}:${String(startMinutes).padStart(2, "0")} - ${endHours}:${String(endMinutes).padStart(2, "0")})`,
        });
      }
      
      // Daily limit reached, schedule for next day's start time
      const tomorrowStart = new Date(todayStartUTC);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);
      newScheduledAt = tomorrowStart;
      updateReason = `Daily limit reached (${jobsSentToday}/${campaign.messagesPerDay} messages sent today). Scheduled for tomorrow's start time.`;
    }

    // Update the job's scheduledAt if needed
    if (newScheduledAt) {
      await prisma.jobQueue.update({
        where: { id: jobId },
        data: {
          scheduledAt: newScheduledAt,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        updated: true,
        scheduledAt: newScheduledAt.toISOString(),
        reason: updateReason,
        previousScheduledAt: job.scheduledAt.toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      updated: false,
      scheduledAt: job.scheduledAt.toISOString(),
    });
  } catch (err: any) {
    console.error("❌ Time window check failed:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Time window check failed",
      },
      { status: 500 }
    );
  }
}
