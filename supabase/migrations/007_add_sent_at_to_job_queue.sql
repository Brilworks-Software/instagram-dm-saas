-- Add a timestamp column to record when a queued job's DM was actually sent.
-- This is set when the job is marked COMPLETED by the status endpoint.

alter table if exists public.job_queue
add column if not exists sent_at timestamptz;

-- Optional index for common reporting/queries (harmless if it already exists)
create index if not exists job_queue_sent_at_idx on public.job_queue (sent_at);
