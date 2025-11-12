# 🔧 ENVIRONMENT SETUP - TOKEN GATING

## 📋 STEP-BY-STEP GUIDE

### 1. Create/Update `.env` file

**Location**: `frontend/.env`

```env
# BEFORE TOKEN LAUNCH (Development)
VITE_NAG_TOKEN_MINT=PLACEHOLDER
VITE_MINIMUM_NAG_BALANCE=100000
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Existing variables
VITE_API_URL=http://localhost:5178
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

### 2. AFTER Token Launch (Production)

**When your friend deploys the token, update**:

```env
# AFTER TOKEN LAUNCH
VITE_NAG_TOKEN_MINT=YOUR_TOKEN_ADDRESS_HERE
VITE_MINIMUM_NAG_BALANCE=100000
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Existing variables
VITE_API_URL=https://your-backend-url.com
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

---

## 🚀 HOW IT WORKS

### Before Token Launch:
- `VITE_NAG_TOKEN_MINT=PLACEHOLDER` → **Everyone has access** (for testing)
- Users see games normally
- No token check performed

### After Token Launch:
- `VITE_NAG_TOKEN_MINT=7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU` → **Token gate activates**
- Only users with ≥ 100 $NAG can access games
- Users without tokens see "Buy $NAG" screen

---

## ⚡ QUICK UPDATE PROCESS

### When Token Address is Ready:

**Step 1**: Open `frontend/.env`

**Step 2**: Replace this line:
```
VITE_NAG_TOKEN_MINT=PLACEHOLDER
```

With:
```
VITE_NAG_TOKEN_MINT=<YOUR_TOKEN_ADDRESS>
```

**Step 3**: Rebuild
```bash
cd frontend
npm run build
```

**Step 4**: Deploy new build to Netlify
```bash
# Drag & drop the `dist` folder
# OR use Netlify CLI
netlify deploy --prod --dir=dist
```

**Done!** Token gate is now active! 🎉

---

## 🎮 TESTING TOKEN GATE

### Test WITHOUT Token:
1. Connect wallet that doesn't have $NAG
2. Should see "Token Required" overlay
3. Balance shows 0.00 $NAG
4. "Buy $NAG Tokens" button appears

### Test WITH Token:
1. Buy some $NAG from pump.fun
2. Refresh page
3. Hook checks balance automatically
4. If balance ≥ 100,000 → Access granted! ✅

---

## 🔧 ADJUST MINIMUM BALANCE

Want to change the minimum required tokens?

**Option 1**: Change in `.env`
```env
VITE_MINIMUM_NAG_BALANCE=50000   # Lower requirement
VITE_MINIMUM_NAG_BALANCE=200000  # Higher requirement
```

**Option 2**: Direct in code  
Edit `frontend/src/hooks/useTokenGate.ts`:
```typescript
const MINIMUM_BALANCE = 100000; // Change this number
```

---

## 🐛 TROUBLESHOOTING

### Token gate not showing?
✅ Check `.env` has correct token address  
✅ Rebuild after changing .env  
✅ Clear browser cache  
✅ Check wallet is connected

### Balance shows 0 but I have tokens?
✅ Verify correct wallet connected  
✅ Check token address is correct  
✅ Wait for transaction to confirm  
✅ Try refreshing page

### Everyone getting blocked?
✅ Check `VITE_NAG_TOKEN_MINT` is set correctly  
✅ Make sure not still set to `PLACEHOLDER`  
✅ Verify minimum balance is reasonable

---

## 📱 TELEGRAM BOT INTEGRATION

The token gate works automatically in Telegram too!

When users open the game via Telegram bot:
1. Telegram WebApp opens your site
2. User connects wallet
3. Token gate checks balance
4. If insufficient → Shows buy link
5. If sufficient → Plays games! 🎮

---

## ✅ FINAL CHECKLIST

Before token launch:
- [ ] `.env` has `VITE_NAG_TOKEN_MINT=PLACEHOLDER`
- [ ] Site deployed and working
- [ ] Testing shows all games accessible

When token launches:
- [ ] Get token address from friend
- [ ] Update `.env` with real address
- [ ] Rebuild frontend (`npm run build`)
- [ ] Deploy to Netlify
- [ ] Test with wallet WITHOUT tokens (should be blocked)
- [ ] Buy tokens and test again (should have access)
- [ ] Announce on Twitter! 🚀

---

## 🎯 EXPECTED BEHAVIOR

### Scenario 1: No wallet connected
**Result**: User sees splash screen → Connect wallet prompt

### Scenario 2: Wallet connected, 0 tokens
**Result**: "Token Required" overlay → Buy $NAG button

### Scenario 3: Wallet connected, < 100,000 tokens
**Result**: "Token Required" overlay → Shows how many more needed

### Scenario 4: Wallet connected, ≥ 100,000 tokens
**Result**: Full access to all games! ✅

---

## 💡 PRO TIPS

1. **Start with set minimum** (100,000 tokens ensures serious holders)
2. **Increase gradually** as token gains value
3. **Offer free trials** before requiring tokens (trial system already exists!)
4. **Promote heavily** when token gate activates
5. **Monitor adoption** and adjust requirements

---

## 🚀 READY TO GO!

**Current Status**:
- ✅ Token gate hook created
- ✅ Overlay component built
- ✅ Lobby wrapped with gate
- ✅ Environment setup ready

**Next Step**:
- Wait for token address from friend
- Update `.env` file
- Rebuild & deploy
- **LAUNCH!** 🎉
