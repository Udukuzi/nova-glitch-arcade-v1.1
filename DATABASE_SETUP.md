# 🗄️ Database Setup - Nova Glitch Arcade

## ⚡ Quick Setup (5 Minutes)

### **Step 1: Get Supabase Credentials**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project (or create a new one)
3. Go to **Settings → API**
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: `eyJhbGci...` (long JWT token)

### **Step 2: Update Environment Variables**

Open `server/.env` and update:

```env
SUPABASE_URL=https://jhxgsznvbnseyakzcgxz.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=dev-local-secret-please-change
PORT=5178
```

⚠️ **Important:** Use the **Service Role Key**, not the anon key, for the SERVICE_ROLE_KEY field.

### **Step 3: Run Database Migrations**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor** (left sidebar)
3. Click **New Query**
4. Open `server/complete-migrations.sql` in a text editor
5. **Copy ALL contents** (Ctrl+A, Ctrl+C)
6. **Paste** into Supabase SQL Editor
7. Click **Run** (or press F5)

✅ You should see: "Success. No rows returned"

### **Step 4: Verify Database Setup**

Run the test script:

```powershell
cd server
node test-supabase.js
```

Expected output:
```
✅ Connection successful!
✅ Tables exist: profiles, trials, sessions, stakes, reward_claims
✅ Database is ready!
```

### **Step 5: Restart Backend**

```powershell
cd server
npm run dev
```

Expected output:
```
Nova Glitch Arcade server listening on 5178
```

---

## 📊 What Gets Created

### **Tables:**
1. **profiles** - User accounts and stats
2. **trials** - Free trial tracking
3. **sessions** - Game sessions and scores
4. **stakes** - Token staking records
5. **reward_claims** - Reward distribution

### **Views:**
- **leaderboard** - Easy leaderboard queries

### **Functions:**
- **get_game_leaderboard()** - Get top scores for a game
- **update_updated_at_column()** - Auto-update timestamps

### **Indexes:**
- Optimized for fast leaderboard queries
- Efficient score lookups
- Quick user data retrieval

### **Security:**
- Row Level Security (RLS) enabled
- Users can only modify their own data
- Public read access for leaderboards
- Private data protected

---

## 🧪 Testing the Database

### **Test 1: Check Tables Exist**

In Supabase Dashboard → Table Editor, you should see:
- ✅ profiles
- ✅ trials
- ✅ sessions
- ✅ stakes
- ✅ reward_claims

### **Test 2: Test API Endpoints**

```powershell
# Health check
curl http://localhost:5178/api/health

# Get leaderboard
curl http://localhost:5178/api/leaderboard/snake
```

### **Test 3: Play a Game**

1. Open the arcade: `http://localhost:5173`
2. Login (use trial or connect wallet)
3. Play a game (e.g., Snake)
4. Check Supabase → Table Editor → sessions
5. You should see your game session!

---

## 🔧 Troubleshooting

### **Error: "relation does not exist"**
**Fix:** Run the migrations again in Supabase SQL Editor

### **Error: "Invalid API key"**
**Fix:** 
1. Check `server/.env` has correct SUPABASE_URL
2. Verify SUPABASE_SERVICE_ROLE_KEY is the Service Role Key (not anon key)
3. Copy fresh keys from Supabase Dashboard → Settings → API

### **Error: "Failed to fetch"**
**Fix:**
1. Check if Supabase project is paused (free tier pauses after inactivity)
2. Go to Supabase Dashboard → check project status
3. If paused, click "Resume" and wait 1-2 minutes

### **Backend won't start**
**Fix:**
```powershell
cd server
npm install
npm run dev
```

### **No scores showing in leaderboard**
**Fix:**
1. Play a game first to create test data
2. Check Supabase → Table Editor → sessions
3. Verify sessions have `ended_at` timestamp (not NULL)

---

## 📝 Database Schema

### **profiles**
```sql
address TEXT PRIMARY KEY
username TEXT
plays_used INTEGER
staked_amount NUMERIC
tier TEXT (guest/holder/staker/whale)
xp INTEGER
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### **sessions**
```sql
id UUID PRIMARY KEY
address TEXT (references profiles)
game TEXT
started_at TIMESTAMPTZ
ended_at TIMESTAMPTZ
score INTEGER
multiplier NUMERIC
final_score INTEGER (computed: score * multiplier)
reward_claimed BOOLEAN
```

### **Leaderboard Query**
```sql
SELECT * FROM get_game_leaderboard('snake', 10);
```

Returns top 10 players for Snake game with:
- Rank
- Username
- Best score
- Number of plays
- Last played time

---

## ✅ Success Checklist

- [ ] Supabase project created/active
- [ ] Environment variables updated in `server/.env`
- [ ] Migrations run in Supabase SQL Editor
- [ ] All 5 tables exist in Table Editor
- [ ] Test script passes: `node test-supabase.js`
- [ ] Backend starts without errors
- [ ] Health check works: `http://localhost:5178/api/health`
- [ ] Can play a game and see score in database

---

## 🚀 What This Enables

✅ **Persistent Scores** - Scores saved across sessions  
✅ **Real Leaderboards** - Live rankings for all games  
✅ **User Profiles** - Track stats, XP, tier  
✅ **Trial Tracking** - Manage free trials  
✅ **Staking Records** - Token staking history  
✅ **Reward Claims** - Track reward distribution  

---

## 📞 Need Help?

If you encounter issues:

1. **Run the test script:**
   ```powershell
   cd server
   node test-supabase.js
   ```

2. **Check backend logs** in the PowerShell window

3. **Verify Supabase project** is active (not paused)

4. **Share error messages** for troubleshooting

---

**Estimated Setup Time:** 5-10 minutes  
**Difficulty:** Easy (copy-paste SQL)  
**Result:** Production-ready database! 🎉
