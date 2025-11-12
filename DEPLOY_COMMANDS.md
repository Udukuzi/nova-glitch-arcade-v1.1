# 🚀 DEPLOYMENT COMMANDS - COPY & PASTE

## 1️⃣ Railway Backend Deploy

### Environment Variables (Copy All):
```
NODE_ENV=production
PORT=5178
SUPABASE_URL=https://jhxgsznvbnseyakzcgxz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGdzem52Ym5zZXlha3pjZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzUxMTksImV4cCI6MjA3NzI1MTExOX0.ac82jzZXjf8WqBBE-9Y4C0XhqPwt6klFAmWFcUS5Pzw
JWT_SECRET=8779037dd5385a7f7725892f049a47a50c9bbf519899e1bb1be22a9915f4c96c
BSC_RPC=https://bsc-dataseed.binance.org/
SOL_RPC=https://api.mainnet-beta.solana.com
MIN_HOLD=100000
MIN_STAKE=250000
TOKEN_DECIMALS=18
WHALE_THRESHOLD=1000000
```

### Railway Settings:
- Root Directory: `server`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## 2️⃣ Vercel Frontend Deploy

### Build Settings:
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

### Environment Variables:
```
VITE_API_BASE=https://YOUR-BACKEND.up.railway.app/api
VITE_GAME_SOCKET_URL=https://YOUR-BACKEND.up.railway.app
VITE_SOLANA_NETWORK=mainnet-beta
```

## 3️⃣ Supabase Database Setup

### Run These SQL Commands:
```sql
-- First run migrations.sql
-- Then run x402-migrations.sql
-- Both files are in server folder
```

## 4️⃣ Test Endpoints

### Health Check:
```bash
curl https://YOUR-BACKEND.up.railway.app/api/health
```

### x402 Facilitator:
```bash
curl https://YOUR-BACKEND.up.railway.app/api/x402/facilitate
```

## 5️⃣ Git Commands (If Needed)

```bash
git add .
git commit -m "Nova Glitch Arcade v1.1 with x402 betting"
git push origin main
```

## ✅ READY TO DEPLOY!
