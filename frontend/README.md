# Nova Glitch Arcade Frontend

Modern, polished arcade frontend with dark/light mode, wallet integration, and 3D game lobby.

## Quick Start

1. Install dependencies (already done):
```bash
npm install
```

2. Start the backend server (from project root):
```bash
cd ../server
npm install
npm run dev  # Runs on port 5178
```

3. Start the frontend dev server:
```bash
cd frontend
npm run dev  # Runs on port 5173
```

4. Open http://localhost:5173 in your browser.

## Features Implemented

✅ Dark/Light mode toggle with theme persistence
✅ 3 trials gating with localStorage + backend sync
✅ Wallet modal with 5 providers (MetaMask, Phantom, Solflare, Backpack, Trust)
✅ 3D game lobby with 6 games
✅ Leaderboard API integration
✅ PWA manifest for mobile install
✅ Responsive design
✅ Mock wallet connection flow (backend ready)

## Next Steps

- [ ] Implement actual game components from Build B
- [ ] Add real wallet provider SDKs
- [ ] Integrate sound system with toggle
- [ ] Add staking/tier badges
- [ ] Mobile PWA service worker
- [ ] Telegram bot integration















