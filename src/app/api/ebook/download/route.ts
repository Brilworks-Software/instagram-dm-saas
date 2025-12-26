import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { formatEbookDownloadSlackMessage, postToSlack } from '@/lib/slack';

export async function POST(request: NextRequest) {
  try {
    const { email, instagramUsername, clientIp, ipInfo } = await request.json();

    // Validate that at least one field is provided
    if (!email && !instagramUsername) {
      return NextResponse.json(
        { error: 'Email or Instagram username is required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate Instagram username format if provided
    if (instagramUsername && !/^[a-zA-Z0-9._]{1,30}$/.test(instagramUsername)) {
      return NextResponse.json(
        { error: 'Invalid Instagram username format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Store lead in Supabase
    const { error: insertError } = await supabase
      .from('ebook_leads')
      .insert({
        email: email || null,
        instagram_username: instagramUsername || null,
        ebook_name: 'increase-instagram-followers-reach-engagement',
        downloaded_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error('Error storing lead:', insertError);
      // Continue even if storage fails - don't block the download
    }

    // Get the PDF download URL from Supabase Storage
    // Using 'eBook' bucket (capital E) as per existing Supabase setup
    const { data: fileData, error: fileError } = await supabase
      .storage
      .from('eBook')
      .createSignedUrl('increase-instagram-followers-reach-engagement.pdf', 3600); // 1 hour expiry

    if (fileError) {
      console.error('Error getting file URL:', fileError);
      console.error('Error details:', JSON.stringify(fileError, null, 2));
      
      // More specific error messages
      if (fileError.message?.includes('not found') || fileError.message?.includes('does not exist')) {
        return NextResponse.json(
          { error: 'eBook file not found. Please contact support.' },
          { status: 404 }
        );
      }
      
      if (fileError.message?.includes('permission') || fileError.message?.includes('policy')) {
        return NextResponse.json(
          { error: 'Permission denied. Please contact support.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: `Failed to generate download link: ${fileError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    if (!fileData || !fileData.signedUrl) {
      console.error('No file data returned from Supabase');
      return NextResponse.json(
        { error: 'Failed to generate download link. Please try again later.' },
        { status: 500 }
      );
    }

        // Send Slack notification (non-blocking)
    try {
      const slackMessage = formatEbookDownloadSlackMessage({
        email: email || null,
        instagramUsername: instagramUsername || null,
        ip: clientIp || null,
        ipInfo: ipInfo || null,
      });
      
      await postToSlack(slackMessage);
      console.log('[Slack] eBook download notification sent successfully');
    } catch (slackError) {
      console.warn('Slack notification failed:', slackError);
      // Don't block the download if Slack fails
    }

    return NextResponse.json({
      success: true,
      downloadUrl: fileData.signedUrl,
    });
  } catch (error) {
    console.error('Error processing download request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

