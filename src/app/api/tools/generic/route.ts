import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { formatToolUsageSlackMessage, postToSlack } from '@/lib/slack';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolSlug, formData, clientIp, ipInfo } = body;

    if (!toolSlug || !formData) {
      return NextResponse.json(
        { success: false, error: 'Tool slug and form data are required' },
        { status: 400 }
      );
    }

    // Extract Instagram handle if present (look for fields with 'instagram' or 'handle' in key)
    let instagramHandle: string | null = null;
    for (const [key, value] of Object.entries(formData)) {
      if (key.toLowerCase().includes('instagram') || key.toLowerCase().includes('handle')) {
        instagramHandle = (value as string).replace(/^@+/, '').trim();
        break;
      }
    }

    // Extract niche/topic (second field or field with 'niche', 'topic', 'category' in key)
    let niche: string | null = null;
    const formValues = Object.entries(formData);
    if (formValues.length > 1) {
      niche = formValues[1][1] as string;
    }
    for (const [key, value] of Object.entries(formData)) {
      if (key.toLowerCase().includes('niche') || key.toLowerCase().includes('topic') || key.toLowerCase().includes('category')) {
        niche = value as string;
        break;
      }
    }

    // Save tool usage to database
    await prisma.toolUsage.create({
      data: {
        toolType: toolSlug,
        instaId: instagramHandle,
        niche: niche,
        formData: formData as any,
        ipAddress: clientIp,
        location: ipInfo as any,
      },
    });

    // Build form data lines for Slack
    const formLines: string[] = [];
    Object.entries(formData).forEach(([key, value]) => {
      const label = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      formLines.push(`📝 ${label}: ${value}`);
    });

    const dataSendInSlack = formatToolUsageSlackMessage({
      toolType: toolSlug,
      instaId: instagramHandle || Object.values(formData)[0] as string || 'N/A',
      niche: niche,
      ip: clientIp || null,
      ipInfo: ipInfo || null,
      additionalData: formLines.join('\n'),
    });

    console.log('[Tool Submission]', {
      tool: toolSlug,
      formData,
      ip: clientIp,
      location: ipInfo,
    });

    // Best-effort Slack notification
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
