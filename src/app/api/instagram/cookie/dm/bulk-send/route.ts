import { NextRequest } from 'next/server';
import { instagramCookieService } from '@/lib/backend/instagram/cookie-service';
import type { InstagramCookies } from '@/lib/backend/instagram/types';

interface BulkSendDMRequest {
  cookies: InstagramCookies;
  recipients: Array<{
    username?: string;
    userId?: string;
  }>;
  message: string;
  delayMs?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as BulkSendDMRequest;
    const { cookies, recipients, message, delayMs = 3000 } = body;

    if (!cookies || !cookies.sessionId || !cookies.dsUserId) {
      return Response.json(
        { success: false, error: 'Invalid cookies. Missing required fields.' },
        { status: 400 }
      );
    }

    if (!recipients || recipients.length === 0) {
      return Response.json(
        { success: false, error: 'No recipients provided' },
        { status: 400 }
      );
    }

    const results: Array<{ recipient: string; success: boolean; error?: string }> = [];

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        let result;

        if (recipient.userId) {
          result = await instagramCookieService.sendDMByUserId(
            cookies,
            recipient.userId,
            message
          );
        } else if (recipient.username) {
          result = await instagramCookieService.sendDM(cookies, {
            recipientUsername: recipient.username,
            message,
          });
        } else {
          results.push({
            recipient: 'unknown',
            success: false,
            error: 'No username or userId provided',
          });
          continue;
        }

        results.push({
          recipient: recipient.username || recipient.userId || 'unknown',
          success: result.success,
          error: result.error,
        });

        // Add delay between messages to avoid rate limits (except for last one)
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      } catch (error: any) {
        results.push({
          recipient: recipient.username || recipient.userId || 'unknown',
          success: false,
          error: error?.message || 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;

    return Response.json({
      totalSent: results.length,
      successful: successCount,
      failed: results.length - successCount,
      results,
    });
  } catch (error: any) {
    console.error('Bulk DM failed:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to send bulk DMs' },
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

