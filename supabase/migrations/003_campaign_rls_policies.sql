-- RLS Policies for Campaign Enhancement Tables
-- Ensures users can only access campaigns and related data from their workspace

-- Enable RLS on campaign_accounts
ALTER TABLE campaign_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see campaign_accounts for campaigns in their workspace
CREATE POLICY "Users can view campaign_accounts in their workspace"
  ON campaign_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_accounts.campaign_id
        AND campaigns.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
  );

-- Policy: Users can insert campaign_accounts for campaigns in their workspace
CREATE POLICY "Users can insert campaign_accounts in their workspace"
  ON campaign_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_accounts.campaign_id
        AND campaigns.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
    AND EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = campaign_accounts.instagram_account_id
        AND instagram_accounts.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
  );

-- Policy: Users can delete campaign_accounts for campaigns in their workspace
CREATE POLICY "Users can delete campaign_accounts in their workspace"
  ON campaign_accounts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE campaigns.id = campaign_accounts.campaign_id
        AND campaigns.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
  );

-- Enable RLS on account_daily_message_count
ALTER TABLE account_daily_message_count ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see daily message counts for accounts in their workspace
CREATE POLICY "Users can view account_daily_message_count in their workspace"
  ON account_daily_message_count
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = account_daily_message_count.instagram_account_id
        AND instagram_accounts.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
  );

-- Policy: Users can insert/update daily message counts for accounts in their workspace
CREATE POLICY "Users can manage account_daily_message_count in their workspace"
  ON account_daily_message_count
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = account_daily_message_count.instagram_account_id
        AND instagram_accounts.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM instagram_accounts
      WHERE instagram_accounts.id = account_daily_message_count.instagram_account_id
        AND instagram_accounts.workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
    )
  );

-- Ensure RLS is enabled on campaigns table (if not already)
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaigns' 
    AND policyname = 'Users can view campaigns in their workspace'
  ) THEN
    CREATE POLICY "Users can view campaigns in their workspace"
      ON campaigns
      FOR SELECT
      TO authenticated
      USING (
        workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can insert campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaigns' 
    AND policyname = 'Users can insert campaigns in their workspace'
  ) THEN
    CREATE POLICY "Users can insert campaigns in their workspace"
      ON campaigns
      FOR INSERT
      TO authenticated
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can update campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaigns' 
    AND policyname = 'Users can update campaigns in their workspace'
  ) THEN
    CREATE POLICY "Users can update campaigns in their workspace"
      ON campaigns
      FOR UPDATE
      TO authenticated
      USING (
        workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can delete campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaigns' 
    AND policyname = 'Users can delete campaigns in their workspace'
  ) THEN
    CREATE POLICY "Users can delete campaigns in their workspace"
      ON campaigns
      FOR DELETE
      TO authenticated
      USING (
        workspace_id IN (
          SELECT workspace_id FROM users
          WHERE supabase_auth_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Ensure RLS is enabled on campaign_recipients table (if not already)
ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see campaign_recipients for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_recipients' 
    AND policyname = 'Users can view campaign_recipients in their workspace'
  ) THEN
    CREATE POLICY "Users can view campaign_recipients in their workspace"
      ON campaign_recipients
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

-- Policy: Users can insert campaign_recipients for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_recipients' 
    AND policyname = 'Users can insert campaign_recipients in their workspace'
  ) THEN
    CREATE POLICY "Users can insert campaign_recipients in their workspace"
      ON campaign_recipients
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

-- Policy: Users can update campaign_recipients for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_recipients' 
    AND policyname = 'Users can update campaign_recipients in their workspace'
  ) THEN
    CREATE POLICY "Users can update campaign_recipients in their workspace"
      ON campaign_recipients
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_recipients.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

-- Ensure RLS is enabled on campaign_steps table (if not already)
ALTER TABLE campaign_steps ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see campaign_steps for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_steps' 
    AND policyname = 'Users can view campaign_steps in their workspace'
  ) THEN
    CREATE POLICY "Users can view campaign_steps in their workspace"
      ON campaign_steps
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_steps.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

-- Policy: Users can insert campaign_steps for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_steps' 
    AND policyname = 'Users can insert campaign_steps in their workspace'
  ) THEN
    CREATE POLICY "Users can insert campaign_steps in their workspace"
      ON campaign_steps
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_steps.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

-- Policy: Users can update campaign_steps for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_steps' 
    AND policyname = 'Users can update campaign_steps in their workspace'
  ) THEN
    CREATE POLICY "Users can update campaign_steps in their workspace"
      ON campaign_steps
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_steps.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_steps.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

-- Policy: Users can delete campaign_steps for campaigns in their workspace (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'campaign_steps' 
    AND policyname = 'Users can delete campaign_steps in their workspace'
  ) THEN
    CREATE POLICY "Users can delete campaign_steps in their workspace"
      ON campaign_steps
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM campaigns
          WHERE campaigns.id = campaign_steps.campaign_id
            AND campaigns.workspace_id IN (
              SELECT workspace_id FROM users
              WHERE supabase_auth_id = auth.uid()
            )
        )
      );
  END IF;
END $$;

