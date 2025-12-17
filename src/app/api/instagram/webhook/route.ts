import { NextRequest } from 'next/server';

// Webhook verification endpoint for Meta
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Webhook verified successfully');
    return new Response(challenge || '', { status: 200 });
  }

  console.warn('Webhook verification failed');
  return new Response('Verification failed', { status: 403 });
}

// Receives incoming webhook events from Meta
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.debug(`Received webhook: ${JSON.stringify(payload)}`);

    if (payload.object !== 'instagram') {
      console.warn(`Ignoring non-Instagram webhook: ${payload.object}`);
      return new Response('EVENT_RECEIVED', { status: 200 });
    }

    // TODO: Process webhook events
    // This should handle:
    // - Incoming messages
    // - Message reads
    // - Message deliveries
    // - Mentions, comments, etc.

    return new Response('EVENT_RECEIVED', { status: 200 });
  } catch (error: any) {
    console.error(`Error processing webhook: ${error?.message}`, error?.stack);
    // Always return 200 to Meta to avoid retries
    return new Response('EVENT_RECEIVED', { status: 200 });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

