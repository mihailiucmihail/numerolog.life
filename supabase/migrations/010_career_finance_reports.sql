-- Career & Finance Reports Table
-- Comprehensive astrological analysis for professional and financial growth

create table if not exists public.career_finance_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_token text unique,
  
  -- Birth Data
  birth_date date not null,
  birth_time text not null,
  birth_city text not null,
  birth_country text not null,
  birth_latitude decimal(10, 7),
  birth_longitude decimal(10, 7),
  
  -- Core Astrological Placements
  sun_sign text not null,
  sun_degree decimal(10, 4) not null,
  moon_sign text not null,
  moon_degree decimal(10, 4) not null,
  ascendant text not null,
  ascendant_degree decimal(10, 4) not null,
  midheaven text not null,
  
  -- 8 Career & Finance Scores (0-100)
  score_career_potential int check (score_career_potential >= 0 and score_career_potential <= 100),
  score_financial_potential int check (score_financial_potential >= 0 and score_financial_potential <= 100),
  score_entrepreneurship int check (score_entrepreneurship >= 0 and score_entrepreneurship <= 100),
  score_leadership int check (score_leadership >= 0 and score_leadership <= 100),
  score_communication int check (score_communication >= 0 and score_communication <= 100),
  score_stability int check (score_stability >= 0 and score_stability <= 100),
  score_intuition int check (score_intuition >= 0 and score_intuition <= 100),
  score_success int check (score_success >= 0 and score_success <= 100),
  
  -- Full Chart Data
  natal_chart_data jsonb,
  
  -- Report Content (~20-25 sections in markdown)
  report_sections jsonb,
  
  -- Career Fields (3-5 recommended)
  recommended_fields text[],
  
  -- Work Style Profile
  work_environment text,
  preferred_role text,
  team_vs_solo text,
  
  -- Financial Profile
  risk_tolerance text check (risk_tolerance in ('conservative', 'moderate', 'aggressive')),
  wealth_building_style text,
  investment_approach text,
  
  -- 12-Month Timeline with transits
  monthly_timeline jsonb,
  
  -- Action Plans (30/180/365 days)
  action_plan_month1 text[],
  action_plan_6months text[],
  action_plan_yearly text[],
  
  -- Status & Access
  status text default 'active' check (status in ('active', 'archived', 'expired')),
  data_source text default 'real_api' check (data_source in ('real_api', 'fallback')),
  
  -- Metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '30 days'),
  generation_time_ms int
);

-- Enable RLS
alter table public.career_finance_reports enable row level security;

-- Drop existing policies if any
drop policy if exists "Users can view own career reports" on public.career_finance_reports;
drop policy if exists "Users can create career reports" on public.career_finance_reports;
drop policy if exists "Users can update own career reports" on public.career_finance_reports;
drop policy if exists "Anyone can view guest career reports" on public.career_finance_reports;
drop policy if exists "Anyone can create guest career reports" on public.career_finance_reports;

-- RLS Policies
-- 1. Authenticated users can view their own reports
create policy "Users can view own career reports"
  on public.career_finance_reports for select
  using (auth.uid() = user_id);

-- 2. Authenticated users can create reports
create policy "Users can create career reports"
  on public.career_finance_reports for insert
  with check (auth.uid() = user_id);

-- 3. Authenticated users can update their own reports
create policy "Users can update own career reports"
  on public.career_finance_reports for update
  using (auth.uid() = user_id);

-- 4. Anyone can view guest reports (public link via token)
create policy "Anyone can view guest career reports"
  on public.career_finance_reports for select
  using (guest_token is not null and user_id is null);

-- 5. Anyone can create guest reports
create policy "Anyone can create guest career reports"
  on public.career_finance_reports for insert
  with check (user_id is null and guest_token is not null);

-- Indexes for performance
create index if not exists idx_career_reports_user_id on public.career_finance_reports(user_id);
create index if not exists idx_career_reports_guest_token on public.career_finance_reports(guest_token);
create index if not exists idx_career_reports_status on public.career_finance_reports(status);
create index if not exists idx_career_reports_expires_at on public.career_finance_reports(expires_at);
create index if not exists idx_career_reports_created_at on public.career_finance_reports(created_at desc);
