-- Add cookies field to instagram_accounts table for persistent cookie storage
-- This allows cookies to be saved in Supabase and auto-loaded on page refresh
-- Run this SQL in your Supabase SQL Editor or database

ALTER TABLE instagram_accounts 
ADD COLUMN IF NOT EXISTS cookies JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS instagram_accounts_cookies_idx ON instagram_accounts(cookies) WHERE cookies IS NOT NULL;

-- Add comment
COMMENT ON COLUMN instagram_accounts.cookies IS 'Instagram session cookies stored as JSONB for persistent authentication';

