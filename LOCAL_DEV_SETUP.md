# Local Development Setup - Quick Reference

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Backend
```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=any-random-string-for-dev
```

### 3. Configure Frontend (Optional)
```bash
cd frontend
cp .env.example .env
```

Default values work for local dev. Only customize if needed.

### 4. Start Servers

**Terminal 1 - Backend:**
```bash
npm run dev:server
```
✅ Backend runs on `http://localhost:5178`

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```
✅ Frontend runs on `http://localhost:5173`

### 5. Open Browser
```
http://localhost:5173
```

## 🎮 Testing the App

1. **Try Free Trials** (3 available)
   - Click "Play Free Trial"
   - Access lobby and games
   - Scores stored in localStorage

2. **Connect Wallet** (Mock Mode)
   - After trials exhausted, click "Connect Wallet"
   - Select any provider (currently mocked for dev)
   - Full access granted

3. **Play Games**
   - Snake, Flappy, Memory Match, Bonk Ryder, PacCoin, TetraMem
   - Contra requires Python backend (see below)

## 🐍 Optional: Contra Game (Python Backend)

If you want to test the Contra game:

### Windows (PowerShell)
```powershell
.\start-nova-arcade.ps1
```

This script:
- Starts Python backend on `http://127.0.0.1:5001`
- Starts Node backend on `http://localhost:5178`
- Starts frontend on `http://localhost:5173`
- Opens browser automatically

### Manual Start
```bash
# Terminal 1 - Python Backend
cd contra-backend
python game_stream_server.py

# Terminal 2 - Node Backend
npm run dev:server

# Terminal 3 - Frontend
npm run dev:frontend
```

## 🔧 Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Backend (Node) | 5178 | http://localhost:5178 |
| Socket.IO (Python) | 5001 | http://127.0.0.1:5001 |

**Vite Dev Proxy:**
- `/api/*` → `http://127.0.0.1:5178`
- `/socket.io/*` → `http://127.0.0.1:5001`

## 🗄️ Database Setup (Supabase)

### Create Tables
1. Go to your Supabase project
2. Open SQL Editor
3. Run `server/migrations.sql`

### Tables Created
- `profiles` - User wallet addresses and tiers
- `trials` - Trial play tracking
- `sessions` - Game sessions and scores
- `stakes` - Staking records
- `reward_claims` - Reward tracking

### Optional: Row Level Security
Run `server/RLS_GUIDANCE.sql` for security policies.

## 🛠️ Development Tools

### Reset Trial Counter (Dev Only)
In the login screen, click the "Reset Trials" button (top right).

### Check Backend Health
```bash
curl http://localhost:5178/api/health
```

Expected response:
```json
{"ok":true,"now":1699999999999}
```

### View Leaderboard
```bash
curl http://localhost:5178/api/leaderboard
```

## 🐛 Common Issues

### "Cannot connect to backend"
- ✅ Check if backend is running on port 5178
- ✅ Verify `server/.env` has Supabase credentials
- ✅ Check terminal for error messages

### "Supabase error"
- ✅ Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- ✅ Ensure tables are created (run migrations.sql)
- ✅ Check Supabase project is active

### "Port already in use"
```bash
# Windows
netstat -ano | findstr :5178
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5178 | xargs kill -9
```

### Frontend shows blank page
- ✅ Check browser console for errors
- ✅ Clear localStorage: `localStorage.clear()`
- ✅ Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## 📝 Environment Variables Reference

### Backend (`server/.env`)
```env
# Required
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
JWT_SECRET=random-secret-string

# Optional (defaults shown)
PORT=5178
BSC_RPC=https://bsc-dataseed.binance.org/
SOL_RPC=https://api.mainnet-beta.solana.com
MIN_HOLD=50000
MIN_STAKE=250000
WHALE_THRESHOLD=1000000
TOKEN_DECIMALS=18
```

### Frontend (`frontend/.env`)
```env
# Optional (defaults work for local dev)
VITE_API_BASE=http://localhost:5178/api
VITE_GAME_SOCKET_URL=http://127.0.0.1:5001
```

## 🎯 Next Steps

1. **Implement Real Wallet Integration**
   - Replace mock wallet with actual provider SDKs
   - Add signature verification

2. **Add Sound Effects**
   - Game over sound already implemented
   - Add background music toggle

3. **Deploy to Production**
   - See `DEPLOYMENT_GUIDE.md`

## 📚 Additional Resources

- [README.md](./README.md) - Full project documentation
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment
- [server/migrations.sql](./server/migrations.sql) - Database schema
- [Supabase Docs](https://supabase.com/docs) - Database & auth

---

**Happy Coding! 🎮**
