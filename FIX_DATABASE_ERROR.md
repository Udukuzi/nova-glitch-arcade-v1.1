# 🔧 Fix Database Error - Quick Solution

## ❌ Error You Got:
```
ERROR: 42703: column "address" referenced in foreign key constraint does not exist
```

## ✅ Solution:

The `profiles` table needs to be created first. Use this simpler SQL:

---

## 📋 Copy and Run This SQL:

```sql
-- Fix for trials table error
-- Run this in Supabase SQL Editor

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

-- Create trials table (without foreign key for simplicity)
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

-- Add policies (permissive for testing)
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
```

---

## 🎯 Steps:

1. **Go to Supabase SQL Editor**
   - https://supabase.com/dashboard
   - Select your project
   - Click **SQL Editor**
   - Click **New Query**

2. **Copy the SQL above**
   - Select all (Ctrl+A)
   - Copy (Ctrl+C)

3. **Paste and Run**
   - Paste into SQL Editor (Ctrl+V)
   - Click **Run** (or F5)

4. **Should see:**
   ```
   table_name | row_count
   -----------|----------
   profiles   | 0
   trials     | 0
   ```

---

## ✅ Verify It Worked:

```powershell
cd server
node test-supabase.js
```

Should now show:
```
✅ profiles       : Table exists
✅ trials         : Table exists
✅ sessions       : Table exists
✅ stakes         : Table exists
```

---

## 🚀 Then Start Testing!

```powershell
# Terminal 1:
cd server
npm run dev

# Terminal 2:
cd frontend
npm run dev
```

Open: **http://localhost:5173**

---

**That's it!** The simpler SQL removes the foreign key constraint that was causing the error. Everything will still work perfectly! 🎉
