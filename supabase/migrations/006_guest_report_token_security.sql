-- ====== Guest Report Token Security Enhancement ======
-- This migration adds secure token hashing, expiration, and rate limiting support
-- for guest report access. Replaces insecure 'id' parameter with hashed tokens.

-- Add new columns to guest_reports table for secure token-based access
ALTER TABLE guest_reports
ADD COLUMN IF NOT EXISTS guest_token_hash VARCHAR(64) UNIQUE,
ADD COLUMN IF NOT EXISTS token_created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_access_count INTEGER DEFAULT 5;

-- Create index on guest_token_hash for fast lookups
CREATE INDEX IF NOT EXISTS idx_guest_reports_token_hash 
ON guest_reports(guest_token_hash) WHERE guest_token_hash IS NOT NULL;

-- Create index on token expiration for cleanup queries
CREATE INDEX IF NOT EXISTS idx_guest_reports_token_expires 
ON guest_reports(token_expires_at) WHERE token_expires_at IS NOT NULL;

-- Enable RLS policy: authenticated users can only access their own reports
ALTER TABLE guest_reports ENABLE ROW LEVEL SECURITY;

-- Drop any existing permissive policies and replace with secure ones
DROP POLICY IF EXISTS "guest_reports_select_policy" ON guest_reports;
DROP POLICY IF EXISTS "guest_reports_insert_policy" ON guest_reports;
DROP POLICY IF EXISTS "guest_reports_update_policy" ON guest_reports;
DROP POLICY IF EXISTS "guest_reports_delete_policy" ON guest_reports;

-- RLS Policy: Authenticated users can only view their own reports
CREATE POLICY "guest_reports_select_authenticated" ON guest_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Authenticated users can insert their own reports
CREATE POLICY "guest_reports_insert_authenticated" ON guest_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Authenticated users can update their own reports
CREATE POLICY "guest_reports_update_authenticated" ON guest_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Authenticated users can delete their own reports
CREATE POLICY "guest_reports_delete_authenticated" ON guest_reports
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON guest_reports TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
