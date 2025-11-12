# 🚀 Nova Glitch Arcade - Implementation Roadmap

## 📋 User Feedback & Implementation Plan

---

## ✅ Phase 1: UI/UX Polish (1-2 hours)
**Priority:** High | **Status:** Starting Now

### Tasks:
- [ ] Add subtle animations and transitions
- [ ] Improve button hover states
- [ ] Add loading states for game launches
- [ ] Polish card designs in lobby
- [ ] Add visual feedback for interactions
- [ ] Improve mobile touch feedback

---

## ✅ Phase 2: Pause Button with Speed Penalty (1 hour)
**Priority:** High | **Status:** Next

### Requirements:
- Pause button in all games
- On unpause: 1.2x speed increase for 3 seconds
- Prevents pause abuse
- Visual indicator for speed boost
- Cooldown between pauses (5 seconds)

### Implementation:
```typescript
// Add to each game component
const [isPaused, setIsPaused] = useState(false)
const [speedMultiplier, setSpeedMultiplier] = useState(1.0)
const [pauseCooldown, setPauseCooldown] = useState(false)

const handlePause = () => {
  if (pauseCooldown) return
  setIsPaused(true)
}

const handleUnpause = () => {
  setIsPaused(false)
  setSpeedMultiplier(1.2) // Speed boost
  setPauseCooldown(true)
  
  setTimeout(() => setSpeedMultiplier(1.0), 3000) // Reset after 3s
  setTimeout(() => setPauseCooldown(false), 5000) // Cooldown 5s
}
```

---

## ✅ Phase 3: TetraMem Speed & Rotation Fix (30 mins)
**Priority:** High | **Status:** Next

### Tasks:
- [ ] Increase drop speed per level (current: 800ms, target: 600ms base, -50ms per level)
- [ ] Fix rotation for all blocks (rebuild dist)
- [ ] Test all 7 piece types (I, O, T, S, Z, J, L)
- [ ] Ensure mobile gamepad rotation works

### Speed Formula:
```typescript
const dropTime = Math.max(200, 600 - (level * 50))
```

---

## ✅ Phase 4: Fix Settings Audio Controls (30 mins)
**Priority:** High | **Status:** Next

### Issue:
Settings toggles don't actually mute game audio

### Fix:
- Connect settings to game audio elements
- Pause/resume game music when toggled
- Mute sound effects globally
- Persist settings across games

### Implementation:
```typescript
// In each game component
useEffect(() => {
  if (audioRef.current) {
    audioRef.current.volume = soundManager.isMusicEnabled() ? 0.3 : 0
  }
}, [])

// Listen for settings changes
window.addEventListener('nova_settings_changed', () => {
  if (audioRef.current) {
    audioRef.current.volume = soundManager.isMusicEnabled() ? 0.3 : 0
  }
})
```

---

## ✅ Phase 5: Active Leaderboard System (2 hours)
**Priority:** High | **Status:** Pending

### Requirements:
- Real-time leaderboard updates
- Show wallet addresses (shortened)
- Filter by game
- Show top 10/20/50 players
- Refresh every 30 seconds
- Show player's rank

### Database Schema (Supabase):
```sql
-- Already exists, just need to query properly
SELECT 
  wallet_address,
  game_id,
  score,
  created_at,
  ROW_NUMBER() OVER (PARTITION BY game_id ORDER BY score DESC) as rank
FROM game_scores
WHERE game_id = 'snake'
ORDER BY score DESC
LIMIT 20
```

---

## ✅ Phase 6: Staking & Multiplier System (3-4 hours)
**Priority:** High | **Status:** Pending

### Token: $NAG (Nova Arcade Glitch)

### Holder Tiers:
| Tier | $NAG Amount | Multiplier | Reward % |
|------|-------------|------------|----------|
| **Guest** | 0 | 1.0x | 0% |
| **Holder** | 1,000+ | 1.5x | 30% |
| **Staker** | 5,000+ (staked) | 2.0x | 40% |
| **Whale** | 20,000+ (staked) | 3.0x | 30% |

