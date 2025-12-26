-- Create ebook_leads table for tracking eBook downloads
CREATE TABLE IF NOT EXISTS ebook_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  instagram_username TEXT,
  ebook_name TEXT NOT NULL,
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes for faster queries
  CONSTRAINT email_or_username CHECK (email IS NOT NULL OR instagram_username IS NOT NULL)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ebook_leads_email ON ebook_leads(email);
CREATE INDEX IF NOT EXISTS idx_ebook_leads_instagram_username ON ebook_leads(instagram_username);
CREATE INDEX IF NOT EXISTS idx_ebook_leads_ebook_name ON ebook_leads(ebook_name);
CREATE INDEX IF NOT EXISTS idx_ebook_leads_downloaded_at ON ebook_leads(downloaded_at);

-- Add RLS (Row Level Security) policies
ALTER TABLE ebook_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow inserts from anyone (for lead capture)
CREATE POLICY "Allow public inserts" ON ebook_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Only authenticated users can read (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON ebook_leads
  FOR SELECT
  TO authenticated
  USING (true);

