-- Add API response and Romanian report columns to both tables
-- For storing raw AstrologyAPI response and generated Romanian interpretation

-- Add to guest_reports table
alter table public.guest_reports
add column if not exists astrologyapi_response jsonb,
add column if not exists romanian_report text;

-- Add to natal_charts table
alter table public.natal_charts
add column if not exists astrologyapi_response jsonb,
add column if not exists romanian_report text;

-- Create indexes for faster lookups
create index if not exists idx_guest_reports_with_data on public.guest_reports(id) 
where astrologyapi_response is not null;

create index if not exists idx_natal_charts_with_data on public.natal_charts(id) 
where astrologyapi_response is not null;

