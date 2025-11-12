# 🔧 Supabase Setup Guide - Fix Backend Once and For All

## 📋 What I Need From You

To fix the backend permanently, I need to verify these Supabase details:

### Required Information:

1. **Supabase Project URL**
   - Format: `https://xxxxxxxxxxxxx.supabase.co`
   - Location: Supabase Dashboard → Settings → API → Project URL
   - ✅ Currently in `.env`: `https://jhxgsznvbnseyakzcgxz.supabase.co`

2. **Supabase Service Role Key**
   - Format: Long JWT token starting with `eyJ...`
   - Location: Supabase Dashboard → Settings → API → Service Role Key
   - ⚠️ **IMPORTANT**: This is different from the anon key
   - ✅ Currently in `.env`: `eyJhbGci...` (need to verify it's correct)

3. **Database Migrations Status**
   - Have you run the SQL migrations in Supabase?
   - Location: Supabase Dashboard → SQL Editor
   - Files to run: `server/migrations.sql` and `server/RLS_GUIDANCE.sql`

---

## 🧪 Quick Test

I've created a test script to check everything. Run this:

```bash
cd server
node test-supabase.js
```

This will tell us:
- ✅ If credentials are correct
- ✅ If database tables exist
- ✅ If migrations are needed
- ❌ What errors exist

---

## 🔍 What Could Be Wrong

### Issue 1: Wrong/Expired Keys
**Symptoms**: 
- Backend crashes on startup
- Error: "Invalid API key" or "Failed to fetch"

**Fix**:
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy the **Service Role Key** (not anon key!)
5. Update `server/.env`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_new_key_here
   ```

### Issue 2: Database Tables Don't Exist
**Symptoms**:
- Backend starts but errors on API calls
- Error: "relation does not exist"

**Fix**:
1. Go to Supabase Dashboard → SQL Editor
2. Open `server/migrations.sql`
3. Copy ALL contents
4. Paste in SQL Editor
5. Click "Run" or press F5
6. Repeat for `server/RLS_GUIDANCE.sql`

### Issue 3: Missing Environment Variables
**Symptoms**:
- Backend won't start
- Error: "supabaseUrl is required"

**Fix**:
Ensure `server/.env` has ALL these variables:
```env
SUPABASE_URL=https://jhxgsznvbnseyakzcgxz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
SUPABASE_ANON_KEY=eyJhbGci...
JWT_SECRET=8a28498d306d982ab2de283088e769d1960e4196eff508d8ae8a34af7c57bddf
PORT=5178
```

---

## 📝 Step-by-Step Verification

### Step 1: Test Connection
```bash
cd server
node test-supabase.js
```

### Step 2: Check Backend Logs
Look at the PowerShell window where backend is running:
- ✅ Good: "Nova Glitch Arcade server listening on 5178"
- ❌ Bad: Any error messages

### Step 3: Verify Database
1. Go to Supabase Dashboard
2. Table Editor → Check if these tables exist:
   - ✅ `profiles`
   - ✅ `trials`
   - ✅ `sessions`
   - ✅ `stakes`

If any are missing → Run migrations!

---

## 🚀 Complete Fix Procedure

### Option A: Test Script (Recommended)
```bash
cd server
node test-supabase.js
```
This will tell you exactly what's wrong and how to fix it.

### Option B: Manual Check
1. **Verify .env file**:
   - Open `server/.env`
   - Confirm all variables are present
   - No typos in URLs/keys

2. **Test Supabase connection**:
   - Go to https://supabase.com/dashboard
   - Check if project is active
   - Verify API keys match `.env` file

3. **Run migrations**:
   - Open `server/migrations.sql`
   - Copy to Supabase SQL Editor
   - Run it
   - Repeat for `server/RLS_GUIDANCE.sql`

4. **Restart backend**:
   ```bash
   cd server
   npm run dev
   ```

---

## ✅ Success Indicators

When everything is fixed, you'll see:

1. **Backend starts without errors**:
   ```
   Nova Glitch Arcade server listening on 5178
   ```

2. **Health check works**:
   ```bash
   curl http://localhost:5178/api/health
   ```
   Returns: `{"ok":true,"now":1234567890}`

3. **Test script passes**:
   ```
   ✅ Connection successful!
   ✅ Table exists (profiles, trials, sessions, stakes)
   ```

---

## 🆘 Still Not Working?

If after following these steps the backend still fails:

1. **Share the error message** from the backend PowerShell window
2. **Run the test script** and share the output:
   ```bash
   cd server
   node test-supabase.js
   ```
3. **Check Supabase project status** - is it paused? (free tier pauses after inactivity)

---

## 📞 Quick Checklist

- [ ] `.env` file exists in `server/` folder
- [ ] `SUPABASE_URL` is correct (ends with `.supabase.co`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is correct (long JWT token)
- [ ] Database migrations have been run in Supabase SQL Editor
- [ ] All 4 tables exist: profiles, trials, sessions, stakes
- [ ] Backend PowerShell window shows "listening on 5178"
- [ ] Health check endpoint responds: `http://localhost:5178/api/health`

Once all checked ✅, backend should work!

