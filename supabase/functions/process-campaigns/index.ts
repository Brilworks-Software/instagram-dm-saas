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
 * CORS headers helper function
 * Returns standard CORS headers for all responses
 */
function getCorsHeaders(): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

/**
 * Create a JSON response with CORS headers
 */
function createJsonResponse(
  data: any,
  status: number = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  let jsonBody: string;
  try {
    jsonBody = JSON.stringify(data);
  } catch (error) {
    // Fallback if JSON.stringify fails
    jsonBody = JSON.stringify({
      success: false,
      error: "Failed to serialize response",
      originalError: error instanceof Error ? error.message : "Unknown error",
    });
    status = 500;
  }

  return new Response(jsonBody, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...getCorsHeaders(),
      ...additionalHeaders,
    },
  });
}

/**
 * Handle OPTIONS preflight request for CORS
 */
function handleOptionsRequest(): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(),
  });
}

/**
 * Create a fetch request with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number = 30000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Parse JSON response safely
 */
async function parseJsonResponse(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text();
    return {
      success: false,
      error: "Response is not JSON",
      rawResponse: text.substring(0, 500), // Limit raw response length
    };
  }

  try {
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: "Failed to parse JSON response",
      parseError: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Supabase Edge Function to process campaigns
 * Called by pg_cron on a schedule
 *
 * This function calls the Next.js API endpoint to process all RUNNING campaigns
 */
Deno.serve(async (req: Request) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Handle CORS preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return handleOptionsRequest();
  }

  // Handle GET requests for health checks (useful for testing)
  if (req.method === "GET") {
    return createJsonResponse(
      {
        success: true,
        message: "Edge Function is running",
        method: "GET",
        supportedMethods: ["POST", "GET", "OPTIONS"],
        requestId,
        timestamp: new Date().toISOString(),
      },
      200
    );
  }

  // Validate HTTP method - only POST is allowed for actual processing
  if (req.method !== "POST") {
    console.error(`[${requestId}] Method not allowed: ${req.method}`);
    return createJsonResponse(
      {
        success: false,
        error: `Method ${req.method} not allowed. Supported methods: POST, GET, OPTIONS`,
        requestId,
        timestamp: new Date().toISOString(),
      },
      405
    );
  }

  try {
    // Get environment variables early
    const backendUrl = Deno.env.get("NEXT_PUBLIC_BACKEND_URL");
    const internalApiSecret = Deno.env.get("INTERNAL_API_SECRET");

    if (!backendUrl) {
      console.error(`[${requestId}] NEXT_PUBLIC_BACKEND_URL is not configured`);
      return createJsonResponse(
        {
          success: false,
          error: "NEXT_PUBLIC_BACKEND_URL is not configured",
          requestId,
        },
        500
      );
    }

    if (!internalApiSecret) {
      console.error(`[${requestId}] INTERNAL_API_SECRET is not configured`);
      return createJsonResponse(
        {
          success: false,
          error: "INTERNAL_API_SECRET is not configured",
          requestId,
        },
        500
      );
    }

    // Construct the Next.js API endpoint URL
    const apiUrl = `${backendUrl}/api/internal/process-campaigns`;

    console.log(`[${requestId}] Calling Next.js API: ${apiUrl}`);

    // Call the Next.js API endpoint with timeout (30 seconds)
    let response: Response;
    try {
      response = await fetchWithTimeout(
        apiUrl,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${internalApiSecret}`,
          },
          body: JSON.stringify({}),
        },
        30000 // 30 second timeout
      );
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown network error";
      console.error(`[${requestId}] Network error:`, errorMessage);

      return createJsonResponse(
        {
          success: false,
          error: "Failed to reach backend API",
          details: errorMessage,
          requestId,
          timestamp: new Date().toISOString(),
        },
        503 // Service Unavailable
      );
    }

    // Parse response safely
    const data = await parseJsonResponse(response);

    const duration = Date.now() - startTime;
    console.log(
      `[${requestId}] Request completed in ${duration}ms with status ${response.status}`
    );

    // Return the response from Next.js API with additional metadata
    return createJsonResponse(
      {
        ...data,
        edgeFunctionTimestamp: new Date().toISOString(),
        edgeFunctionDuration: `${duration}ms`,
        requestId,
      },
      response.ok ? 200 : response.status
    );
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error?.message || "Unknown error occurred";
    const errorStack = error?.stack || "No stack trace available";

    console.error(`[${requestId}] Edge Function error after ${duration}ms:`, {
      message: errorMessage,
      stack: errorStack,
    });

    return createJsonResponse(
      {
        success: false,
        error: errorMessage,
        requestId,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
      },
      500
    );
  }
});
