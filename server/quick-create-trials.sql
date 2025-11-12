create table if not exists public.trials (
  address text primary key references public.profiles(address) on delete cascade,
  plays_used integer default 0,
  last_play timestamptz default now(),
  created_at timestamptz default now()
);

create index if not exists idx_trials_address on public.trials(address);
create index if not exists idx_trials_last_play on public.trials(last_play);
