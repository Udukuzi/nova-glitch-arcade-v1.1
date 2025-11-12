# 🎮 Nova Glitch Arcade - Demo Mode

## 🚀 Quick Start

### Run the Demo Locally:
```bash
# Double-click this file:
TEST_DEMO.bat

# Or manually:
# Terminal 1:
cd server && npm install && npm run dev

# Terminal 2:
cd frontend && npm install && npm run dev

# Open: http://localhost:5173
```

---

## ✨ What's Included in Demo Mode

### 1. **Token Integration** ✅
- **NAG Token CA:** `957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump`
- Live Jupiter V6 swap integration
- Real-time price quotes
- Supports SOL, USDC, USDT ↔ NAG

### 2. **Battle Arena Demo** ✅
**5 Game Modes:**
- 🎯 **1v1 Duel:** 10 USDC entry → 180 NAG prize
- 👥 **Team Battle:** 5 USDC entry → 90 NAG prize  
- 🏆 **Tournament:** 50 USDC entry → 5000 NAG prize
- 💎 **Pro Pool:** 100 USDC entry → 50K+ NAG prize
- 🎲 **Practice Mode:** FREE (no stakes)

**Demo Flow:**
1. Select game mode
2. View entry fee & prize pool
3. Simulate deposit (animated, no real funds)
4. Join waitlist for real launch
5. Track demo history

### 3. **Database Tracking** ✅
- All demo entries logged
- Competition statistics
- Waitlist emails collected
- Player history stored

### 4. **Backend API** ✅
**Endpoints:**
- `POST /api/battle-arena/demo/enter` - Record demo entry
- `GET /api/battle-arena/demo/stats` - Get statistics
- `POST /api/battle-arena/waitlist` - Add to waitlist
- `GET /api/battle-arena/demo/history` - User's demo matches

---

## 🎯 What's Simulated (Not Real)

### Demo Mode Limitations:
- ❌ **No real USDC transfers** - Deposits are animated only
- ❌ **No real NAG payouts** - Prize display is simulated
- ❌ **No actual matchmaking** - Competition entries are recorded but games don't start
- ❌ **No escrow smart contract** - Coming in production launch

### Why Demo Mode?
Building a production-ready escrow system requires:
- Smart contract development (4-6 weeks)
- Security audits ($15K-$50K)
- Extensive testing
- Legal compliance

**Our strategy:** Launch demo now to build hype, deploy full system Q1 2025.

---

## 📊 Demo Statistics

The platform tracks:
- Total demo entries
- Simulated volume in USDC
- Waitlist signup count
- Most popular game modes

**View stats:** Displayed on homepage (if DemoStatsDisplay component is added)

---

## 🎥 Recording a Demo Video

### Setup:
1. **Clean browser** - Clear cache, open incognito
2. **Prepare wallet** - Have Phantom/Solflare with some SOL
3. **Screen recorder** - OBS Studio, Loom, or Windows Game Bar
4. **Resolution:** 1920x1080 (Full HD)
5. **Duration:** 2-3 minutes max

### Recording Checklist:
```
✅ Show splash screen & aesthetic
✅ Connect wallet
✅ Demonstrate a game (Snake or Flappy)
✅ Show Jupiter swap (SOL → NAG)
✅ Open Battle Arena modal
✅ Select 1v1 Duel mode
✅ Confirm entry (watch animation)
✅ Complete waitlist form
✅ Show leaderboard
✅ Display token CA prominently
```

### Video Script (Included in `12_HOUR_SPRINT_GUIDE.md`)

---

## 🚀 Deployment

### Frontend (Netlify - Fastest):
```bash
cd frontend
npm run build
npx netlify-cli deploy --prod
```

### Frontend (Vercel):
```bash
cd frontend
npm run build
npx vercel --prod
```

### Backend (Railway.app):
1. Create account at railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy

### Backend (Render.com):
1. Create account at render.com
2. New Web Service → Connect repository
3. Set environment variables
4. Deploy

### Environment Variables:
**Frontend (.env):**
```
VITE_API_URL=https://your-backend-url.com
VITE_NAG_TOKEN_MINT=957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump
```

