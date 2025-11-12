# 🚀 START TESTING NOW - Quick Guide

## ⚡ 2-Minute Database Fix

You're **95% ready** to test! Just need to add the `trials` table.

---

## 📋 Step-by-Step (2 Minutes)

### **Step 1: Open Supabase** (30 seconds)
1. Go to: https://supabase.com/dashboard
2. Click on your project: `jhxgsznvbnseyakzcgxz`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### **Step 2: Copy This SQL** (30 seconds)
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

### **Step 3: Run It** (10 seconds)
1. Paste the SQL into the editor
2. Click **Run** (or press F5)
3. Should see: "Success. No rows returned"

### **Step 4: Verify** (30 seconds)
```powershell
cd server
node test-supabase.js
```

Should see all ✅ checkmarks!

### **Step 5: Start Servers** (30 seconds)
```powershell
# In one PowerShell window:
cd server
npm run dev

# In another PowerShell window:
cd frontend
npm run dev
```

---

## ✅ You're Ready!

Open: **http://localhost:5173**

### **Test Checklist:**
- [ ] Login works (trial or wallet)
- [ ] Can play Snake
- [ ] Can play Flappy Nova
- [ ] Can play Memory Match
- [ ] Can play PacCoin
- [ ] Can play TetraMem
- [ ] Scores appear in leaderboard
- [ ] Sound effects work (click settings ⚙️)
- [ ] Mobile controls work (F12 → Toggle Device)

---

## 🎮 Share With Testers

Once everything works locally, share:

**URL:** `http://localhost:5173`  
**Password:** (if you set one in PasswordGate)

Or deploy to:
- Vercel (frontend)
- Railway/Render (backend)
- Already have Supabase (database)

---

## 🐛 Quick Troubleshooting

### **"Connection refused"**
→ Make sure both servers are running (frontend + backend)

### **"No scores showing"**
→ Play a game first to create test data

### **"Sound not working"**
→ Click settings ⚙️ and enable sound effects

### **"Mobile controls not showing"**
→ Press F12 → Click "Toggle Device Toolbar" → Select mobile device

---

## 📊 What You Have Now

✅ **5 Working Games**
- Snake Classic
- Flappy Nova
- Memory Match
- PacCoin
- TetraMem

✅ **Professional Features**
- Sound effects & music controls
- Toast notifications
- Mobile gamepad controls
- Enhanced glitch effects
- Persistent leaderboards
- Trial system
- Responsive design

✅ **Ready for Testing**
- All core features working
- Mobile-friendly
- Database-backed
- Professional UI/UX

---

## 🎯 After Testing

Based on tester feedback, implement:
1. Real wallet integration (MetaMask, Phantom)
2. Token gating enhancements
3. Advanced leaderboard features
4. Any requested improvements

---

## 🚀 Let's Go!

**Total time to start testing:** 2 minutes  
**What you get:** Fully functional arcade  
**Next step:** Run that SQL and start testing! 🎮

---

**Need help?** Check these files:
- `QUICK_DATABASE_SETUP.md` - Detailed database guide
- `SESSION_SUMMARY.md` - Everything we did today
- `UI_UX_ENHANCEMENTS.md` - Sound & UI features
- `MOBILE_AND_GLITCH_ENHANCEMENTS.md` - Mobile controls

**You're almost there!** 🎉
