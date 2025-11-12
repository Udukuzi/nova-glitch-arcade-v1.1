# 🚀 NOVA GLITCH ARCADE - RAPID LAUNCH GUIDE

## ⚡ DEPLOY IN 10 MINUTES

### Option 1: Deploy to Vercel (FASTEST - 5 mins)

1. **Push to GitHub** (if not already):
```bash
git add .
git commit -m "Launch ready"
git push origin main
```

2. **Go to Vercel**:
- Visit: https://vercel.com
- Click "Import Project"
- Select your GitHub repo
- **IMPORTANT Settings**:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Output Directory: `dist`

3. **Environment Variables** (Add in Vercel Dashboard):
```
VITE_API_BASE=https://your-backend.railway.app/api
VITE_GAME_SOCKET_URL=https://your-backend.railway.app
```

4. **Deploy!**

---

### Option 2: Deploy Backend to Railway (5 mins)

1. **Go to Railway**:
- Visit: https://railway.app
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your repo

2. **Settings**:
- Root Directory: `server`
- Start Command: `npm start`

3. **Environment Variables** (Copy from server/.env.production):
```
NODE_ENV=production
SUPABASE_URL=https://jhxgsznvbnseyakzcgxz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGdzem52Ym5zZXlha3pjZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzUxMTksImV4cCI6MjA3NzI1MTExOX0.ac82jzZXjf8WqBBE-9Y4C0XhqPwt6klFAmWFcUS5Pzw
JWT_SECRET=8779037dd5385a7f7725892f049a47a50c9bbf519899e1bb1be22a9915f4c96c
PORT=5178
BSC_RPC=https://bsc-dataseed.binance.org/
SOL_RPC=https://api.mainnet-beta.solana.com
MIN_HOLD=100000
MIN_STAKE=250000
```

4. **Deploy!**

---

### Option 3: Deploy to Netlify (Alternative)

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Deploy Frontend**:
```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

3. **Add Environment Variables in Netlify Dashboard**

---

## 🔥 QUICK LOCAL TEST

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Open browser
http://localhost:5173
```

## ✅ LAUNCH CHECKLIST

- [x] Frontend built successfully
- [x] Backend security added (rate limiting, helmet)
- [x] JWT secret is secure
- [x] Supabase credentials set
- [ ] Wallet integration works
- [ ] Games are playable
- [ ] Leaderboard displays
- [ ] Theme toggle works

## 🎯 PRODUCTION URLs

After deployment:
- Frontend: `https://nova-arcade.vercel.app`
- Backend: `https://nova-backend.railway.app`

## 🚨 CRITICAL NOTES

1. **Update CORS in backend** to allow your production frontend URL
2. **Update frontend API URLs** to point to production backend
3. **Keep JWT_SECRET secure** - never commit to GitHub
4. **Monitor first users** for any issues

---

**READY TO LAUNCH!** 🚀🎮✨
