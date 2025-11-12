// Staking and Multiplier System for $NAG Token

export type TierType = 'guest' | 'holder' | 'staker' | 'whale'

export interface TierInfo {
  name: string
  minTokens: number
  minStaked: number
  multiplier: number
  rewardWeight: number
  color: string
  icon: string
  benefits: string[]
}

export const TIERS: Record<TierType, TierInfo> = {
  guest: {
    name: 'Guest',
    minTokens: 0,
    minStaked: 0,
    multiplier: 1.0,
    rewardWeight: 0,
    color: '#888',
    icon: '👤',
    benefits: ['Basic gameplay', 'Standard scoring']
  },
  holder: {
    name: 'Holder',
    minTokens: 1000,
    minStaked: 0,
    multiplier: 1.5,
    rewardWeight: 0.3,
    color: '#8af0ff',
    icon: '💎',
    benefits: ['1.5x score multiplier', '30% reward allocation', 'Holder badge']
  },
  staker: {
    name: 'Staker',
    minTokens: 5000,
    minStaked: 5000,
    multiplier: 2.0,
    rewardWeight: 0.4,
    color: '#00ff88',
    icon: '🔒',
    benefits: ['2.0x score multiplier', '40% reward allocation', 'Staker badge', 'Priority support']
  },
  whale: {
    name: 'Whale',
    minTokens: 20000,
    minStaked: 20000,
    multiplier: 3.0,
    rewardWeight: 0.3,
    color: '#ff4081',
    icon: '🐋',
    benefits: ['3.0x score multiplier', '30% reward allocation', 'Whale badge', 'VIP access', 'Exclusive tournaments']
  }
}

export interface UserStakingInfo {
  tokenBalance: number
  stakedAmount: number
  tier: TierType
  multiplier: number
  estimatedRewards: number
}

/**
 * Calculate user's tier based on token holdings and staked amount
 */
export function calculateTier(tokenBalance: number, stakedAmount: number): TierType {
  if (stakedAmount >= TIERS.whale.minStaked && tokenBalance >= TIERS.whale.minTokens) {
    return 'whale'
  }
  if (stakedAmount >= TIERS.staker.minStaked && tokenBalance >= TIERS.staker.minTokens) {
    return 'staker'
  }
  if (tokenBalance >= TIERS.holder.minTokens) {
    return 'holder'
  }
  return 'guest'
}

/**
 * Get multiplier for a given tier
 */
export function getMultiplier(tier: TierType): number {
  return TIERS[tier].multiplier
}

/**
 * Calculate adjusted score with multiplier
 */
export function calculateAdjustedScore(baseScore: number, tier: TierType): number {
  return Math.floor(baseScore * TIERS[tier].multiplier)
}

/**
 * Calculate estimated rewards based on score, holdings, and staking
 * Formula: (scoreWeight * 0.4 + holdingWeight * 0.3 + stakingWeight * 0.3) * COMMUNITY_POOL
 */
export function calculateEstimatedRewards(
  userScore: number,
  totalCommunityScore: number,
  userTokens: number,
  totalTokensHeld: number,
  userStaked: number,
  totalStaked: number,
  communityPool: number
): number {
  const scoreWeight = totalCommunityScore > 0 ? userScore / totalCommunityScore : 0
  const holdingWeight = totalTokensHeld > 0 ? userTokens / totalTokensHeld : 0
  const stakingWeight = totalStaked > 0 ? userStaked / totalStaked : 0
  
  const reward = (scoreWeight * 0.4 + holdingWeight * 0.3 + stakingWeight * 0.3) * communityPool
  
  return Math.floor(reward)
}

/**
 * Get user's staking info
 */
export function getUserStakingInfo(
  tokenBalance: number,
  stakedAmount: number,
  userScore: number = 0,
  totalCommunityScore: number = 1,
  totalTokensHeld: number = 1,
  totalStaked: number = 1,
  communityPool: number = 200000000 // 20% of 1B tokens
): UserStakingInfo {
  const tier = calculateTier(tokenBalance, stakedAmount)
  const multiplier = getMultiplier(tier)
  const estimatedRewards = calculateEstimatedRewards(
    userScore,
    totalCommunityScore,
    tokenBalance,
    totalTokensHeld,
    stakedAmount,
    totalStaked,
    communityPool
  )
  
  return {
    tokenBalance,
    stakedAmount,
    tier,
    multiplier,
    estimatedRewards
  }
}

/**
 * Format token amount with commas
 */
export function formatTokenAmount(amount: number): string {
  return amount.toLocaleString('en-US')
}

/**
 * Get tier progress (percentage to next tier)
 */
export function getTierProgress(tokenBalance: number, stakedAmount: number): {
  currentTier: TierType
  nextTier: TierType | null
  progress: number
  tokensNeeded: number
  stakeNeeded: number
} {
  const currentTier = calculateTier(tokenBalance, stakedAmount)
  
  const tierOrder: TierType[] = ['guest', 'holder', 'staker', 'whale']
  const currentIndex = tierOrder.indexOf(currentTier)
  const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null
  
  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      progress: 100,
      tokensNeeded: 0,
      stakeNeeded: 0
    }
  }
  
  const nextTierInfo = TIERS[nextTier]
  const tokensNeeded = Math.max(0, nextTierInfo.minTokens - tokenBalance)
  const stakeNeeded = Math.max(0, nextTierInfo.minStaked - stakedAmount)
  
  const totalNeeded = tokensNeeded + stakeNeeded
  const totalProgress = totalNeeded > 0 ? ((nextTierInfo.minTokens + nextTierInfo.minStaked - totalNeeded) / (nextTierInfo.minTokens + nextTierInfo.minStaked)) * 100 : 100
  
  return {
    currentTier,
    nextTier,
    progress: Math.min(100, Math.max(0, totalProgress)),
    tokensNeeded,
    stakeNeeded
  }
}
