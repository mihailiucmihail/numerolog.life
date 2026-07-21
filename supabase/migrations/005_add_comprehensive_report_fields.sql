-- Add comprehensive interpretation and API response fields to guest_reports
-- Supports full report sections, AI interpretations, and astrologyapi data

ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS astrologyapi_response jsonb;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS romanian_report text;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS ai_interpretation_ro text;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS full_report_sections jsonb;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS debug_metadata jsonb;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS planetary_positions jsonb;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS houses jsonb;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS aspects jsonb;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS julian_day numeric;
ALTER TABLE public.guest_reports ADD COLUMN IF NOT EXISTS sidereal_time numeric;

-- Update data_source check constraint to include new sources
ALTER TABLE public.guest_reports DROP CONSTRAINT IF EXISTS guest_reports_data_source_check;
ALTER TABLE public.guest_reports ADD CONSTRAINT guest_reports_data_source_check CHECK (data_source in ('real_api', 'fallback', 'mock', 'complete_comprehensive_openai_interpretation', 'premium_comprehensive_openai_interpretation'));

-- Create index on astrologyapi_response for large JSON queries
CREATE INDEX IF NOT EXISTS idx_guest_reports_has_api_response ON public.guest_reports USING GIN (astrologyapi_response);

-- Create index on full_report_sections for report queries
CREATE INDEX IF NOT EXISTS idx_guest_reports_has_report_sections ON public.guest_reports USING GIN (full_report_sections);
