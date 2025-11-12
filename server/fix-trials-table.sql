-- Fix for trials table error
-- Run this in Supabase SQL Editor

-- First, check if profiles table exists and has address column
-- If not, create it properly

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  address TEXT PRIMARY KEY,
  username TEXT,
  plays_used INTEGER DEFAULT 0,
  staked_amount NUMERIC DEFAULT 0,
  tier TEXT CHECK (tier IN ('guest','holder','staker','whale')) DEFAULT 'guest',
  xp INTEGER DEFAULT 0,
  nonce TEXT,
  nonce_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Now create trials table (without foreign key constraint for now)
DROP TABLE IF EXISTS trials CASCADE;

CREATE TABLE trials (
  address TEXT PRIMARY KEY,
  plays_used INTEGER DEFAULT 0,
  last_play TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own trials" ON trials;
DROP POLICY IF EXISTS "Users can insert own trials" ON trials;
DROP POLICY IF EXISTS "Users can update own trials" ON trials;

-- Add policies
CREATE POLICY "Users can view own trials" 
  ON trials FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own trials" 
  ON trials FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update own trials" 
  ON trials FOR UPDATE 
  USING (true);

-- Verify tables exist
SELECT 'profiles' as table_name, COUNT(*) as row_count FROM profiles
UNION ALL
SELECT 'trials' as table_name, COUNT(*) as row_count FROM trials;
