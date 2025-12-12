-- Create automations table for AI Studio
-- Run this in your Supabase SQL editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL,
  trigger_keywords TEXT[] DEFAULT '{}',
  response_template TEXT,
  is_active BOOLEAN DEFAULT false,
  messages_handled INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  instagram_account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS automations_workspace_id_idx ON automations(workspace_id);
CREATE INDEX IF NOT EXISTS automations_instagram_account_id_idx ON automations(instagram_account_id);
CREATE INDEX IF NOT EXISTS automations_is_active_idx ON automations(is_active);

-- Enable RLS (Row Level Security) if needed
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access their workspace's automations
-- Adjust this based on your auth setup
CREATE POLICY "Users can view automations in their workspace"
  ON automations FOR SELECT
  USING (true);

CREATE POLICY "Users can insert automations in their workspace"
  ON automations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update automations in their workspace"
  ON automations FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete automations in their workspace"
  ON automations FOR DELETE
  USING (true);

