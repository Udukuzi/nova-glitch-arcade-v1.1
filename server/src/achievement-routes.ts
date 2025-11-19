/**
 * Achievement System Routes
 * Handles achievement tracking, unlocking, and rewards
 */

import express, { Request, Response } from 'express';
import { supabase } from './db';
import { logActivity } from './activity-routes';

const router = express.Router();

// Achievement definitions (matches frontend)
const ACHIEVEMENTS = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Play your first game',
    category: 'gameplay',
    requirement: 1,
    reward: { type: 'nag', value: 100 }
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Score 100,000+ points in any game',
    category: 'gameplay',
    requirement: 100000,
    reward: { type: 'badge', value: 'Centurion' }
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Win 5 games in a row',
    category: 'gameplay',
    requirement: 5,
    reward: { type: 'nag', value: 500 }
  },
  {
    id: 'whale_tier',
    name: 'Whale Tier',
    description: 'Hold 1,000,000+ NAG tokens',
    category: 'financial',
    requirement: 1000000,
    reward: { type: 'discount', value: 20 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share your score 10 times',
    category: 'social',
    requirement: 10,
    reward: { type: 'nag', value: 250 }
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Reach #1 on the global leaderboard',
    category: 'special',
    requirement: 1,
    reward: { type: 'title', value: 'Champion' }
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Achieve 95%+ accuracy in Space Invaders',
    category: 'gameplay',
    requirement: 95,
    reward: { type: 'badge', value: 'Sharpshooter' }
  },
  {
    id: 'pac_master',
    name: 'Pac Master',
    description: 'Clear all levels in Pac-Man',
    category: 'gameplay',
    requirement: 1,
    reward: { type: 'badge', value: 'Pac Master' }
  },
  {
    id: 'swap_master',
    name: 'Swap Master',
    description: 'Complete 50 swaps',
    category: 'financial',
    requirement: 50,
    reward: { type: 'discount', value: 10 }
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Play for 10 hours total',
    category: 'gameplay',
    requirement: 36000,
    reward: { type: 'nag', value: 1000 }
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join in the first month',
    category: 'special',
    requirement: 1,
    reward: { type: 'badge', value: 'Early Adopter' }
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Swap 10,000+ USDC worth',
    category: 'financial',
    requirement: 10000,
    reward: { type: 'discount', value: 15 }
  }
];

// ========================================
// GET USER ACHIEVEMENTS
// ========================================

router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // Get user's achievement progress
    const { data: userAchievements, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('wallet', wallet);

    if (error) throw error;

    // Merge with achievement definitions
    const achievements = ACHIEVEMENTS.map(ach => {
      const userAch = userAchievements?.find(ua => ua.achievement_id === ach.id);
      
      return {
        ...ach,
        progress: userAch?.progress || 0,
        unlocked: userAch?.unlocked || false,
        unlockedAt: userAch?.unlocked_at || null
      };
    });

    res.json({ 
      achievements,
      totalUnlocked: achievements.filter(a => a.unlocked).length,
      totalAchievements: achievements.length
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// ========================================
// UPDATE ACHIEVEMENT PROGRESS
// ========================================

router.post('/progress', async (req: Request, res: Response) => {
  try {
    const { wallet, achievementId, progress, username } = req.body;

    if (!wallet || !achievementId || progress === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('wallet', wallet)
      .eq('achievement_id', achievementId)
      .single();

    if (existing?.unlocked) {
      return res.json({ 
        success: true, 
        alreadyUnlocked: true,
        achievement: existing
      });
    }

    // Check if this update unlocks the achievement
    const unlocked = progress >= achievement.requirement;
    const unlockedAt = unlocked ? new Date().toISOString() : null;

    // Upsert achievement progress
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert({
        wallet,
        achievement_id: achievementId,
        progress,
        unlocked,
        unlocked_at: unlockedAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'wallet,achievement_id'
      })
      .select()
      .single();

    if (error) throw error;

    // If newly unlocked, log activity and give rewards
    if (unlocked && !existing?.unlocked) {
      // Log to activity feed
      await logActivity(
        wallet,
        'achievement',
        `unlocked "${achievement.name}" achievement!`,
        { achievement: achievement.name, reward: achievement.reward },
        username
      );

      // Award NAG tokens if applicable
      if (achievement.reward?.type === 'nag') {
        await awardNAGTokens(wallet, achievement.reward.value as number);
      }
    }

    res.json({ 
      success: true, 
      achievement: {
        ...achievement,
        ...data
      },
      newlyUnlocked: unlocked && !existing?.unlocked
    });
  } catch (error) {
    console.error('Update achievement error:', error);
    res.status(500).json({ error: 'Failed to update achievement' });
  }
});

// ========================================
// BULK CHECK ACHIEVEMENTS
// ========================================

router.post('/check', async (req: Request, res: Response) => {
  try {
    const { wallet, stats, username } = req.body;

    if (!wallet || !stats) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newlyUnlocked = [];

    // Check each achievement
    for (const ach of ACHIEVEMENTS) {
      let progress = 0;

      // Calculate progress based on stats
      switch (ach.id) {
        case 'first_blood':
          progress = stats.gamesPlayed || 0;
          break;
        case 'centurion':
          progress = stats.highestScore || 0;
          break;
        case 'hot_streak':
          progress = stats.currentStreak || 0;
          break;
        case 'whale_tier':
          progress = stats.nagBalance || 0;
          break;
        case 'social_butterfly':
          progress = stats.shareCount || 0;
          break;
        case 'champion':
          progress = stats.rank === 1 ? 1 : 0;
          break;
        case 'swap_master':
          progress = stats.swapCount || 0;
          break;
        case 'marathon_runner':
          progress = stats.totalPlayTime || 0;
          break;
        case 'high_roller':
          progress = stats.totalSwapVolume || 0;
          break;
        case 'early_adopter':
          progress = stats.isEarlyAdopter ? 1 : 0;
          break;
      }

      if (progress >= ach.requirement) {
        // Check if not already unlocked
        const { data: existing } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('wallet', wallet)
          .eq('achievement_id', ach.id)
          .single();

        if (!existing?.unlocked) {
          // Unlock it
          await supabase
            .from('user_achievements')
            .upsert({
              wallet,
              achievement_id: ach.id,
              progress,
              unlocked: true,
              unlocked_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'wallet,achievement_id'
            });

          newlyUnlocked.push(ach);

          // Log activity
          await logActivity(
            wallet,
            'achievement',
            `unlocked "${ach.name}" achievement!`,
            { achievement: ach.name, reward: ach.reward },
            username
          );

          // Award rewards
          if (ach.reward?.type === 'nag') {
            await awardNAGTokens(wallet, ach.reward.value as number);
          }
        }
      }
    }

    res.json({ 
      success: true, 
      newlyUnlocked,
      count: newlyUnlocked.length
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

// ========================================
// HELPER: Award NAG Tokens
// ========================================

async function awardNAGTokens(wallet: string, amount: number) {
  try {
    // Add to user's pending rewards
    await supabase
      .from('pending_rewards')
      .insert({
        wallet,
        amount,
        type: 'achievement',
        status: 'pending',
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Award NAG error:', error);
  }
}

export default router;
