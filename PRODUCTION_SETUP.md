# 🚀 Production Setup Guide

## Step 1: Configure Environment Variables

Create `server/.env` file:

```bash
cd server
copy .env.example .env
```

Then edit `server/.env` with your actual Supabase credentials:

```env
PORT=5178
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
SUPABASE_ANON_KEY=your_actual_anon_key
JWT_SECRET=generate_a_long_random_string_here_use_openssl_or_node
BSC_RPC=https://bsc-dataseed.binance.org/
SOL_RPC=https://api.mainnet-beta.solana.com
MIN_HOLD=50000
MIN_STAKE=250000
TOKEN_DECIMALS=18
```

**Get your Supabase keys:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy URL and keys

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Run Database Migrations

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents from `server/migrations.sql`
3. Paste and run in SQL Editor
4. Copy contents from `server/RLS_GUIDANCE.sql`
5. Paste and run in SQL Editor

## Step 3: Start Backend Server

Open terminal and run:
```bash
cd server
npm run dev
```

Server will start on http://localhost:5178

## Step 4: Start Frontend Server

Open a NEW terminal and run:
```bash
cd frontend
npm run dev
```

Frontend will start on http://localhost:5173

## Step 5: Test

Open http://localhost:5173 in your browser

You should see:
- Nova Arcade login screen
- 3 free trials
- Wallet modal
- Game lobby
- Leaderboards working

## ✅ Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can see login screen
- [ ] Can use trials
- [ ] Can see wallet modal
- [ ] Leaderboards display (may be empty)

## 🔥 Ready for Launch!

Once both servers are running and tested, you're ready to:
1. Add real game implementations
2. Deploy to production
3. Add real wallet SDKs
4. Add sound effects