**Backend (.env):**
```
PORT=5178
JWT_SECRET=your-secure-random-string
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-anon-key
NODE_ENV=production
```

---

## 🐛 Troubleshooting

### Issue: Battle Arena doesn't open
**Fix:** Check that `BattleArenaDemoMode.tsx` is imported in `App.tsx`

### Issue: Deposit animation stuck
**Fix:** Check browser console for errors. Verify backend is running.

### Issue: Waitlist form doesn't submit
**Fix:** Ensure backend route `/api/battle-arena/waitlist` is accessible

### Issue: Token swap fails
**Fix:** 
- Verify token CA is correct: `957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump`
- Check wallet has sufficient SOL for transaction
- Ensure Jupiter API is accessible

### Issue: Games don't load
**Fix:** 
- Check `frontend/public/games/` folder exists
- Verify game files are included in build
- Check browser console for 404 errors

---

## 📝 Database Setup

### Run Migrations:
```sql
-- Connect to your Supabase project
-- Run these files in order:

1. server/migrations/003_battle_arena_demo.sql
2. server/migrations/004_demo_stats_functions.sql
```

### Verify Tables:
```sql
SELECT * FROM competitions;
SELECT * FROM competition_participants;
SELECT * FROM battle_arena_waitlist;
SELECT * FROM demo_stats;
```

---

## 🎯 Success Metrics

### Week 1 Targets:
- 50+ demo entries
- 25+ waitlist signups
- 200+ unique visitors

### Month 1 Targets:
- 500+ demo entries
- 200+ waitlist signups
- 2,000+ unique visitors
- Community building (Discord/Telegram)

---

## 🔮 Production Roadmap

### Q1 2025 (Full Launch):
- ✅ Smart contract escrow development
- ✅ Security audit ($15K-$50K budget)
- ✅ Real USDC deposit integration
- ✅ Automated NAG payout system
- ✅ AI anti-cheat implementation
- ✅ Tournament bracket system

### Q2 2025 (Expansion):
- ✅ Mobile app (React Native)
- ✅ Additional games
- ✅ Sponsored tournaments
- ✅ NFT integration for achievements

---

## 💰 Token Information

**$NAG Token:**
- **Contract:** `957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump`
- **Chain:** Solana
- **Decimals:** 6
- **Type:** SPL Token (pump.fun)

**Buy on:**
- Jupiter Aggregator (best prices)
- Raydium
- Direct via our swap interface

---

## 🤝 Community

**Stay Updated:**
- Telegram: [Your TG Link]
- Twitter/X: [Your Twitter]
- Discord: [Your Discord]
- Website: [Your Website]

**Join Waitlist:**
Use the Battle Arena demo to sign up for launch notifications!

---

## ⚖️ Legal & Disclaimers

**Demo Mode Notice:**
This demo does not involve real money transactions. All deposits and payouts are simulated for demonstration purposes only.

**Production Launch:**
When real money features launch in Q1 2025, users will be notified and must agree to updated terms of service.

**Gaming Regulations:**
We will ensure compliance with relevant gaming and financial regulations before production launch.

---

## 📞 Support

**Issues?** Open a GitHub issue or contact:
- Email: [Your Email]
- Telegram: [Your Username]

**For Demo Testing:**
Join our Telegram group to report bugs and get support!

---

## 🎉 Thank You!

Thank you for testing Nova Glitch Arcade's Battle Arena demo!

Your feedback helps us build the best blockchain gaming platform.

**See you in the arcade! 🕹️**

---

**Files Created:**
- ✅ `BattleArenaDemoMode.tsx` - Main demo component
- ✅ `battle-arena-routes.ts` - Backend API
- ✅ `003_battle_arena_demo.sql` - Database schema
- ✅ `004_demo_stats_functions.sql` - Helper functions
- ✅ `DemoStatsDisplay.tsx` - Stats widget
- ✅ `12_HOUR_SPRINT_GUIDE.md` - Complete guide
- ✅ `TEST_DEMO.bat` - Quick test script
- ✅ `DEPLOY_NOW.bat` - Deployment helper
- ✅ This README!
