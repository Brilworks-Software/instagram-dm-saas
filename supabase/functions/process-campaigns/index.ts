// @deno-types="jsr:@supabase/functions-js/edge-runtime.d.ts"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Type declarations for Deno (available in Supabase Edge Functions runtime)
declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: {
    get: (key: string) => string | undefined;
  };
};

/**
 * Supabase Edge Function to process campaigns
 * Called by pg_cron on a schedule
 * 
 * This function calls the Next.js API endpoint to process all RUNNING campaigns
 */
Deno.serve(async (req: Request) => {
  try {
    // Get environment variables
    const backendUrl = Deno.env.get('NEXT_PUBLIC_BACKEND_URL');
    const internalApiSecret = Deno.env.get('INTERNAL_API_SECRET');

    if (!backendUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'NEXT_PUBLIC_BACKEND_URL is not configured' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!internalApiSecret) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'INTERNAL_API_SECRET is not configured' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct the Next.js API endpoint URL
    const apiUrl = `${backendUrl}/api/internal/process-campaigns`;

    console.log(`Calling Next.js API: ${apiUrl}`);

    // Call the Next.js API endpoint
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${internalApiSecret}`,
      },
      body: JSON.stringify({}),
    });

    // Get response data
    const data = await response.json().catch(() => ({
      success: false,
      error: 'Failed to parse response',
    }));

    // Return the response from Next.js API
    return new Response(
      JSON.stringify({
        ...data,
        edgeFunctionTimestamp: new Date().toISOString(),
        backendUrl: backendUrl,
      }),
      {
        status: response.ok ? 200 : response.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error?.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

