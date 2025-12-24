import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { formatToolUsageSlackMessage, postToSlack } from '@/lib/slack';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instagramHandle, contentNiche, clientIp, ipInfo } = body;

    if (!instagramHandle) {
      return NextResponse.json(
        { success: false, error: 'Instagram handle is required' },
        { status: 400 }
      );
    }

    // Save tool usage to database
    await prisma.toolUsage.create({
      data: {
        toolType: 'brand-matcher',
        instaId: instagramHandle.replace(/^@+/, '').trim(),
        niche: contentNiche || null,
        formData: { instagramHandle, contentNiche } as any,
        ipAddress: clientIp,
        location: ipInfo as any,
      },
    });

    const dataSendInSlack = formatToolUsageSlackMessage({
      toolType: 'brand-matcher',
      instaId: instagramHandle,
      niche: contentNiche || null,
      ip: clientIp || null,
      ipInfo: ipInfo || null,
    });
    
    console.log('[Tool Submission]', {
      tool: 'brand-matcher',
      handle: instagramHandle,
      niche: contentNiche,
      ip: clientIp,
      location: ipInfo,
    });

    // Best-effort Slack notification (does not block success response)
    try {
      await postToSlack(dataSendInSlack);
      console.log('[Slack] Message sent successfully');
    } catch (slackError) {
      console.warn('Slack notification failed:', slackError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving tool usage:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save tool usage' },
      { status: 500 }
    );
  }
}
