-- Enable pg_cron extension for scheduled tasks
-- This allows PostgreSQL to schedule jobs that call Supabase Edge Functions

-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for making HTTP requests
-- This creates the "net" schema and provides net.http_post() function
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Note: Replace the following placeholders with your actual values:
-- 1. YOUR_PROJECT_REF: Your Supabase project reference ID (found in project settings)
--    Example: gielnjqmgxlxihqmjjre
-- 2. YOUR_SERVICE_ROLE_KEY: Your Supabase service role key (found in API settings)
--    Keep this secure and never expose it publicly

-- Schedule job to call Edge Function every 5 minutes
-- The job will trigger the process-campaigns Edge Function
-- 
-- IMPORTANT: Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- Get it from: Supabase Dashboard → Settings → API → service_role key
SELECT cron.schedule(
  'process-campaigns',                    -- Job name
  '*/5 * * * *',                          -- Cron schedule: every 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://gielnjqmgxlxihqmjjre.supabase.co/functions/v1/process-campaigns',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);


-- To update the service role key later, you can unschedule and reschedule:
-- SELECT cron.unschedule('process-campaigns');
-- Then run the SELECT cron.schedule() again with the new key

-- To check if the job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'process-campaigns';

-- To view job execution history:
-- SELECT * FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-campaigns') ORDER BY start_time DESC LIMIT 10;

