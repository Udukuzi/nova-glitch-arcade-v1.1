/**
 * User Profile Routes
 * Get complete user profile with stats, achievements, and history
 */

import express, { Request, Response } from 'express';
import supabase from './db';

const router = express.Router();

// Achievement definitions (should match achievement-routes.ts)
const ACHIEVEMENTS = [
  { id: 'first_blood', name: 'First Blood', description: 'Play your first game', category: 'gameplay', requirement: 1, reward: { type: 'nag', value: 100 } },
  { id: 'centurion', name: 'Centurion', description: 'Score 100,000+ points in any game', category: 'gameplay', requirement: 100000, reward: { type: 'badge', value: 'Centurion' } },
  { id: 'hot_streak', name: 'Hot Streak', description: 'Win 5 games in a row', category: 'gameplay', requirement: 5, reward: { type: 'nag', value: 500 } },
  { id: 'whale_tier', name: 'Whale Tier', description: 'Hold 1,000,000+ NAG tokens', category: 'financial', requirement: 1000000, reward: { type: 'discount', value: 20 } },
  { id: 'social_butterfly', name: 'Social Butterfly', description: 'Share your score 10 times', category: 'social', requirement: 10, reward: { type: 'nag', value: 300 } },
  { id: 'swap_master', name: 'Swap Master', description: 'Complete 20 token swaps', category: 'defi', requirement: 20, reward: { type: 'nag', value: 1000 } },
  { id: 'early_adopter', name: 'Early Adopter', description: 'Join during beta period', category: 'special', requirement: 1, reward: { type: 'nft', value: 'Beta Tester Badge' } },
  { id: 'champion', name: 'Champion', description: 'Win 100 games', category: 'gameplay', requirement: 100, reward: { type: 'badge', value: 'Champion' } },
  { id: 'pac_master', name: 'Pac Master', description: 'Clear all levels in Pac-Man', category: 'gameplay', requirement: 1, reward: { type: 'badge', value: 'Pac Master' } },
  { id: 'snake_legend', name: 'Snake Legend', description: 'Score 500+ in Snake', category: 'gameplay', requirement: 500, reward: { type: 'badge', value: 'Snake Legend' } },
  { id: 'flappy_pro', name: 'Flappy Pro', description: 'Score 50+ in Flappy Nova', category: 'gameplay', requirement: 50, reward: { type: 'badge', value: 'Flappy Pro' } },
  { id: 'memory_master', name: 'Memory Master', description: 'Clear Memory Match in under 30 seconds', category: 'gameplay', requirement: 1, reward: { type: 'badge', value: 'Memory Master' } },
  { id: 'high_roller', name: 'High Roller', description: 'Swap $10,000+ in total volume', category: 'defi', requirement: 10000, reward: { type: 'nag', value: 5000 } },
  { id: 'referral_king', name: 'Referral King', description: 'Refer 50+ players', category: 'social', requirement: 50, reward: { type: 'nag', value: 10000 } },
  { id: 'tournament_winner', name: 'Tournament Winner', description: 'Win any tournament', category: 'competitive', requirement: 1, reward: { type: 'nft', value: 'Trophy' } }
];

/**
 * GET /api/profile/:wallet
 * Get complete user profile
 */
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // 1. Get user stats
    const { data: stats, error: statsError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching user stats:', statsError);
    }

    // 2. Get achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('wallet', wallet)
      .order('unlocked_at', { ascending: false });

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
    }

    // Merge achievements with definitions
    const mergedAchievements = achievements?.map(userAch => {
      const definition = ACHIEVEMENTS.find(a => a.id === userAch.achievement_id);
      return {
        ...userAch,
        name: definition?.name || 'Unknown',
        description: definition?.description || 'No description',
        category: definition?.category || 'misc',
        requirement: definition?.requirement || 1,
        reward: definition?.reward || { type: 'badge', value: 'Badge' }
      };
    }) || [];

    // Count unlocked achievements
    const unlockedCount = mergedAchievements.filter(a => a.unlocked).length || 0;
    const totalAchievements = ACHIEVEMENTS.length;

    // 3. Get recent game history
    const { data: recentGames, error: gamesError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('wallet', wallet)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10);

    if (gamesError) {
      console.error('Error fetching games:', gamesError);
    }

    // 4. Get best scores per game
    const { data: allGames } = await supabase
      .from('game_sessions')
      .select('game_name, score, duration, accuracy, completed_at')
      .eq('wallet', wallet)
      .not('completed_at', 'is', null);

    // Group by game and get highest score
    const bestScores: Record<string, any> = {};
    allGames?.forEach(game => {
      if (!bestScores[game.game_name] || game.score > bestScores[game.game_name].score) {
        bestScores[game.game_name] = game;
      }
    });

    // 5. Get global rank
    const { count: betterPlayersCount } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact', head: true })
      .gt('highest_score', stats?.highest_score || 0);

    const globalRank = (betterPlayersCount || 0) + 1;

    // 6. Get recent activities
    const { data: activities } = await supabase
      .from('activities')
      .select('*')
      .eq('wallet', wallet)
      .order('created_at', { ascending: false })
      .limit(20);

    // 7. Calculate profile completeness
    const profileCompleteness = calculateProfileCompleteness({
      stats,
      achievements: unlockedCount,
      gamesPlayed: stats?.games_played || 0
    });

    // Build profile response
    const profile = {
      wallet,
      displayName: stats?.wallet ? `${stats.wallet.slice(0, 6)}...${stats.wallet.slice(-4)}` : 'Unknown',
      
      // Stats
      stats: {
        gamesPlayed: stats?.games_played || 0,
        totalScore: stats?.total_score || 0,
        highestScore: stats?.highest_score || 0,
        currentStreak: stats?.current_streak || 0,
        longestStreak: stats?.longest_streak || 0,
        lastActive: stats?.last_active,
        joinedAt: stats?.created_at,
      },

      // Rankings
      rankings: {
        global: globalRank,
        percentile: calculatePercentile(globalRank),
      },

      // Achievements
      achievements: {
        unlocked: unlockedCount,
        total: totalAchievements,
        percentage: Math.round((unlockedCount / totalAchievements) * 100),
        recent: mergedAchievements.slice(0, 5),
        all: mergedAchievements,
      },

      // Game History
      gameHistory: {
        recent: recentGames || [],
        bestScores: Object.values(bestScores),
        favoriteGame: getFavoriteGame(allGames || []),
      },

      // Activities
      recentActivities: activities || [],

      // Profile Info
      profileCompleteness,
      badges: getBadges(stats, unlockedCount),
      level: calculateLevel(stats?.total_score || 0),
    };

    res.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * Helper: Calculate profile completeness percentage
 */
