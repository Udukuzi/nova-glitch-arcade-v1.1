/**
 * Achievement Tracking Utility
 * Handles all achievement progress updates and notifications
 */

import { Analytics } from './analytics';

const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';

interface GameData {
  game: string;
  score: number;
  duration: number;
  accuracy?: number;
  levelsCompleted?: number;
  totalLevels?: number;
  didWin?: boolean;
}

interface SwapData {
  inputAmount: number;
  outputAmount: number;
  usdValue: number;
}

// Track game completion and check achievements
export const trackGameCompletion = async (gameData: GameData) => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  try {
    // 1. Log activity to feed
    await fetch(`${apiBase}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        type: 'game',
        message: `scored ${gameData.score.toLocaleString()} in ${gameData.game}!`,
        metadata: gameData
      })
    });

    // 2. Track in analytics
    Analytics.gameCompleted(gameData.game, gameData.score, gameData.duration);

    // 3. Update game stats in localStorage
    updateGameStats(gameData);

    // 4. Check all achievements
    await checkGameAchievements(wallet, gameData);

  } catch (error) {
    console.error('Failed to track game completion:', error);
  }
};

// Update local game statistics
const updateGameStats = (gameData: GameData) => {
  try {
    const stats = JSON.parse(localStorage.getItem('user_game_stats') || '{}');
    
    stats.gamesPlayed = (stats.gamesPlayed || 0) + 1;
    stats.totalScore = (stats.totalScore || 0) + gameData.score;
    stats.totalPlayTime = (stats.totalPlayTime || 0) + gameData.duration;
    stats.highestScore = Math.max(stats.highestScore || 0, gameData.score);

    // Update win streak
    if (gameData.didWin) {
      stats.currentStreak = (stats.currentStreak || 0) + 1;
      stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
    } else {
      stats.currentStreak = 0;
    }

    localStorage.setItem('user_game_stats', JSON.stringify(stats));
  } catch (error) {
    console.error('Failed to update game stats:', error);
  }
};

// Check all game-related achievements
const checkGameAchievements = async (wallet: string, gameData: GameData) => {
  const achievements = [];
  const stats = JSON.parse(localStorage.getItem('user_game_stats') || '{}');

  // 1. First Blood - Play your first game
  achievements.push({ id: 'first_blood', progress: stats.gamesPlayed || 1 });

  // 2. Centurion - Score 100,000+ points in a single game
  if (gameData.score >= 100000) {
    achievements.push({ id: 'centurion', progress: gameData.score });
  }

  // 3. Hot Streak - Win 5 games in a row
  if (stats.currentStreak >= 5) {
    achievements.push({ id: 'hot_streak', progress: stats.currentStreak });
  }

  // 4. Sharpshooter - 95%+ accuracy in Space Invaders
  if (gameData.game === 'Space Invaders' && gameData.accuracy && gameData.accuracy >= 95) {
    achievements.push({ id: 'sharpshooter', progress: gameData.accuracy });
  }

  // 5. Pac Master - Complete all levels in Pac-Man
  if (gameData.game === 'PacCoin' && gameData.levelsCompleted === gameData.totalLevels) {
    achievements.push({ id: 'pac_master', progress: 1 });
  }

  // 6. Marathon Runner - Play for 10 hours total
  if (stats.totalPlayTime >= 36000) { // 10 hours in seconds
    achievements.push({ id: 'marathon_runner', progress: stats.totalPlayTime });
  }

  // Update all achievements
  for (const ach of achievements) {
    if (ach.progress > 0) {
      await updateAchievement(wallet, ach.id, ach.progress);
    }
  }
};

// Track swap completion
export const trackSwapCompletion = async (swapData: SwapData) => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  try {
    // Log to activity feed
    await fetch(`${apiBase}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        type: 'swap',
        message: `swapped $${swapData.usdValue.toFixed(2)} worth of tokens!`,
        metadata: swapData
      })
    });

    // Update swap stats
    const swapStats = JSON.parse(localStorage.getItem('user_swap_stats') || '{}');
    swapStats.swapCount = (swapStats.swapCount || 0) + 1;
    swapStats.totalVolume = (swapStats.totalVolume || 0) + swapData.usdValue;
    localStorage.setItem('user_swap_stats', JSON.stringify(swapStats));

    // Check achievements
    const achievements = [];

    // Swap Master - 50 swaps
    if (swapStats.swapCount >= 50) {
      achievements.push({ id: 'swap_master', progress: swapStats.swapCount });
    }

    // High Roller - $10K+ volume
    if (swapStats.totalVolume >= 10000) {
      achievements.push({ id: 'high_roller', progress: swapStats.totalVolume });
    }

    for (const ach of achievements) {
      await updateAchievement(wallet, ach.id, ach.progress);
    }

  } catch (error) {
    console.error('Failed to track swap:', error);
  }
};

