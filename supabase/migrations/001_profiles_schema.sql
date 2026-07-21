-- Profiles table schema
-- Run this in Supabase SQL Editor

-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  full_name text,
  birth_date date,
  birth_time text,
  birth_city text,
  birth_country text,
  gender text,
  zodiac_sign text,
  sun_sign text,
  moon_sign text,
  ascendant text,
  life_path_number integer,
  destiny_number integer,
  soul_number integer,
  personality_number integer,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Create RLS policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_profiles_updated on public.profiles;
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Grant permissions
grant usage on schema public to anon, authenticated;
grant all on public.profiles to anon, authenticated;
