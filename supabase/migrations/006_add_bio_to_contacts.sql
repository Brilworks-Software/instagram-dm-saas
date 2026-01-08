-- Add bio field to contacts table
-- This allows storing Instagram bio information for contacts

ALTER TABLE contacts 
  ADD COLUMN IF NOT EXISTS bio TEXT;