function calculateProfileCompleteness(data: any): number {
  let score = 0;
  const maxScore = 100;

  // Has played games (30 points)
  if (data.gamesPlayed > 0) score += 10;
  if (data.gamesPlayed >= 5) score += 10;
  if (data.gamesPlayed >= 10) score += 10;

  // Has achievements (40 points)
  if (data.achievements > 0) score += 10;
  if (data.achievements >= 3) score += 10;
  if (data.achievements >= 5) score += 10;
  if (data.achievements >= 10) score += 10;

  // Has stats (30 points)
  if (data.stats?.currentStreak > 0) score += 10;
  if (data.stats?.highestScore >= 1000) score += 10;
  if (data.stats?.totalScore >= 5000) score += 10;

  return Math.min(score, maxScore);
}

/**
 * Helper: Calculate percentile from rank
 */
function calculatePercentile(rank: number): number {
  // Simplified - in production you'd calculate against total players
  if (rank === 1) return 99;
  if (rank <= 10) return 95;
  if (rank <= 50) return 90;
  if (rank <= 100) return 75;
  return 50;
}

/**
 * Helper: Get favorite game
 */
function getFavoriteGame(games: any[]): string | null {
  if (!games || games.length === 0) return null;

  const gameCount: Record<string, number> = {};
  games.forEach(game => {
    gameCount[game.game_name] = (gameCount[game.game_name] || 0) + 1;
  });

  let maxCount = 0;
  let favorite = null;
  for (const [game, count] of Object.entries(gameCount)) {
    if (count > maxCount) {
      maxCount = count;
      favorite = game;
    }
  }

  return favorite;
}

/**
 * Helper: Get user badges
 */
function getBadges(stats: any, achievementCount: number): string[] {
  const badges: string[] = [];

  if (!stats) return badges;

  // Score badges
  if (stats.highest_score >= 100000) badges.push('🏆 Centurion');
  else if (stats.highest_score >= 50000) badges.push('⭐ Elite Player');
  else if (stats.highest_score >= 10000) badges.push('🎮 Pro Gamer');
  else if (stats.highest_score >= 1000) badges.push('🎯 Skilled');

  // Games played badges
  if (stats.games_played >= 100) badges.push('💯 Century Club');
  else if (stats.games_played >= 50) badges.push('🎲 Veteran');
  else if (stats.games_played >= 10) badges.push('🎪 Regular');

  // Streak badges
  if (stats.current_streak >= 10) badges.push('🔥 On Fire');
  else if (stats.current_streak >= 5) badges.push('⚡ Hot Streak');

  // Achievement badges
  if (achievementCount >= 10) badges.push('🏅 Achievement Hunter');
  else if (achievementCount >= 5) badges.push('🎖️ Collector');

  return badges;
}

/**
 * Helper: Calculate level from total score
 */
function calculateLevel(totalScore: number): number {
  // 1000 points per level
  return Math.floor(totalScore / 1000) + 1;
}

/**
 * GET /api/profile/:wallet/achievements
 * Get detailed achievements for a user
 */
router.get('/:wallet/achievements', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('wallet', wallet)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error('Error fetching achievements:', error);
      return res.status(500).json({ error: 'Failed to fetch achievements' });
    }

    res.json({
      success: true,
      achievements: data || [],
    });

  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

/**
 * GET /api/profile/:wallet/games
 * Get game history for a user
 */
router.get('/:wallet/games', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('wallet', wallet)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching games:', error);
      return res.status(500).json({ error: 'Failed to fetch games' });
    }

    res.json({
      success: true,
      games: data || [],
      total: data?.length || 0,
    });

  } catch (error) {
    console.error('Games fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

export default router;
