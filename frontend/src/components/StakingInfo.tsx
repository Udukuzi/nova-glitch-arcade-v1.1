import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { getUserStakingInfo, getTierProgress, TIERS, formatTokenAmount, type UserStakingInfo, type TierType } from '../utils/staking'

export default function StakingInfo() {
  const [stakingInfo, setStakingInfo] = useState<UserStakingInfo | null>(null)
  const [progress, setProgress] = useState<ReturnType<typeof getTierProgress> | null>(null)

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('wallet_user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const tokenBalance = user.tokenBalance || 0
        const stakedAmount = user.stakedAmount || 0
        
        const info = getUserStakingInfo(tokenBalance, stakedAmount)
        const prog = getTierProgress(tokenBalance, stakedAmount)
        
        setStakingInfo(info)
        setProgress(prog)
      } catch (e) {
        console.error('Failed to parse user data:', e)
      }
    }
  }, [])

  if (!stakingInfo || !progress) {
    return null
  }

  const tierInfo = TIERS[stakingInfo.tier]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: `2px solid ${tierInfo.color}`,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        boxShadow: `0 8px 32px ${tierInfo.color}40`
      }}
    >
      {/* Tier Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          fontSize: 40,
          lineHeight: 1
        }}>
          {tierInfo.icon}
        </div>
        <div>
          <h3 style={{
            margin: 0,
            color: tierInfo.color,
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 24,
            textTransform: 'uppercase'
          }}>
            {tierInfo.name} Tier
          </h3>
          <p style={{
            margin: 0,
            color: '#8af0ff',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 16,
            fontWeight: 600
          }}>
            {stakingInfo.multiplier}x Score Multiplier
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            color: '#8af0ff',
            fontSize: 12,
            fontFamily: 'Rajdhani, sans-serif',
            marginBottom: 4
          }}>
            Token Balance
          </div>
          <div style={{
            color: '#eaeaf0',
            fontSize: 18,
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 600
          }}>
            {formatTokenAmount(stakingInfo.tokenBalance)}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            color: '#8af0ff',
            fontSize: 12,
            fontFamily: 'Rajdhani, sans-serif',
            marginBottom: 4
          }}>
            Staked Amount
          </div>
          <div style={{
            color: '#00ff88',
            fontSize: 18,
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 600
          }}>
            {formatTokenAmount(stakingInfo.stakedAmount)}
          </div>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 8,
          padding: 12,
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            color: '#8af0ff',
            fontSize: 12,
            fontFamily: 'Rajdhani, sans-serif',
            marginBottom: 4
          }}>
            Est. Rewards
          </div>
          <div style={{
            color: '#ff4081',
            fontSize: 18,
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 600
          }}>
            {formatTokenAmount(stakingInfo.estimatedRewards)}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div style={{
        background: 'rgba(0, 255, 136, 0.1)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16
      }}>
        <div style={{
          color: '#00ff88',
          fontSize: 14,
          fontFamily: 'Rajdhani, sans-serif',
          fontWeight: 600,
          marginBottom: 8
        }}>
          Your Benefits:
        </div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}>
          {tierInfo.benefits.map((benefit, i) => (
            <div key={i} style={{
              color: '#eaeaf0',
              fontSize: 13,
              fontFamily: 'Rajdhani, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{ color: '#00ff88' }}>✓</span>
              {benefit}
            </div>
          ))}
        </div>
      </div>

      {/* Progress to Next Tier */}
      {progress.nextTier && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 8
          }}>
            <span style={{
              color: '#8af0ff',
              fontSize: 14,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600
            }}>
              Progress to {TIERS[progress.nextTier].name}
            </span>
            <span style={{
              color: '#eaeaf0',
              fontSize: 14,
              fontFamily: 'Rajdhani, sans-serif',
              fontWeight: 600
            }}>
              {Math.floor(progress.progress)}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${tierInfo.color}, ${TIERS[progress.nextTier].color})`,
                borderRadius: 4
              }}
            />
          </div>
          {(progress.tokensNeeded > 0 || progress.stakeNeeded > 0) && (
            <div style={{
              marginTop: 8,
              color: '#888',
              fontSize: 12,
              fontFamily: 'Rajdhani, sans-serif'
            }}>
              Need: {progress.tokensNeeded > 0 && `${formatTokenAmount(progress.tokensNeeded)} tokens`}
              {progress.tokensNeeded > 0 && progress.stakeNeeded > 0 && ' + '}
              {progress.stakeNeeded > 0 && `${formatTokenAmount(progress.stakeNeeded)} staked`}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
