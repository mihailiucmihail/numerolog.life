-- Clean up old fallback/mock reports from natal_charts table
-- This removes records that were cached/fallback data, not real API data

-- Step 1: Remove records with source = FALLBACK
DELETE FROM natal_charts 
WHERE source = 'FALLBACK' 
   OR data_source = 'FALLBACK'
   OR source = 'MOCK'
   OR data_source = 'MOCK';

-- Step 2: Remove records with missing critical real API fields
DELETE FROM natal_charts 
WHERE raw_api_response IS NULL 
   AND (provider IS NULL OR provider = '');

-- Step 3: Update any remaining old records to have REAL_API markers if they have valid data
UPDATE natal_charts
SET 
  raw_api_response = raw_api_response,
  provider = COALESCE(provider, 'AstrologyAPI'),
  updated_at = NOW()
WHERE raw_api_response IS NOT NULL 
  AND provider IS NULL;

-- Step 4: Verify clean status
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN raw_api_response IS NOT NULL THEN 1 END) as with_api_response,
  COUNT(CASE WHEN provider = 'AstrologyAPI' THEN 1 END) as with_provider,
  COUNT(CASE WHEN source = 'FALLBACK' OR data_source = 'FALLBACK' THEN 1 END) as remaining_fallback
FROM natal_charts;
