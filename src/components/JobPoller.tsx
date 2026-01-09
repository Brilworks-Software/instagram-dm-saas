"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * JobPoller
 * - Polls /api/campaigns/jobs?ig_user_id=... every 2 minutes for each active Instagram account
 * - Only runs when the user is authenticated (uses Supabase client-side auth)
 * - Logs responses and errors to the console for debugging
 */
export default function JobPoller() {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function pollOnce() {
      try {
        console.groupCollapsed('[JobPoller] Poll start', new Date().toISOString());
        const pollStart = Date.now();

        const supabase = createClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (!authUser) {
          // Not authenticated - nothing to do
          console.debug('[JobPoller] User not authenticated, skipping poll');
          console.groupEnd();
          return;
        }

        // Fetch active instagram accounts for the logged-in user
        console.debug('[JobPoller] Fetching active instagram_accounts for authenticated user', { userId: authUser.id });
        const accountsStart = Date.now();
        const { data: accounts, error: accountsError } = await supabase
          .from("instagram_accounts")
          .select("id, ig_user_id, ig_username, is_active")
          .eq("is_active", true);
        console.debug('[JobPoller] instagram_accounts fetch finished', { durationMs: Date.now() - accountsStart });

        if (accountsError) {
          console.error("[JobPoller] Error fetching instagram accounts:", accountsError);
          return;
        }

        if (!accounts || accounts.length === 0) {
          console.debug('[JobPoller] No active instagram accounts found for user');
          return;
        }

        // Iterate accounts sequentially. Send only one DM per poll cycle (random job across accounts).
        for (const acc of accounts as any[]) {
          try {
            const igUserId = acc.ig_user_id;
            const accountId = acc.id;

            console.groupCollapsed(`[JobPoller] Checking account ${acc.ig_username} (${igUserId})`);
            const jobsFetchStart = Date.now();
            const resp = await fetch(`/api/campaigns/jobs?ig_user_id=${encodeURIComponent(igUserId)}`);
            console.debug('[JobPoller] jobs fetch response', { status: resp.status, ok: resp.ok, durationMs: Date.now() - jobsFetchStart });

            let json: any = null;
            try {
              json = await resp.json();
              console.debug('[JobPoller] jobs response JSON parsed', json);
            } catch (parseErr) {
              const text = await resp.text();
              console.warn('[JobPoller] jobs response JSON parse failed, raw text:', text);
              console.error(parseErr);
            }

            if (!json || !json.success || !Array.isArray(json.jobs) || json.jobs.length === 0) {
              // No jobs for this account
              continue;
            }

            // Pick one random job from the jobs array
            const jobs: any[] = json.jobs;
            console.debug('[JobPoller] jobs count', jobs.length);
            const randomIndex = Math.floor(Math.random() * jobs.length);
            const job = jobs[randomIndex];

            console.debug('[JobPoller] selected job', { index: randomIndex, jobId: job?.id, campaignId: job?.campaignId });

            if (!job) {
              continue;
            }

            // Build message by substituting common template placeholders ({{username}})
            const recipientUsername = job.recipientUsername || job.recipientUserId;
            let message = job.message || "";
            try {
              message = message.replace(/{{\s*username\s*}}/gi, recipientUsername || '');
              console.debug('[JobPoller] templated message', { messagePreview: message.slice(0, 200) });
            } catch (e) {
              console.error('[JobPoller] message template replace error', e);
            }

            // Try to get cookies from localStorage (client-side store used elsewhere)
            const storageKey = `socialora_cookies_${igUserId}`;
            const cookiesStr = localStorage.getItem(storageKey);
            if (!cookiesStr) {
              console.warn(`[JobPoller] No cookies found in localStorage for ${igUserId} (key: ${storageKey})`);
              console.groupEnd();
              // skip to next account
              continue;
            }

            let cookies: any = null;
            try {
              cookies = JSON.parse(cookiesStr);
            } catch (e) {
              // Might be stored as plain JSON object string or other format
              cookies = cookiesStr as any;
            }

            if (!cookies) {
              console.warn(`[JobPoller] Unable to parse cookies for ${igUserId}`);
              console.groupEnd();
              continue;
            }

            // Mask cookies for debug (don't log full session values)
            const mask = (s: string | undefined) => {
              if (!s) return null;
              if (s.length <= 8) return '****';
              return `${s.slice(0, 4)}...${s.slice(-4)}`;
            };

            const cookiePreview: any = {};
            try {
              cookiePreview.sessionId = mask((cookies as any).sessionId || (cookies as any).sessionid || null);
              cookiePreview.dsUserId = (cookies as any).dsUserId || (cookies as any).ds_user_id || null;
              cookiePreview.keys = Object.keys(cookies || {}).slice(0, 10);
            } catch (e) {
              cookiePreview.raw = typeof cookies === 'string' ? `${(cookies as string).slice(0, 100)}...` : String(typeof cookies);
            }

            console.debug('[JobPoller] cookies preview', cookiePreview);

            // Call server-side send DM endpoint with cookies and accountId
            try {
              const sendStart = Date.now();
              console.debug('[JobPoller] Sending DM', { accountId, recipientUsername, jobId: job.id });
              const sendResp = await fetch('/api/instagram/cookie/dm/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  cookies,
                  recipientUsername,
                  message,
                  accountId,
                }),
              });

              let sendJson: any = null;
              try {
                sendJson = await sendResp.json();
                console.debug('[JobPoller] send response parsed', { status: sendResp.status, durationMs: Date.now() - sendStart, body: sendJson });
              } catch (parseSendErr) {
                const raw = await sendResp.text();
                console.warn('[JobPoller] send response parse failed, raw text:', raw);
                console.error(parseSendErr);
              }

              console.log(`[JobPoller] send result for job ${job.id} =>`, sendJson);

              // After sending one job (success or failure), stop processing further accounts this cycle
              console.groupEnd();
              break;
            } catch (sendError) {
              console.error('[JobPoller] Error sending DM for job', job, sendError);
              console.groupEnd();
              // Stop after one attempt per poll to avoid spamming
              break;
            }
          } catch (err) {
            console.error('[JobPoller] Error processing account', acc, err);
            console.groupEnd();
            // continue to next account
            continue;
          }
        }
        console.debug('[JobPoller] poll duration ms', Date.now() - pollStart);
        console.groupEnd();
      } catch (err) {
        console.error('[JobPoller] Unexpected error during poll:', err);
      }
    }

    // Run immediately on mount
    pollOnce();

    // Set interval to run every 2 minutes (120000 ms)
    intervalRef.current = window.setInterval(() => {
      if (!mounted) return;
      pollOnce();
    }, 120000);

    return () => {
      mounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return null;
}
