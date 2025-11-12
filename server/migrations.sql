-- Nova Glitch Arcade v1.1 recommended schema

create extension if not exists pgcrypto;

-- profiles
create table if not exists profiles (
  address text primary key,
  username text,
  plays_used integer default 0,
  staked_amount numeric default 0,
  tier text check (tier in ('guest','holder','staker','whale')) default 'guest',
  xp integer default 0,
  nonce text,
  nonce_expires timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- trials table (optional indexing)
create table if not exists trials (
  address text primary key references profiles(address),
  plays_used integer default 0,
  last_play timestamptz default now()
);

-- sessions
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  address text references profiles(address),
  game text,
  started_at timestamptz default now(),
  ended_at timestamptz,
  score integer default 0,
  reward_claimed boolean default false
);

-- stakes
create table if not exists stakes (
  id uuid primary key default gen_random_uuid(),
  address text references profiles(address),
  amount numeric,
  tx_hash text,
  chain text check (chain in ('solana','bsc')),
  created_at timestamptz default now()
);

-- reward claims
create table if not exists reward_claims (
  id uuid primary key default gen_random_uuid(),
  address text references profiles(address),
  session_id uuid references sessions(id),
  reward_amount numeric,
  tx_hash text,
  chain text,
  created_at timestamptz default now()
);
