# 🚀 Deploy Nova Glitch Arcade to Netlify

## ✅ Files Created for You

I've created these deployment files:
- ✅ `frontend/netlify.toml` - Netlify configuration
- ✅ `frontend/.env.production` - Production environment variables
- ✅ `server/package.json` - Already has correct build scripts

---

## 📋 Step-by-Step Deployment

### **Step 1: Deploy Backend (5 minutes)**

#### **Railway (Recommended - Free tier)**

1. **Sign up**: https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **Configure:**
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add Environment Variables:**
   ```
   SUPABASE_URL=https://jhxgsznvbnseyakzcgxz.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGdzem52Ym5zZXlha3pjZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzUxMTksImV4cCI6MjA3NzI1MTExOX0.ac82jzZXjf8WqBBE-9Y4C0XhqPwt6klFAmWFcUS5Pzw
   SUPABASE_SERVICE_ROLE_KEY=(leave empty for now)
   JWT_SECRET=production-secret-change-this
   PORT=5178
   ```
5. **Deploy** → Wait 2-3 minutes
6. **Copy your backend URL** (e.g., `https://nova-arcade.up.railway.app`)

---

### **Step 2: Update Frontend Config (2 minutes)**

Replace `YOUR_BACKEND_URL_HERE` with your Railway URL:

**File 1: `frontend/.env.production`**
```env
VITE_API_BASE=https://your-railway-url.railway.app/api
VITE_GAME_SOCKET_URL=https://your-railway-url.railway.app
```

**File 2: `frontend/netlify.toml`**
Find this line and update:
```toml
to = "https://your-railway-url.railway.app/api/:splat"
```

---

### **Step 3: Deploy Frontend to Netlify (5 minutes)**

1. **Sign up**: https://app.netlify.com
2. **Add new site** → **Import an existing project**
3. **Choose GitHub** → Select your repository
4. **Configure Build Settings:**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
5. **Add Environment Variables** (Site settings → Environment variables):
   ```
   VITE_API_BASE=https://your-railway-url.railway.app/api
   VITE_GAME_SOCKET_URL=https://your-railway-url.railway.app
   ```
6. **Deploy site** → Wait 2-3 minutes
7. **Your arcade is live!** 🎉

---

## 🎯 Quick Checklist

### **Backend (Railway):**
- [ ] Railway account created
- [ ] GitHub repo connected
- [ ] Root directory set to `server`
- [ ] Environment variables added
- [ ] Deployed successfully
- [ ] Backend URL copied

### **Frontend (Netlify):**
- [ ] Updated `.env.production` with backend URL
- [ ] Updated `netlify.toml` with backend URL
- [ ] Netlify account created
- [ ] GitHub repo connected
- [ ] Base directory set to `frontend`
- [ ] Environment variables added
- [ ] Deployed successfully
- [ ] Site URL ready to share

---

## 🧪 Test Your Deployment

1. Visit your Netlify URL
2. Try login (free trial)
3. Play a game
4. Check leaderboard
5. Test on mobile
6. Enable sound (settings ⚙️)

---

## 🚀 Share With Testers

Once deployed, share:
- **URL**: Your Netlify site URL
- **Instructions**: "Try free trial, play games!"
- **Password**: `test2025` (if you have PasswordGate enabled)

---

## ⏱️ Total Time: ~15 minutes

- Backend: 5 min
- Config: 2 min
- Frontend: 5 min
- Testing: 3 min

**Ready to deploy? Start with Step 1!** 🚀