// Track social share
export const trackSocialShare = async (platform: string, context: string) => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  try {
    // Update share stats
    const shareStats = JSON.parse(localStorage.getItem('user_share_stats') || '{}');
    shareStats.shareCount = (shareStats.shareCount || 0) + 1;
    localStorage.setItem('user_share_stats', JSON.stringify(shareStats));

    // Social Butterfly - 10 shares
    if (shareStats.shareCount >= 10) {
      await updateAchievement(wallet, 'social_butterfly', shareStats.shareCount);
    }

    // Log to activity feed
    await fetch(`${apiBase}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        type: 'achievement',
        message: `shared their ${context} on ${platform}!`,
        metadata: { platform, context }
      })
    });

  } catch (error) {
    console.error('Failed to track share:', error);
  }
};

// Check wallet balance for whale achievement
export const checkWalletAchievements = async (nagBalance: number) => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  try {
    // Whale Tier - Hold 1M NAG
    if (nagBalance >= 1000000) {
      await updateAchievement(wallet, 'whale_tier', nagBalance);
    }
  } catch (error) {
    console.error('Failed to check wallet achievements:', error);
  }
};

// Check early adopter achievement (call on first connection)
export const checkEarlyAdopter = async () => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  try {
    const joinDate = localStorage.getItem('user_join_date');
    if (!joinDate) {
      localStorage.setItem('user_join_date', new Date().toISOString());
    }

    // Early Adopter - Join in first month (before Feb 1, 2025)
    const cutoffDate = new Date('2025-02-01');
    const userJoinDate = new Date(joinDate || new Date());
    
    if (userJoinDate < cutoffDate) {
      await updateAchievement(wallet, 'early_adopter', 1);
    }
  } catch (error) {
    console.error('Failed to check early adopter:', error);
  }
};

// Check champion achievement (call when viewing leaderboard)
export const checkChampionAchievement = async (userRank: number) => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  try {
    // Champion - Reach #1 rank
    if (userRank === 1) {
      await updateAchievement(wallet, 'champion', 1);
    }
  } catch (error) {
    console.error('Failed to check champion achievement:', error);
  }
};

// Update single achievement
const updateAchievement = async (wallet: string, achievementId: string, progress: number) => {
  try {
    // Check if already unlocked locally to prevent duplicate notifications
    const unlockedAchievements = JSON.parse(localStorage.getItem('unlocked_achievements') || '[]');
    if (unlockedAchievements.includes(achievementId)) {
      return; // Already unlocked, don't show notification again
    }

    const response = await fetch(`${apiBase}/achievements/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wallet,
        achievementId,
        progress
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.newlyUnlocked) {
        // Mark as unlocked locally
        unlockedAchievements.push(achievementId);
        localStorage.setItem('unlocked_achievements', JSON.stringify(unlockedAchievements));
        
        // Show notification
        showAchievementNotification(data.achievement);
        
        // Log to activity feed
        await fetch(`${apiBase}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet,
            type: 'achievement',
            message: `unlocked "${data.achievement.name}" achievement!`,
            metadata: { achievement: data.achievement }
          })
        });
      }
    }
  } catch (error) {
    console.error(`Failed to update achievement ${achievementId}:`, error);
  }
};

// Show achievement notification
const showAchievementNotification = (achievement: any) => {
  // Create a custom notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 10000;
    background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
    border: 3px solid #00ff88;
    border-radius: 20px;
    padding: 32px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 0 60px rgba(0, 255, 136, 0.6);
    animation: achievementPop 0.5s ease-out;
  `;

  notification.innerHTML = `
    <style>
      @keyframes achievementPop {
        0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    </style>
    <div style="font-size: 64px; margin-bottom: 16px;">${achievement.icon}</div>
    <div style="color: #00ff88; font-size: 28px; font-weight: 700; margin-bottom: 8px; font-family: 'Orbitron', sans-serif;">
      🎉 Achievement Unlocked!
    </div>
    <div style="color: #fff; font-size: 24px; font-weight: 600; margin-bottom: 12px; font-family: 'Rajdhani', sans-serif;">
      ${achievement.name}
    </div>
    <div style="color: #8af0ff; font-size: 16px; margin-bottom: 20px; font-family: 'Rajdhani', sans-serif;">
      ${achievement.description}
    </div>
    <div style="color: #ffd700; font-size: 20px; font-weight: 700; font-family: 'Rajdhani', sans-serif;">
      +${achievement.reward.toLocaleString()} NAG Reward! 💰
    </div>
  `;

  document.body.appendChild(notification);

  // Play sound (if available)
  try {
    const audio = new Audio('/achievement-unlock.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {}

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = 'achievementPop 0.3s ease-in reverse';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 5000);
};

// Initialize achievement tracking (call on app start)
export const initializeAchievementTracking = async () => {
  const wallet = localStorage.getItem('wallet_address');
  if (!wallet) return;

  // Check early adopter
  await checkEarlyAdopter();

  // Check wallet balance achievements if data available
  const userData = localStorage.getItem('wallet_user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.tokenBalance) {
        await checkWalletAchievements(user.tokenBalance);
      }
    } catch (e) {}
  }
};
