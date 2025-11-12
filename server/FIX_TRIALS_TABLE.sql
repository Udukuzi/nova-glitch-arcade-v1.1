-- Fix missing trials table
-- Run this in Supabase SQL Editor if trials table is missing

create table if not exists trials (
  address text primary key references profiles(address) on delete cascade,
  plays_used integer default 0,
  last_play timestamptz default now(),
  created_at timestamptz default now()
);

-- Add index for faster lookups
create index if not exists idx_trials_address on trials(address);
create index if not exists idx_trials_last_play on trials(last_play);

-- Grant permissions (adjust as needed for RLS)
-- This is just for reference - actual permissions handled by RLS_GUIDANCE.sql

