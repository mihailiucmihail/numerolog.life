-- ====== Guest Reports RLS Hardening ======
-- Fixes two issues left by earlier migrations:
--   1. The legacy `guest_token NOT NULL UNIQUE` column blocks inserts that only
--      populate `guest_token_hash`. We make it nullable and drop the legacy
--      unique index. The plaintext token is never stored anymore.
--   2. Migration 005 dropped policies by names that never existed (the real
--      permissive policies came from 003), so the insecure
--      "status = 'guest'" SELECT policy was still active. We drop the actual
--      legacy policies here.
--
-- Security model: guest rows are written/read exclusively by the server using
-- the service-role client, authorized by a SHA-256-hashed random token. RLS is
-- kept restrictive so the anon/authenticated keys can only ever see a user's
-- own converted reports.

-- 1. Make legacy plaintext token column optional and remove its constraints.
ALTER TABLE public.guest_reports
  ALTER COLUMN guest_token DROP NOT NULL;

DROP INDEX IF EXISTS idx_guest_reports_token;

-- 2. Drop the real legacy policies created in migration 003.
DROP POLICY IF EXISTS "Anyone can view guest reports by token" ON public.guest_reports;
DROP POLICY IF EXISTS "Anyone can create guest reports" ON public.guest_reports;
DROP POLICY IF EXISTS "Authenticated users can view own converted reports" ON public.guest_reports;
DROP POLICY IF EXISTS "Authenticated users can update own reports" ON public.guest_reports;

-- 3. Ensure RLS is enabled.
ALTER TABLE public.guest_reports ENABLE ROW LEVEL SECURITY;

-- 4. Re-assert the restrictive authenticated-only policies (idempotent).
DROP POLICY IF EXISTS "guest_reports_select_authenticated" ON public.guest_reports;
DROP POLICY IF EXISTS "guest_reports_insert_authenticated" ON public.guest_reports;
DROP POLICY IF EXISTS "guest_reports_update_authenticated" ON public.guest_reports;
DROP POLICY IF EXISTS "guest_reports_delete_authenticated" ON public.guest_reports;

CREATE POLICY "guest_reports_select_authenticated" ON public.guest_reports
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "guest_reports_insert_authenticated" ON public.guest_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guest_reports_update_authenticated" ON public.guest_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "guest_reports_delete_authenticated" ON public.guest_reports
  FOR DELETE
  USING (auth.uid() = user_id);
