import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const error = requestUrl.searchParams.get('error');
  const origin = requestUrl.origin;

  // Handle errors from Meta
  if (error) {
    const errorReason = requestUrl.searchParams.get('error_reason');
    console.error('Meta OAuth error:', error, errorReason);
    return NextResponse.redirect(
      `${origin}/settings/instagram?error=${encodeURIComponent(error)}&reason=${encodeURIComponent(errorReason || '')}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/settings/instagram?error=no_code`);
  }

  try {
    // Exchange code for access token
    const clientId = process.env.NEXT_PUBLIC_META_APP_ID;
    const clientSecret = process.env.META_APP_SECRET;
    const redirectUri = process.env.NEXT_PUBLIC_META_OAUTH_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('Missing Meta OAuth configuration');
      return NextResponse.redirect(`${origin}/settings/instagram?error=config_missing`);
    }

    // Exchange code for short-lived token
    const tokenUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', redirectUri);
    tokenUrl.searchParams.set('code', code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Token exchange error:', tokenData.error);
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=token_exchange&message=${encodeURIComponent(tokenData.error.message || '')}`
      );
    }

    const shortLivedToken = tokenData.access_token;

    // Exchange for long-lived token
    const longLivedUrl = new URL('https://graph.facebook.com/v18.0/oauth/access_token');
    longLivedUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longLivedUrl.searchParams.set('client_id', clientId);
    longLivedUrl.searchParams.set('client_secret', clientSecret);
    longLivedUrl.searchParams.set('fb_exchange_token', shortLivedToken);

    const longLivedResponse = await fetch(longLivedUrl.toString());
    const longLivedData = await longLivedResponse.json();

    if (longLivedData.error) {
      console.error('Long-lived token error:', longLivedData.error);
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=long_lived_token&message=${encodeURIComponent(longLivedData.error.message || '')}`
      );
    }

    const longLivedToken = longLivedData.access_token;
    const expiresIn = longLivedData.expires_in;

    // Get Facebook pages
    const pagesUrl = new URL('https://graph.facebook.com/v18.0/me/accounts');
    pagesUrl.searchParams.set('fields', 'id,name,access_token,instagram_business_account');
    pagesUrl.searchParams.set('access_token', longLivedToken);

    const pagesResponse = await fetch(pagesUrl.toString());
    const pagesData = await pagesResponse.json();

    if (pagesData.error) {
      console.error('Pages fetch error:', pagesData.error);
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=pages_fetch&message=${encodeURIComponent(pagesData.error.message || '')}`
      );
    }

    // Find page with Instagram business account
    const pageWithIg = pagesData.data?.find((page: { instagram_business_account?: { id: string } }) => 
      page.instagram_business_account
    );

    if (!pageWithIg || !pageWithIg.instagram_business_account) {
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=no_instagram&message=${encodeURIComponent('No Instagram Business account found. Please connect your Instagram account to a Facebook Page first.')}`
      );
    }

    // Get Instagram account details
    const igAccountId = pageWithIg.instagram_business_account.id;
    const igUrl = new URL(`https://graph.facebook.com/v18.0/${igAccountId}`);
    igUrl.searchParams.set('fields', 'id,username,profile_picture_url,followers_count');
    igUrl.searchParams.set('access_token', pageWithIg.access_token);

    const igResponse = await fetch(igUrl.toString());
    const igData = await igResponse.json();

    if (igData.error) {
      console.error('Instagram fetch error:', igData.error);
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=instagram_fetch&message=${encodeURIComponent(igData.error.message || '')}`
      );
    }

    // Save to Supabase
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Server Component - ignore
            }
          },
        },
      }
    );

    // Get current user's workspace
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=not_authenticated&message=${encodeURIComponent('Please log in first.')}`
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('workspace_id')
      .eq('supabase_auth_id', authUser.id)
      .single();

    if (!user?.workspace_id) {
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=no_workspace&message=${encodeURIComponent('No workspace found. Please contact support.')}`
      );
    }

    const workspace = { id: user.workspace_id };

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn || 5184000)); // Default 60 days

    // Upsert Instagram account
    const { error: upsertError } = await supabase
      .from('instagram_accounts')
      .upsert({
        workspace_id: workspace.id,
        ig_user_id: igData.id,
        ig_username: igData.username,
        fb_page_id: pageWithIg.id,
        access_token: pageWithIg.access_token, // Page token for messaging
        access_token_expires_at: expiresAt.toISOString(),
        profile_picture_url: igData.profile_picture_url,
        is_active: true,
        permissions: ['instagram_basic', 'instagram_manage_messages', 'pages_messaging'],
      }, {
        onConflict: 'ig_user_id,workspace_id',
      });

    if (upsertError) {
      console.error('Upsert error:', upsertError);
      return NextResponse.redirect(
        `${origin}/settings/instagram?error=save_failed&message=${encodeURIComponent(upsertError.message || '')}`
      );
    }

    // Success!
    return NextResponse.redirect(
      `${origin}/settings/instagram?success=true&account=${encodeURIComponent(igData.username)}`
    );
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(
      `${origin}/settings/instagram?error=callback_failed&message=${encodeURIComponent(String(err))}`
    );
  }
}

