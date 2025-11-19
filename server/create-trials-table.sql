-- Create trials table - RUN THIS IN SUPABASE SQL EDITOR
-- Copy all lines below and paste in Supabase Dashboard → SQL Editor → Run

create table if not exists public.trials (
  address text primary key references public.profiles(address) on delete cascade,
  plays_used integer default 0,
  last_play timestamptz default now(),
  created_at timestamptz default now()
);

-- Add indexes for better performance
create index if not exists idx_trials_address on public.trials(address);
create index if not exists idx_trials_last_play on public.trials(last_play);

-- Grant permissions (if RLS is enabled)
alter table public.trials enable row level security;

-- Policy: Users can only see their own trial data
create policy "Users can view own trials" on public.trials
  for select using (auth.uid()::text = address);

-- Policy: Users can insert their own trial data  
create policy "Users can insert own trials" on public.trials
  for insert with check (auth.uid()::text = address);

-- Policy: Users can update their own trial data
create policy "Users can update own trials" on public.trials
  for update using (auth.uid()::text = address);

