import { NextRequest } from 'next/server';
import { campaignService } from '@/lib/server/campaigns/campaign-service';
import { requireAuth } from '@/lib/server/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth(request);
    if (auth instanceof Response) return auth; // Error response

    const { id: campaignId } = params;
    await campaignService.processCampaign(campaignId);
    
    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Failed to process campaign:', error);
    return Response.json(
      { success: false, error: error?.message || 'Failed to process campaign' },
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

