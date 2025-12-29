-- Setup Script for Campaign Processing Cron Job
-- This script helps you set up or update the pg_cron job for processing campaigns
--
-- INSTRUCTIONS:
-- 1. Get your PROJECT_REF from Supabase Dashboard → Settings → General → Reference ID
-- 2. Get your SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API → service_role key
-- 3. Replace the placeholders below with your actual values
-- 4. Run this script in Supabase SQL Editor

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;  -- Creates the "net" schema for net.http_post()

-- Step 2: Unschedule existing job if it exists (to update it)
SELECT cron.unschedule('process-campaigns') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-campaigns'
);

-- Step 3: Schedule the job
-- Replace YOUR_PROJECT_REF with your actual project reference (e.g., gielnjqmgxlxihqmjjre)
-- Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
SELECT cron.schedule(
  'process-campaigns',                    -- Job name
  '*/5 * * * *',                          -- Schedule: every 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/process-campaigns',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);

-- Step 4: Verify the job was created
SELECT 
  jobid,
  jobname,
  schedule,
  active,
  database,
  username
FROM cron.job 
WHERE jobname = 'process-campaigns';

-- USEFUL QUERIES:

-- View all scheduled cron jobs
-- SELECT * FROM cron.job;

-- View execution history for the campaign processing job
-- SELECT 
--   jobid,
--   runid,
--   job_pid,
--   database,
--   username,
--   command,
--   status,
--   return_message,
--   start_time,
--   end_time
-- FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-campaigns')
-- ORDER BY start_time DESC 
-- LIMIT 20;

-- Manually trigger the job (for testing)
-- SELECT cron.schedule('process-campaigns', '* * * * *', $$SELECT 1$$);
-- (Then unschedule and reschedule with the correct schedule)

-- Unschedule the job (to stop it)
-- SELECT cron.unschedule('process-campaigns');

