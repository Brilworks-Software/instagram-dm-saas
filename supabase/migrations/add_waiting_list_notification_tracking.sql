-- Add message column to waiting_list table
ALTER TABLE waiting_list
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add notification tracking columns to waiting_list table
ALTER TABLE waiting_list
ADD COLUMN IF NOT EXISTS slack_notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS slack_notification_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS slack_notification_error TEXT;

-- Create index on slack_notification_sent for filtering
CREATE INDEX IF NOT EXISTS idx_waiting_list_slack_notification_sent 
ON waiting_list(slack_notification_sent) 
WHERE slack_notification_sent = TRUE;

-- Create index on slack_notification_sent_at for sorting
CREATE INDEX IF NOT EXISTS idx_waiting_list_slack_notification_sent_at 
ON waiting_list(slack_notification_sent_at DESC) 
WHERE slack_notification_sent_at IS NOT NULL;

-- Add UPDATE policy for waiting_list to allow updating notification status
-- This allows the API to update notification tracking fields
-- Drop policy if it exists first (to allow re-running migration)
DROP POLICY IF EXISTS "Allow public updates for notification tracking" ON waiting_list;

-- Create UPDATE policy
CREATE POLICY "Allow public updates for notification tracking" ON waiting_list
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

