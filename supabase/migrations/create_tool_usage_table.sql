-- Create tool_usage table for tracking tool submissions
CREATE TABLE IF NOT EXISTS tool_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tool_type TEXT NOT NULL,
  insta_id TEXT,
  niche TEXT,
  form_data JSONB,
  ip_address TEXT,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool_type ON tool_usage(tool_type);
CREATE INDEX IF NOT EXISTS idx_tool_usage_created_at ON tool_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tool_usage_insta_id ON tool_usage(insta_id) WHERE insta_id IS NOT NULL;

-- Enable Row Level Security (RLS)
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for public tool usage tracking)
CREATE POLICY "Allow public inserts" ON tool_usage
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy: Allow public select (adjust based on your needs)
CREATE POLICY "Allow public select" ON tool_usage
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to read all records
CREATE POLICY "Allow authenticated reads" ON tool_usage
  FOR SELECT
  TO authenticated
  USING (true);

-- Optional: Add comment to table
COMMENT ON TABLE tool_usage IS 'Tracks usage of various Instagram tools on the website';
