# 🎮 Nova Arcade Glitch

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Mainnet-9945FF?logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

> **An AI-powered competitive gaming platform on Solana with autonomous prize management, real-time anti-cheat, and instant crypto payouts.**

[🌐 Live Demo](https://novarcadeglitch.dev) | [📄 Whitepaper](./WHITEPAPER.md) | [🎬 Demo Video](#) | [💬 Discord](#)

---

## 🌟 Overview

Nova Arcade Glitch revolutionizes competitive gaming by combining classic arcade games with blockchain technology and autonomous AI agents. Players compete in age-appropriate tiers for cryptocurrency rewards, with all operations managed trustlessly on Solana.

### ✨ Key Features

- 🤖 **Autonomous AI Agent** - Manages swaps, escrow, monitoring, and payouts without human intervention
- ⚡ **Instant Settlements** - Prize payouts in seconds via Solana
- 🛡️ **Real-Time Anti-Cheat** - ML-powered monitoring with progressive penalties
- 👶 **Age-Appropriate Tiers** - Safe competition for ages 7+ with 5 game modes
- 💱 **Jupiter V6 Integration** - Real mainnet token swaps with best route finding
- 🔐 **Trustless Escrow** - Smart contract-managed prize pools
- 🎮 **7 Classic Games** - Snake, Flappy, Memory Match, Bonk Ryder, PacCoin, TetraMem, Contra

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  TypeScript + Vite + Tailwind + Framer Motion + PWA        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Blockchain Layer (Solana)                     │
│     x402 Protocol + Jupiter V6 + Wallet Adapters           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│         TypeScript + Supabase + JWT Auth                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI Agent Layer                            │
│    Anti-Cheat ML + Payment Processor + Autonomous Logic    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Supabase** account ([Free tier](https://supabase.com))
- **Solana wallet** (Phantom or Solflare)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nova-glitch-arcade.git
cd nova-glitch-arcade

# Install all dependencies
npm install
cd frontend && npm install
cd ../server && npm install
cd ../telegram-bot && npm install
cd ..
```

### Environment Setup

#### 1. Frontend Configuration

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
# Token Configuration (Update after NAG token launch)
VITE_NAG_TOKEN_MINT=your_token_mint_address_here
VITE_MINIMUM_NAG_BALANCE=100000
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

#### 2. Backend Configuration

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```env
# Supabase (Get from https://supabase.com/dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret (Generate a random string)
JWT_SECRET=your_random_secret_here

# Token Thresholds
MIN_HOLD=100000
MIN_STAKE=500000
WHALE_THRESHOLD=1000000

# Blockchain RPCs
BSC_RPC=https://bsc-dataseed.binance.org
SOL_RPC=https://api.mainnet-beta.solana.com
```

#### 3. Telegram Bot Configuration (Optional)

```bash
cd telegram-bot
cp env.example .env
```

Edit `telegram-bot/.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
WEBAPP_URL=https://novarcadeglitch.dev
API_URL=http://localhost:5178
```

### Running Locally

#### Option 1: All Services (Recommended)

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Telegram Bot (Optional)
cd telegram-bot
node bot.js
```

#### Option 2: Quick Start Scripts

**Windows:**
```bash
# Start all servers
START_ALL_SERVERS.bat
```

**Linux/Mac:**
```bash
# Start all servers
./start-all.sh
```

### Access Points

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5178
- **Telegram Bot:** Send `/start` to your bot

---

## 🎮 Battle Arena Modes

### Competition Tiers

| Mode | Age | Entry Fee | Prize Pool | Win Condition |
|------|-----|-----------|------------|---------------|
| 🦄 Kiddies | 7-12 | 5 USDC | ~22,857 NAG | Highest Score |
| 🎯 Teenies | 13-17 | 10 USDC | ~45,714 NAG | Highest Score |
| 🏆 Anyone | All Ages | 15 USDC | ~68,571 NAG | Highest Score |
| 💎 Pro | 18+ | 250 USDC | ~1.14M NAG | Target Score |
| 🎮 Practice | All Ages | FREE | No Prize | Practice |

### Competition Flow

```
1. Select Mode → 2. Confirm Entry → 3. AI Processing:
   
   Step 1: Swap USDC → NAG (Jupiter V6)
   Step 2: Deposit to Escrow (Smart Contract)
   Step 3: Verify Player (AI Agent)
   Step 4: Monitor Gameplay (Real-time AI)
   Step 5: Payout Winner (Instant Settlement)
```

---

## 🛡️ Anti-Cheat System

### AI Monitoring

Our ML-powered anti-cheat system monitors:

- **Input Patterns** - Detects bot-like behavior
- **Timing Anomalies** - Identifies impossible reaction times
- **Score Probability** - Flags statistical impossibilities
- **Behavioral Analysis** - Profiles player patterns

### Progressive Penalties

| Offense | Penalty | Duration |
|---------|---------|----------|
| 1st | Ban + Forfeit Entry | 24 hours |
| 2nd | Ban + Forfeit Rewards | 7 days |
| 3rd | Permanent Ban + Wallet Blacklist | Forever |

---

## 💰 Token Economics

### $NAG Token

**Utility:**
- Entry fee payments
- Prize distributions
- Staking rewards
- Governance rights
- Platform access tiers

### Tier System

| Tier | Holdings | Multiplier | Benefits |
|------|----------|------------|----------|
| Guest | 0 | 1x | Basic access |
| Holder | 100,000+ | 1.5x | Bonus rewards |
| Staker | 500,000+ | 2x | Priority matching |
| Whale | 1,000,000+ | 3x | VIP access |

---

## 📱 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Solana Wallet Adapter** for wallet integration
- **PWA** support for mobile

### Backend
- **Node.js** + Express
- **TypeScript** for type safety
- **Supabase** for database
- **JWT** authentication
- **RESTful API** design

### Blockchain
- **Solana** Mainnet-Beta
- **x402** Payment Protocol
- **Jupiter V6** DEX Aggregator
- **Phantom** & **Solflare** wallets
- Smart contract escrow (pending audit)

### Games
- 6 HTML5 Canvas games
- 1 Python/Pygame game (Contra)
- Real-time score tracking
- Anti-cheat integration

---
### 🤖 x402 Autonomous Payment Integration

Nova Arcade Glitch leverages the **x402 payment protocol** to manage competition entry fees, prize payouts, and automated settlements via our AI agent. All transactions occur on Solana in real-time with trustless escrow.  

**Key Capabilities:**
- **Autonomous Match Payments** – AI agent generates and validates x402 payment requests.  
- **Escrow Management** – Funds are locked until the match completes, ensuring fair play.  
- **Instant Settlements** – Winners receive $NAG tokens immediately after verification.  
- **AI Anti-Cheat Monitoring** – Prevents bots or abnormal gameplay from claiming prizes.  
- **Dual Token Economy** – Players deposit stablecoins (USDC/USDT) and receive $NAG as rewards.  

**x402 Payment Flow Example:**
1. Player enters a Battle Arena mode.
2. AI agent creates an x402 payment request.
3. Player deposits USDC via x402.
4. Funds are held in escrow until the game completes.
5. AI agent validates results and automatically distributes $NAG rewards.
6. All transactions are recorded on Solana for transparency.


## 📂 Project Structure

```
nova-glitch-arcade/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── lib/          # Jupiter integration
│   │   ├── config/       # Token config
│   │   └── utils/        # Utilities
│   ├── public/           # Static assets
│   └── package.json
│
├── server/               # Node.js backend
│   ├── src/
│   │   ├── index.ts      # Main server
│   │   ├── db.ts         # Database
│   │   └── anti-cheat.ts # Anti-cheat logic
│   └── package.json
│
├── telegram-bot/         # Telegram integration
│   ├── bot.js            # Bot logic
│   └── package.json
│
├── contra-backend/       # Python game server
│   ├── main.py           # Contra game
│   └── requirements.txt
│
├── WHITEPAPER.md         # Comprehensive whitepaper
├── README.md             # This file
└── .gitignore            # Git ignore rules
```

---

## 🔐 Security

### Sensitive Data Protection

All sensitive data is excluded from version control:

- ✅ `.env` files ignored
- ✅ API keys never committed
- ✅ Database credentials secured
- ✅ JWT secrets randomized
- ✅ Wallet private keys never stored

### Smart Contract Security

- Multiple audits planned
- Bug bounty program
- Gradual rollout strategy
- Emergency pause function
- Multi-signature requirements

---

## 🚢 Deployment

### Frontend (Netlify)

```bash
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

### Backend (Railway/Heroku)

```bash
cd server
npm run build
# Deploy to your preferred platform
```

### Environment Variables

Set these in your deployment platform:

**Frontend:**
- `VITE_NAG_TOKEN_MINT`
- `VITE_SOLANA_RPC_URL`

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET`
- `SOL_RPC`

---

## 🗺️ Roadmap

### ✅ Phase 1: Foundation (Q4 2025 I)
- [x] Core game development
- [x] Wallet integration
- [x] Trial gating system
- [x] Leaderboards

### ✅ Phase 2: Soft Launch/Battle Arena (Q4 2025 II)
- [x] AI agent architecture
- [x] Jupiter integration
- [x] Anti-cheat system
- [x] Age-tiered modes
- [x] $NAG token deployment
        

### 🔄 Phase 3:Contract & Escrow (Q1 2026)
- [ ] Smart contract audit
- [ ] Public sale
- [ ] Exchange listings
- [ ] Multisig wallet 

### 📅 Phase 4: Mainnet Launch (Q2 2026)
- [ ] Real money competitions
- [ ] Full AI deployment
- [ ] Mobile app
- [ ] Marketing campaign

### 📅 Phase 5: Expansion (Q3-Q4 2026)
- [ ] Additional games
- [ ] Tournament system
- [ ] NFT integration
- [ ] DAO governance

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md).

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- TypeScript for all new code
- ESLint + Prettier for formatting
- Conventional commits
- Test coverage required

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 📞 Contact & Community

- **Website:** [novarcadeglitch.dev](https://novarcadeglitch.dev)
- **Email:** team@novarcadeglitch.dev
- **X Main:** [@BantuBloomNwk](#)
- **Instagram:** (https://www.instagram.com/bantubloomnetwork/)
- **Telegram:** [@NovaArcadeBot](#)
- **X Community:** (https://x.com/i/communities/1986850191111250304)

---

## 🙏 Acknowledgments

- **Solana Foundation** - Blockchain infrastructure
- **Jupiter** - DEX aggregation
- **x402 Protocol** - Payment standard
- **Supabase** - Database platform
- **Netlify** - Frontend hosting

---

## ⚠️ Disclaimer

**This is a demo/development version.** Real money competitions are not yet active. The platform is currently in testing phase with simulated flows. Smart contracts are pending audit. Use at your own risk.

**Launch Timeline:** Q1-Q2 2026

---

## 📊 Stats

- **Games:** 7 classic arcade games
- **Modes:** 5 competition tiers
- **Blockchain:** Solana Mainnet
- **Token:** $NAG (Launched)
- **Anti-Cheat:** AI-powered real-time monitoring
- **Settlement:** Instant (<5 seconds)

---

<div align="center">

**Built with ❤️ for the Solana ecosystem**

[⭐ Star us on GitHub](https://github.com/your-username/nova-glitch-arcade) | [🐛 Report Bug](https://github.com/your-username/nova-glitch-arcade/issues) | [💡 Request Feature](https://github.com/your-username/nova-glitch-arcade/issues)

</div>