### Reward Distribution (20% of future token):
- **Community Pool:** 20% of total supply
- **Distribution:** Based on weighted score
  - Score weight: 40%
  - Holding weight: 30%
  - Staking weight: 30%

### Formula:
```typescript
const calculateReward = (player) => {
  const scoreWeight = player.totalScore / totalCommunityScore
  const holdingWeight = player.tokenAmount / totalTokensHeld
  const stakingWeight = player.stakedAmount / totalStaked
  
  return (scoreWeight * 0.4 + holdingWeight * 0.3 + stakingWeight * 0.3) * COMMUNITY_POOL
}
```

### Implementation:
1. Add staking contract integration
2. Track holder amounts in database
3. Calculate multipliers on score submission
4. Display tier badge in UI
5. Show estimated rewards

---

## ✅ Phase 7: Tokenomics Documentation & Navigation (2 hours)
**Priority:** Medium | **Status:** Pending

### Navigation Menu Items:
- 🏠 Home (Lobby)
- 🎮 Games
- 🏆 Leaderboard
- 💰 Tokenomics
- 🔒 Staking
- 📊 My Stats
- ⚙️ Settings

### Tokenomics Page Content:
```markdown
# $NAG Tokenomics

## Token Distribution
- Total Supply: 1,000,000,000 NAG
- Community Rewards: 20% (200M)
- Staking Rewards: 15% (150M)
- Team: 10% (100M, vested)
- Liquidity: 30% (300M)
- Marketing: 10% (100M)
- Treasury: 15% (150M)

## Utility
- Score multipliers
- Exclusive games access
- Governance rights
- Tournament entry
- NFT minting

## Staking Benefits
- 2-3x score multipliers
- Higher reward allocation
- Early access to features
- Exclusive tournaments
```

---

## ✅ Phase 8: Telegram Bot Integration (4-6 hours)
**Priority:** Medium | **Status:** Pending

### Requirements:
- Telegram Mini App
- Works on PC and Mobile
- Wallet connection via Telegram
- All games playable
- Leaderboard integration
- Score submission

### Tech Stack:
- Telegram Bot API
- Telegram Mini Apps SDK
- TON Connect (for wallet)
- Same React frontend (embedded)

### Implementation Steps:
1. Create Telegram Bot (@BotFather)
2. Set up Mini App
3. Configure webhook
4. Add TON Connect wallet
5. Embed React app in iframe
6. Handle Telegram authentication
7. Test on mobile and desktop

### Bot Commands:
```
/start - Launch Nova Arcade
/play - Start playing
/leaderboard - View rankings
/stats - Your statistics
/stake - Staking information
/help - Get help
```

---

## ✅ Phase 9: Twitter Community Link (5 mins)
**Priority:** Low | **Status:** Quick Fix

### Implementation:
Add to Footer.tsx:
```typescript
<a 
  href="https://x.com/i/communities/1986850191111250304"
  target="_blank"
  rel="noopener noreferrer"
>
  🐦 Join Community
</a>
```

---

## 📊 Timeline Estimate

### Week 1 (Immediate Fixes):
- ✅ Day 1-2: Phases 1-4 (UI, Pause, Speed, Audio)
- ✅ Day 3-4: Phase 5 (Leaderboard)
- ✅ Day 5: Phase 9 (Twitter Link)

### Week 2 (Core Features):
- ✅ Day 1-3: Phase 6 (Staking & Multipliers)
- ✅ Day 4-5: Phase 7 (Tokenomics & Navigation)

### Week 3 (Advanced):
- ✅ Day 1-5: Phase 8 (Telegram Bot)

---

## 🎯 Priority Order

### 🔴 Critical (Do First):
1. Fix Settings Audio Controls
2. TetraMem Speed & Rotation
3. Pause Button Implementation
4. UI/UX Polish

### 🟡 Important (Do Next):
5. Active Leaderboard
6. Staking & Multiplier System
7. Tokenomics Documentation

### 🟢 Nice to Have (Do Later):
8. Telegram Bot Integration
9. Twitter Community Link

---

## 🚀 Let's Start!

**Ready to begin with Phase 1: UI/UX Polish?**

I'll start implementing the critical fixes now. Let me know if you want to adjust priorities or add anything!
