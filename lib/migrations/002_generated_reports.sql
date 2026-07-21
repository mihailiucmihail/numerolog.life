-- Migration: Add generated_reports table for storing completed reports

create table if not exists public.generated_reports (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  guest_token text unique,
  input_snapshot jsonb not null,
  report_json jsonb not null,
  generation_model text not null default 'claude-3-5-sonnet-20241022',
  status text not null default 'completed' check (status in ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.generated_reports enable row level security;

-- RLS Policies
drop policy if exists "Users read own reports" on public.generated_reports;
create policy "Users read own reports"
on public.generated_reports for select
using (auth.uid() = user_id or guest_token is not null);

drop policy if exists "Users insert own reports" on public.generated_reports;
create policy "Users insert own reports"
on public.generated_reports for insert
with check (auth.uid() = user_id or guest_token is not null);

-- Indexes
create index if not exists idx_generated_reports_user on public.generated_reports(user_id);
create index if not exists idx_generated_reports_status on public.generated_reports(status);
create index if not exists idx_generated_reports_created on public.generated_reports(created_at desc);
create index if not exists idx_generated_reports_guest_token on public.generated_reports(guest_token);
