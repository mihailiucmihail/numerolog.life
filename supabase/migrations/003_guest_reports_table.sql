-- Guest Reports Table for unauthenticated users
-- Allows visitors to generate preview charts before registration

create table if not exists public.guest_reports (
  id uuid primary key default gen_random_uuid(),
  guest_token text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  
  -- Birth Data
  birth_name text,
  birth_date date not null,
  birth_time text,
  birth_city text,
  birth_country text,
  birth_latitude decimal(10, 7),
  birth_longitude decimal(10, 7),
  birth_timezone text,
  
  -- Chart Data
  natal_chart_data jsonb,
  preview_data jsonb,
  
  -- Astrological Signs
  sun_sign text,
  sun_degree decimal(10, 4),
  moon_sign text,
  moon_degree decimal(10, 4),
  ascendant_sign text,
  ascendant_degree decimal(10, 4),
  midheaven_sign text,
  midheaven_degree decimal(10, 4),
  
  -- Status
  status text default 'guest' check (status in ('guest', 'converted', 'expired')),
  data_source text default 'real_api' check (data_source in ('real_api', 'fallback', 'mock')),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

-- Enable RLS
alter table public.guest_reports enable row level security;

-- Create RLS policies
drop policy if exists "Anyone can view guest reports by token" on public.guest_reports;
drop policy if exists "Anyone can create guest reports" on public.guest_reports;
drop policy if exists "Authenticated users can view own guest reports" on public.guest_reports;
drop policy if exists "Authenticated users can update own guest reports" on public.guest_reports;

-- Allow anyone to view guest reports (not yet converted)
create policy "Anyone can view guest reports by token"
  on public.guest_reports for select
  using (status = 'guest');

-- Allow creation of new guest reports
create policy "Anyone can create guest reports"
  on public.guest_reports for insert
  with check (true);

-- Authenticated users can view reports linked to them
create policy "Authenticated users can view own converted reports"
  on public.guest_reports for select
  using (auth.uid() = user_id);

-- Authenticated users can update guest reports to link them
create policy "Authenticated users can update own reports"
  on public.guest_reports for update
  using (auth.uid() = user_id OR user_id IS NULL);

-- Create index on guest_token for fast lookups
create index if not exists idx_guest_reports_token on public.guest_reports(guest_token);

-- Create index on user_id for authenticated user lookups
create index if not exists idx_guest_reports_user_id on public.guest_reports(user_id);

-- Create index on status for expiration queries
create index if not exists idx_guest_reports_status on public.guest_reports(status);

-- Create index on expires_at for cleanup queries
create index if not exists idx_guest_reports_expires_at on public.guest_reports(expires_at);
