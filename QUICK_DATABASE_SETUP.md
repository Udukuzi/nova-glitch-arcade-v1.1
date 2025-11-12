# ⚡ Quick Database Setup (5 Minutes)

## 🎯 Current Status

✅ **Database Connection:** Working  
✅ **Tables Exist:** profiles, sessions, stakes  
⚠️ **Missing:** trials table  
⚠️ **Missing:** Service Role Key (optional but recommended)

---

## 🚀 Option 1: Quick Fix (2 Minutes) - RECOMMENDED

Just add the missing `trials` table:

### **Step 1: Go to Supabase**
1. Open: https://supabase.com/dashboard
2. Select your project: `jhxgsznvbnseyakzcgxz`
3. Click **SQL Editor** (left sidebar)

### **Step 2: Run This SQL**
Copy and paste this into SQL Editor, then click **Run**:

```sql
-- Create trials table
CREATE TABLE IF NOT EXISTS trials (
  address TEXT PRIMARY KEY REFERENCES profiles(address) ON DELETE CASCADE,
  plays_used INTEGER DEFAULT 0,
  last_play TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can view own trials" 
  ON trials FOR SELECT 
  USING (auth.uid()::text = address);

CREATE POLICY "Users can insert own trials" 
  ON trials FOR INSERT 
  WITH CHECK (auth.uid()::text = address);

CREATE POLICY "Users can update own trials" 
  ON trials FOR UPDATE 
  USING (auth.uid()::text = address);
```

### **Step 3: Done!**
✅ Database is ready for testing!

---

## 🔧 Option 2: Complete Setup (10 Minutes) - BEST

Run the full migration for all features:

### **Step 1: Get Service Role Key**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. **Settings → API**
4. Copy the **Service Role Key** (long JWT token starting with `eyJ...`)

### **Step 2: Update .env**
Open `server/.env` and add the key:

```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_key_here
```

### **Step 3: Run Complete Migrations**
1. Open **SQL Editor** in Supabase Dashboard
2. Open `server/complete-migrations.sql` in a text editor
3. Copy **ALL contents** (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click **Run** (F5)

### **Step 4: Verify**
```powershell
cd server
node test-supabase.js
```

Expected output:
```
✅ profiles       : Table exists
✅ trials         : Table exists
✅ sessions       : Table exists
✅ stakes         : Table exists
✅ reward_claims  : Table exists
✅ Connection successful!
```

---

## 🎮 What You Get

### **Option 1 (Quick Fix):**
✅ Free trial tracking works  
✅ Scores persist  
✅ Basic leaderboards  

### **Option 2 (Complete Setup):**
✅ Everything from Option 1  
✅ Advanced leaderboard functions  
✅ Reward claims tracking  
✅ Optimized indexes  
✅ Computed final scores (with multipliers)  
✅ Production-ready security  

---

## 🧪 Test After Setup

### **1. Test Backend:**
```powershell
cd server
npm run dev
```

Should see: `Nova Glitch Arcade server listening on 5178`

### **2. Test Game:**
1. Open: http://localhost:5173
2. Play a game (Snake, Flappy Nova, etc.)
3. Check score appears in leaderboard

### **3. Verify Database:**
Go to Supabase → **Table Editor** → **sessions**  
You should see your game session!

---

## 💡 My Recommendation

**For quick testing:** Use **Option 1** (2 minutes)  
**For production:** Use **Option 2** (10 minutes)

Since you want to test soon, I recommend:
1. Do **Option 1 now** (quick fix)
2. Test with users
3. Do **Option 2 later** (before production)

---

## ✅ Next Steps After Database Setup

Once database is ready:

1. ✅ **Test locally** - Play games, check scores
2. ✅ **Invite testers** - Share the arcade
3. ✅ **Collect feedback** - See what works
4. 🚀 **Implement remaining features** based on feedback:
   - Real wallet integration
   - Token gating
   - Enhanced leaderboards
   - Deployment

---

**Which option do you want to use?**
- **Option 1:** Quick fix (just trials table) - 2 minutes
- **Option 2:** Complete setup (all features) - 10 minutes

Let me know and I'll guide you through it! 🚀
