# 🎮 Nova Glitch Arcade v1.1 - Worldclass Build

Complete functional arcade platform with wallet integration, staking, multi-game support, and mobile PWA capability.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works)

### Installation

1. **Clone and install all dependencies:**
```bash
npm run install:all
```

2. **Set up environment variables:**

**Backend (`server/.env`):**
```bash
cd server
cp .env.example .env  # Edit with your Supabase credentials
```

Edit `server/.env` with your actual Supabase URL and keys:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
- `JWT_SECRET` - Random secure string for JWT signing
- `MIN_HOLD`, `MIN_STAKE`, `WHALE_THRESHOLD` - Token thresholds
- `BSC_RPC`, `SOL_RPC` - Blockchain RPC endpoints

**Frontend (`frontend/.env`):**
```bash
cd frontend
cp .env.example .env  # Optional: customize API endpoints
```

Default values work for local dev. Customize for production deployment.

3. **Start backend server (Terminal 1):**
```bash
npm run dev:server
```
Backend runs on `http://localhost:5178`

4. **Start frontend dev server (Terminal 2):**
```bash
npm run dev:frontend
```
Frontend runs on `http://localhost:5173`

5. **Open your browser:**
```
http://localhost:5173
```

## ✨ Features Implemented

### ✅ Core Features
- **Complete Backend API** (Build A)
  - JWT-based authentication with nonce/signature verification
  - Multi-chain wallet support (Solana + EVM chains)
  - Secure trial gating (3 free plays)
  - Staking & tier system (Guest, Holder, Staker, Whale)
  - Leaderboard endpoints (per-game + overall)
  - Session tracking & score management
  - Balance verification for token holders

- **Polished Frontend UI** (Merged Build A + B)
  - Dark/Light mode toggle with persistence
  - Glitch-inspired purple accent color scheme
  - 3D game lobby with animated cards
  - Wallet modal supporting 5 providers:
    - MetaMask (EVM)
    - Phantom (Solana)
    - Solflare (Solana)
    - Backpack (Solana)
    - Trust (Multi-chain)

- **Trial Gating System**
  - Frontend: localStorage for instant UX
  - Backend: Secure database tracking via `trials` table
  - Auto-redirect to wallet connect after 3 trials used

- **Leaderboard**
  - Per-game top 10 scores
  - Overall top 10 scores
  - Real-time display with wallet address masking

### 🎨 UI/UX
- Modern, responsive design
- Glitch/retro arcade aesthetic
- Smooth animations with Framer Motion
- Mobile-friendly layouts
- PWA ready (manifest.json included)

### 🔐 Security
- JWT token authentication
- Supabase RLS (Row Level Security) guidance included
- Environment variable management
- Secure wallet signature verification

### 📦 Database Schema
Complete Supabase schema with:
- `profiles` (wallet address, tier, XP, stake amount)
- `trials` (trial play tracking)
- `sessions` (game session & scores)
- `stakes` (staking records)
- `reward_claims` (reward tracking)

## 🎯 Games Included

All 6 games ready for implementation:
1. **Snake Classic** (Retro grid runner)
2. **Flappy Nova** (Tap to fly)
3. **Memory Match** (Flip and remember)
4. **Bonk Ryder** (High-speed runner)
5. **PacCoin** (Maze coin chaser)
6. **TetraMem** (Falling blocks puzzle)

*Note: Game shells are ready. Implement game logic by replacing placeholders in `frontend/src/components/GameShell.tsx`*

## 🔄 Next Development Steps

### High Priority
- [ ] Implement actual game logic from Build B
- [ ] Integrate real wallet provider SDKs (instead of mock)
- [ ] Add sound system with global toggle
- [ ] Staking/tier badge display in UI
- [ ] Mobile controls (touch/dpad)

### Medium Priority
- [ ] Telegram bot integration
- [ ] Multiplier display (1x, 2x, 3x based on tier)
- [ ] x402 integration for enhanced privacy
- [ ] Service worker for offline PWA
- [ ] iOS/Android specific optimizations

### Future Enhancements
- [ ] Add more games
- [ ] NFT rewards integration
- [ ] Social features (share scores)
- [ ] Achievement system
- [ ] Seasonal events

## 📁 Project Structure

```
nova-glitch-arcade-v1.1-worldclass/
├── server/                 # Express + TypeScript backend
│   ├── src/
│   │   ├── index.ts       # API endpoints
│   │   └── db.ts          # Supabase client
│   ├── migrations.sql     # Database schema
│   ├── RLS_GUIDANCE.sql   # Security policies
│   └── package.json
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.tsx         # 3 trials + wallet gate
│   │   │   ├── WalletModal.tsx   # Multi-provider modal
│   │   │   ├── Lobby.tsx         # 3D game grid
│   │   │   ├── Leaderboard.tsx   # Score display
│   │   │   └── GameShell.tsx     # Game wrapper
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx  # Dark/light toggle
│   │   ├── lib/
│   │   │   └── api.ts            # API client
│   │   └── App.tsx
│   ├── public/
│   │   ├── manifest.json         # PWA config
│   │   └── logo.svg
│   └── package.json
├── package.json           # Root workspace scripts
└── README.md
```

## 🔑 API Endpoints

All endpoints require proper authentication unless marked public.

### Public
- `GET /api/health` - Server health check
- `GET /api/leaderboard` - Overall top 10
- `GET /api/leaderboard/:game` - Per-game top 10

### Authentication
- `POST /api/auth/nonce` - Generate nonce for signing
- `POST /api/auth/verify` - Verify signature, issue JWT

### Protected (JWT required)
- `POST /api/trials/use` - Consume a trial
- `POST /api/session/start` - Start game session
- `POST /api/session/end` - End session, submit score
- `POST /api/stake/update` - Update staking status

### Wallet Checks
- `GET /api/balance/check/:chain/:address/:token` - Verify token balance

## 🛡️ Security Notes

1. **Never commit `.env` files** to version control
2. Use Supabase **Service Role Key** only on backend
3. Use **Anon Key** on frontend with proper RLS policies
4. Set a strong `JWT_SECRET` in production
5. Enable HTTPS in production
6. Implement rate limiting on auth endpoints

## 🚀 Deployment

### Production Environment Variables

**Backend:**
- Deploy `server/` to a Node.js host (Render, Fly.io, Railway, AWS, etc.)
- Set all environment variables from `server/.env.example`
- Ensure `JWT_SECRET` is a strong random string
- Use production RPC endpoints for BSC/Solana

**Frontend:**
- Build: `cd frontend && npm run build`
- Deploy `frontend/dist/` to static hosting (Vercel, Netlify, Cloudflare Pages)
- Set build environment variables:
  - `VITE_API_BASE` - Your deployed backend API URL (e.g., `https://api.yourapp.com/api`)
  - `VITE_GAME_SOCKET_URL` - Your deployed Socket.IO server URL (if using Contra)

**Note:** The current `vercel.json` is configured for frontend-only static deployment. Deploy the backend separately and configure `VITE_API_BASE` to point to it.

## 📝 License

Proprietary - All rights reserved

## 🙏 Acknowledgments

- Build A: Advanced backend architecture
- Build B: Polished UI/UX and wallet integration patterns
- Supabase: Database & real-time infrastructure
- Vite + React: Modern frontend tooling

---

**Built with ❤️ for the Nova Glitch Arcade community**















