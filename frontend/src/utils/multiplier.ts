// Token/Staking Multiplier System
// Based on tier: guest, holder, staker, whale

export interface UserTier {
  tier: 'guest' | 'holder' | 'staker' | 'whale'
  stakedAmount: number
  tokenBalance: number
}

const MIN_HOLD = 1000  // Minimum tokens to be a holder
const MIN_STAKE = 5000  // Minimum tokens staked to be a staker
const WHALE_THRESHOLD = 20000  // Minimum tokens to be a whale

export function getTier(
  tokenBalance: number,
  stakedAmount: number
): UserTier['tier'] {
  if (stakedAmount >= WHALE_THRESHOLD) return 'whale'
  if (stakedAmount >= MIN_STAKE) return 'staker'
  if (tokenBalance >= MIN_HOLD) return 'holder'
  return 'guest'
}

export function getMultiplier(tier: UserTier['tier'], stakedAmount: number = 0): number {
  switch (tier) {
    case 'whale':
      return 3.0  // 3x multiplier for whales
    case 'staker':
      return 2.0  // 2x multiplier for stakers
    case 'holder':
      return 1.5  // 1.5x multiplier for token holders
    case 'guest':
    default:
      return 1.0  // 1x multiplier for guests/trial users
  }
}

export function getMultiplierByAmount(
  tokenBalance: number,
  stakedAmount: number = 0
): { multiplier: number; tier: UserTier['tier'] } {
  const tier = getTier(tokenBalance, stakedAmount)
  const multiplier = getMultiplier(tier, stakedAmount)
  return { multiplier, tier }
}

export function applyMultiplierToScore(score: number, multiplier: number): number {
  return Math.floor(score * multiplier)
}










