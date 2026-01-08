-- Campaign Redesign Migration
-- Adds step_variants table, converts delay_minutes to delay_days, adds next_action_at support

-- 1. Create step_variants table
CREATE TABLE IF NOT EXISTS step_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  step_id UUID NOT NULL REFERENCES campaign_steps(id) ON DELETE CASCADE,
  message_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_step_variants_step_id ON step_variants(step_id);

-- 2. Add delay_days column to campaign_steps (keep delay_minutes for migration)
ALTER TABLE campaign_steps 
  ADD COLUMN IF NOT EXISTS delay_days INTEGER DEFAULT 0;

-- 3. Migrate delay_minutes to delay_days (convert minutes to days, rounding up)
UPDATE campaign_steps 
SET delay_days = CEIL(delay_minutes::FLOAT / 1440.0)::INTEGER
WHERE delay_days = 0 AND delay_minutes > 0;

-- 4. Add next_action_at column to campaign_recipients (keep next_process_at for backward compatibility)
ALTER TABLE campaign_recipients 
  ADD COLUMN IF NOT EXISTS next_action_at TIMESTAMP WITH TIME ZONE;

-- 5. Copy data from next_process_at to next_action_at for existing records
UPDATE campaign_recipients 
SET next_action_at = next_process_at 
WHERE next_action_at IS NULL AND next_process_at IS NOT NULL;

-- 6. Create index on next_action_at
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_next_action_at ON campaign_recipients(next_action_at);

-- 7. Migrate existing variant data from condition JSON to step_variants table
-- This will extract variants from the condition JSON field and create step_variant records
DO $$
DECLARE
  step_record RECORD;
  variant_data JSONB;
  variant_item JSONB;
BEGIN
  FOR step_record IN 
    SELECT id, condition 
    FROM campaign_steps 
    WHERE condition IS NOT NULL 
      AND condition::text != 'null'
      AND condition::jsonb ? 'variants'
  LOOP
    variant_data := step_record.condition::jsonb->'variants';
    
    IF variant_data IS NOT NULL AND jsonb_typeof(variant_data) = 'array' THEN
      FOR variant_item IN SELECT * FROM jsonb_array_elements(variant_data)
      LOOP
        INSERT INTO step_variants (step_id, message_template)
        VALUES (
          step_record.id,
          variant_item->>'template'
        )
        ON CONFLICT DO NOTHING;
      END LOOP;
    END IF;
  END LOOP;
END $$;