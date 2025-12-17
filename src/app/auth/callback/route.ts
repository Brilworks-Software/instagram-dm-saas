import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createUserWorkspace } from '@/lib/supabase/user-workspace';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type'); // 'recovery' for password reset
  const origin = requestUrl.origin;

  if (code) {
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

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // If this is a password reset flow, redirect to reset-password page
      // The session is already established, so no need to pass the code
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      // Check if user already has a workspace
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, workspace_id')
        .eq('supabase_auth_id', data.user.id)
        .single();

      // If user doesn't exist, create workspace and user record
      if (!existingUser) {
        const result = await createUserWorkspace(
          data.user.id,
          data.user.email || '',
          data.user.user_metadata?.full_name || data.user.user_metadata?.name
        );

        if (!result) {
          console.error('Failed to create workspace for user');
          // Still redirect, but user might need to contact support
        }
      }

      return NextResponse.redirect(`${origin}/inbox`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
