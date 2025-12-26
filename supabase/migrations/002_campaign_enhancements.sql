-- Campaign Enhancement Migrations
-- Adds scheduling, multi-account support, and daily message tracking

-- 1. Update campaigns table with new scheduling fields
ALTER TABLE campaigns 
  ADD COLUMN IF NOT EXISTS send_start_time TIME,
  ADD COLUMN IF NOT EXISTS send_end_time TIME,
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/New_York',
  ADD COLUMN IF NOT EXISTS messages_per_day INTEGER DEFAULT 10;

-- Make instagram_account_id nullable for backward compatibility
ALTER TABLE campaigns 
  ALTER COLUMN instagram_account_id DROP NOT NULL;

-- 2. Create campaign_accounts junction table for multi-account support
CREATE TABLE IF NOT EXISTS campaign_accounts (
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (campaign_id, instagram_account_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_accounts_campaign ON campaign_accounts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_accounts_account ON campaign_accounts(instagram_account_id);

-- 3. Add assigned_account_id to campaign_recipients
ALTER TABLE campaign_recipients 
  ADD COLUMN IF NOT EXISTS assigned_account_id UUID REFERENCES instagram_accounts(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_assigned_account ON campaign_recipients(assigned_account_id);

-- 4. Create account_daily_message_count table
CREATE TABLE IF NOT EXISTS account_daily_message_count (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instagram_account_id, date)
);

CREATE INDEX IF NOT EXISTS idx_account_daily_count ON account_daily_message_count(instagram_account_id, date);
CREATE INDEX IF NOT EXISTS idx_account_daily_count_date ON account_daily_message_count(date);

-- 5. Migration script: Copy existing instagram_account_id to campaign_accounts junction table
INSERT INTO campaign_accounts (campaign_id, instagram_account_id)
SELECT id, instagram_account_id 
FROM campaigns 
WHERE instagram_account_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM campaign_accounts 
    WHERE campaign_accounts.campaign_id = campaigns.id 
      AND campaign_accounts.instagram_account_id = campaigns.instagram_account_id
  )
ON CONFLICT DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE campaign_accounts IS 'Junction table for campaigns with multiple Instagram accounts';
COMMENT ON TABLE account_daily_message_count IS 'Tracks daily message count per account for rate limiting';
COMMENT ON COLUMN campaigns.send_start_time IS 'Start time of daily sending window';
COMMENT ON COLUMN campaigns.send_end_time IS 'End time of daily sending window';
COMMENT ON COLUMN campaigns.timezone IS 'Timezone for scheduling (e.g., America/New_York)';
COMMENT ON COLUMN campaigns.messages_per_day IS 'Maximum messages per day per account';
COMMENT ON COLUMN campaign_recipients.assigned_account_id IS 'Which Instagram account will send to this recipient';

