# Astrology App - Database Setup Guide

## Problem

The form submission fails with: **"Could not find the table 'public.guest_reports' in the schema cache"**

This means the database tables haven't been created yet.

## Solution

You need to apply the database migrations in Supabase. Here's how:

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the SQL below
6. Click **Run**

### SQL to Execute

```sql
-- ========================================
-- 1. Profiles Table (for authenticated users)
-- ========================================
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
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ========================================
-- 2. Guest Reports Table (for visitors)
-- ========================================
create table if not exists public.guest_reports (
  id uuid primary key default gen_random_uuid(),
  guest_token text unique not null,
  user_id uuid references auth.users(id) on delete cascade,
  
  birth_name text,
  birth_date date not null,
  birth_time text,
  birth_city text,
  birth_country text,
  birth_latitude decimal(10, 7),
  birth_longitude decimal(10, 7),
  birth_timezone text,
  
  natal_chart_data jsonb,
  preview_data jsonb,
  astrologyapi_response jsonb,
  romanian_report text,
  
  sun_sign text,
  sun_degree decimal(10, 4),
  moon_sign text,
  moon_degree decimal(10, 4),
  ascendant_sign text,
  ascendant_degree decimal(10, 4),
  midheaven_sign text,
  midheaven_degree decimal(10, 4),
  
  status text default 'guest' check (status in ('guest', 'converted', 'expired')),
  data_source text default 'real_api' check (data_source in ('real_api', 'fallback', 'mock')),
  
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '7 days')
);

alter table public.guest_reports enable row level security;

create policy "Anyone can view guest reports by token"
  on public.guest_reports for select
  using (status = 'guest');

create policy "Anyone can create guest reports"
  on public.guest_reports for insert
  with check (true);

create policy "Authenticated users can view own reports"
  on public.guest_reports for select
  using (auth.uid() = user_id);

create index if not exists idx_guest_reports_token on public.guest_reports(guest_token);
create index if not exists idx_guest_reports_user_id on public.guest_reports(user_id);
create index if not exists idx_guest_reports_status on public.guest_reports(status);
create index if not exists idx_guest_reports_expires_at on public.guest_reports(expires_at);

-- ========================================
-- 3. Natal Charts Table (for authenticated users)
-- ========================================
create table if not exists public.natal_charts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  first_name text,
  last_name text,
  birth_date date not null,
  birth_time text,
  birth_city text,
  birth_country text,
  birth_latitude decimal(10, 7),
  birth_longitude decimal(10, 7),
  birth_timezone text,
  
  planetary_positions jsonb,
  houses jsonb,
  aspects jsonb,
  julian_day decimal(15, 8),
  sidereal_time text,
  
  sun_sign text,
  sun_degree decimal(10, 4),
  moon_sign text,
  moon_degree decimal(10, 4),
  ascendant_sign text,
  ascendant_degree decimal(10, 4),
  midheaven_sign text,
  midheaven_degree decimal(10, 4),
  
  astrologyapi_response jsonb,
  romanian_report text,
  
  data_source text default 'real_api',
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.natal_charts enable row level security;

create policy "Users can view own charts"
  on public.natal_charts for select
  using (auth.uid() = user_id);

create policy "Users can create own charts"
  on public.natal_charts for insert
  with check (auth.uid() = user_id);

create index if not exists idx_natal_charts_user_id on public.natal_charts(user_id);
create index if not exists idx_natal_charts_birth_date on public.natal_charts(birth_date);
```

### After Running the SQL

1. Refresh the app in your browser
2. Try submitting the form again
3. The report should now generate successfully!

### Verify the Setup

To confirm the tables were created:

1. In Supabase Dashboard, go to **Table Editor**
2. You should see three new tables:
   - `public.profiles`
   - `public.guest_reports`
   - `public.natal_charts`

## Troubleshooting

**Q: I see "relation "public.guest_reports" already exists"**
A: The table already exists! This is fine. Proceed to test the form.

**Q: Still getting "table not found" error**
A: 
1. Make sure you ran the SQL query completely (no errors in the SQL editor)
2. Refresh your browser page completely (Ctrl+Shift+R or Cmd+Shift+R)
3. Restart the dev server

**Q: Which columns are required?**
A: Only `birth_date` is strictly required. All others can be NULL except for the primary keys.

## Need Help?

If migrations still fail:
1. Check the Supabase Status page (supabase.com/status)
2. Look at the SQL query results for specific errors
3. Try running the SQL line by line to find which statement fails
