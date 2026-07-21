-- Complete database schema for AstroAI
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. NATAL CHARTS TABLE
-- ============================================
create table if not exists public.natal_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  first_name text,
  last_name text,
  birth_date date not null,
  birth_time text,
  birth_city text,
  birth_country text,
  birth_latitude decimal(10, 7),
  birth_longitude decimal(10, 7),
  birth_timezone text,
  
  sun_sign text,
  sun_degree decimal(10, 4),
  moon_sign text,
  moon_degree decimal(10, 4),
  ascendant_sign text,
  ascendant_degree decimal(10, 4),
  midheaven_sign text,
  midheaven_degree decimal(10, 4),
  
  planetary_positions jsonb,
  houses jsonb,
  aspects jsonb,
  
  julian_day decimal(15, 6),
  sidereal_time decimal(15, 6),
  
  data_source text default 'real_api' check (data_source in ('real_api', 'fallback', 'mock')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.natal_charts enable row level security;

-- Create RLS policies
drop policy if exists "Users can view own natal chart" on public.natal_charts;
drop policy if exists "Users can insert own natal chart" on public.natal_charts;
drop policy if exists "Users can update own natal chart" on public.natal_charts;

create policy "Users can view own natal chart"
  on public.natal_charts for select
  using (auth.uid() = user_id);

create policy "Users can insert own natal chart"
  on public.natal_charts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own natal chart"
  on public.natal_charts for update
  using (auth.uid() = user_id);

-- ============================================
-- 2. NUMEROLOGY PROFILES TABLE
-- ============================================
create table if not exists public.numerology_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  full_name text,
  birth_date date,
  
  life_path_number integer,
  destiny_number integer,
  soul_number integer,
  personality_number integer,
  maturity_number integer,
  
  is_master_life_path boolean default false,
  is_master_destiny boolean default false,
  
  personal_year integer,
  personal_month integer,
  
  pinnacle_numbers jsonb,
  challenge_numbers jsonb,
  karmic_lessons jsonb,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.numerology_profiles enable row level security;

-- Create RLS policies
drop policy if exists "Users can view own numerology" on public.numerology_profiles;
drop policy if exists "Users can insert own numerology" on public.numerology_profiles;
drop policy if exists "Users can update own numerology" on public.numerology_profiles;

create policy "Users can view own numerology"
  on public.numerology_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own numerology"
  on public.numerology_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own numerology"
  on public.numerology_profiles for update
  using (auth.uid() = user_id);

-- ============================================
-- 3. DESTINY ANALYSES TABLE
-- ============================================
create table if not exists public.destiny_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  full_name text,
  birth_date date,
  birth_time text,
  birth_city text,
  
  life_path_number integer,
  destiny_number integer,
  soul_number integer,
  personality_number integer,
  
  analysis_data jsonb,
  
  created_at timestamptz default now()
);

-- Create index for faster lookups
create index if not exists idx_destiny_analyses_user_id on public.destiny_analyses(user_id);

-- Enable RLS
alter table public.destiny_analyses enable row level security;

-- Create RLS policies
drop policy if exists "Users can view own destiny analyses" on public.destiny_analyses;
drop policy if exists "Users can insert own destiny analyses" on public.destiny_analyses;

create policy "Users can view own destiny analyses"
  on public.destiny_analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own destiny analyses"
  on public.destiny_analyses for insert
  with check (auth.uid() = user_id);

-- ============================================
-- 4. HOROSCOPES TABLE
-- ============================================
create table if not exists public.horoscopes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  horoscope_type text, -- 'daily', 'weekly', 'monthly', 'yearly'
  zodiac_sign text,
  period_start date,
  period_end date,
  
  content jsonb,
  
  created_at timestamptz default now()
);

-- Create indexes
create index if not exists idx_horoscopes_user_id on public.horoscopes(user_id);
create index if not exists idx_horoscopes_type on public.horoscopes(horoscope_type);

-- Enable RLS
alter table public.horoscopes enable row level security;

-- Create RLS policies
drop policy if exists "Users can view own horoscopes" on public.horoscopes;
drop policy if exists "Users can insert own horoscopes" on public.horoscopes;

create policy "Users can view own horoscopes"
  on public.horoscopes for select
  using (auth.uid() = user_id);

create policy "Users can insert own horoscopes"
  on public.horoscopes for insert
  with check (auth.uid() = user_id);

-- ============================================
-- 5. COMPATIBILITY CHECKS TABLE
-- ============================================
create table if not exists public.compatibility_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  
  person1_name text,
  person1_birth_date date,
  person2_name text,
  person2_birth_date date,
  
  compatibility_score integer,
  compatibility_data jsonb,
  
  created_at timestamptz default now()
);

-- Create index
create index if not exists idx_compatibility_user_id on public.compatibility_checks(user_id);

-- Enable RLS
alter table public.compatibility_checks enable row level security;

-- Create RLS policies
drop policy if exists "Users can view own compatibility" on public.compatibility_checks;
drop policy if exists "Users can insert own compatibility" on public.compatibility_checks;

create policy "Users can view own compatibility"
  on public.compatibility_checks for select
  using (auth.uid() = user_id);

create policy "Users can insert own compatibility"
  on public.compatibility_checks for insert
  with check (auth.uid() = user_id);

-- ============================================
-- 6. UPDATE TRIGGERS
-- ============================================
drop trigger if exists on_natal_charts_updated on public.natal_charts;
create trigger on_natal_charts_updated
  before update on public.natal_charts
  for each row execute function public.handle_updated_at();

drop trigger if exists on_numerology_profiles_updated on public.numerology_profiles;
create trigger on_numerology_profiles_updated
  before update on public.numerology_profiles
  for each row execute function public.handle_updated_at();

-- ============================================
-- 7. GRANT PERMISSIONS
-- ============================================
grant all on public.natal_charts to anon, authenticated;
grant all on public.numerology_profiles to anon, authenticated;
grant all on public.destiny_analyses to anon, authenticated;
grant all on public.horoscopes to anon, authenticated;
grant all on public.compatibility_checks to anon, authenticated;
