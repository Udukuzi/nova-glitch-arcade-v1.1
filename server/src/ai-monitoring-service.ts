/**
 * AI Monitoring & Anti-Cheat Service
 * Detects cheating, flags suspicious activities, and manages bans
 */

import supabase from './db';

interface GameSession {
  wallet: string;
  gameName: string;
  score: number;
  durationSeconds: number;
  movesPerMinute?: number;
  averageReactionTime?: number;
  perfectMoves?: number;
  mistakes?: number;
  ipAddress?: string;
  userAgent?: string;
  tournamentId?: string;
  isTournamentGame?: boolean;
}

interface DetectionResult {
  isSuspicious: boolean;
  suspicionScore: number;
  flaggedReasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  shouldBan: boolean;
}

interface PlayerStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  suspicionRate: number;
  trustScore: number;
}

export class AIMonitoringService {
  
  /**
   * Analyze a game session for suspicious activity
   */
  async analyzeGameSession(session: GameSession): Promise<DetectionResult> {
    console.log(`🤖 AI analyzing game session for ${session.wallet}`);
    
    const result: DetectionResult = {
      isSuspicious: false,
      suspicionScore: 0,
      flaggedReasons: [],
      severity: 'low',
      shouldBan: false
    };

    // Get player's historical stats
    const playerStats = await this.getPlayerStats(session.wallet);
    
    // Run all detection checks
    await this.checkImpossibleScore(session, result);
    await this.checkBotSpeed(session, result);
    await this.checkPerfectGameplay(session, result);
    await this.checkScoreAnomaly(session, playerStats, result);
    await this.checkSessionAnomaly(session.wallet, result);
    
    // Determine if auto-ban should occur
    if (result.suspicionScore >= 80 || result.severity === 'critical') {
      result.shouldBan = true;
    }
    
    console.log(`📊 Analysis result: ${result.isSuspicious ? '⚠️ SUSPICIOUS' : '✅ Clean'} (Score: ${result.suspicionScore}/100)`);
    
    return result;
  }

  /**
   * Record a game session with AI analysis
   */
  async recordGameSession(session: GameSession): Promise<void> {
    // First, check if player is banned
    const isBanned = await this.isPlayerBanned(session.wallet);
    if (isBanned) {
      throw new Error('Player is banned and cannot record games');
    }

    // Analyze the session
    const analysis = await this.analyzeGameSession(session);
    
    // Record the session
    const { data: gameSession, error } = await supabase
      .from('game_sessions')
      .insert([{
        wallet: session.wallet,
        game_name: session.gameName,
        score: session.score,
        duration_seconds: session.durationSeconds,
        moves_per_minute: session.movesPerMinute,
        average_reaction_time: session.averageReactionTime,
        perfect_moves: session.perfectMoves,
        mistakes: session.mistakes,
        is_suspicious: analysis.isSuspicious,
        suspicion_score: analysis.suspicionScore,
        flagged_reasons: analysis.flaggedReasons,
        ip_address: session.ipAddress,
        user_agent: session.userAgent,
        tournament_id: session.tournamentId,
        is_tournament_game: session.isTournamentGame || false,
        end_time: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error recording game session:', error);
      throw error;
    }

    // If suspicious, create suspicious activity record
    if (analysis.isSuspicious) {
      await this.logSuspiciousActivity({
        wallet: session.wallet,
        gameSessionId: gameSession.id,
        activityType: analysis.flaggedReasons[0] || 'general_suspicion',
        severity: analysis.severity,
        description: `Flagged: ${analysis.flaggedReasons.join(', ')}`,
        confidenceScore: analysis.suspicionScore,
        evidenceData: {
          session: session,
          analysis: analysis
        }
      });
    }

    // If should auto-ban, execute ban
    if (analysis.shouldBan) {
      await this.banPlayer({
        wallet: session.wallet,
        banType: 'permanent',
        reason: `Auto-banned: ${analysis.flaggedReasons.join(', ')}`,
        evidence: analysis.flaggedReasons,
        bannedBy: 'auto_system'
      });
      
      console.log(`🚫 Auto-banned player: ${session.wallet}`);
    }
  }

  /**
   * Check 1: Impossible Score Detection
   */
  private async checkImpossibleScore(session: GameSession, result: DetectionResult): Promise<void> {
    const { data: rule } = await supabase
      .from('ai_detection_rules')
      .select('*')
      .eq('rule_name', 'impossible_score')
      .eq('is_active', true)
      .single();

    if (!rule) return;

    const thresholds = rule.thresholds as any;
    const maxScore = thresholds.max_score_per_game || 1000000;
    
    if (session.score > maxScore) {
      result.isSuspicious = true;
      result.suspicionScore += 50;
      result.flaggedReasons.push('impossible_score');
      result.severity = 'critical';
      console.log(`⚠️ Impossible score detected: ${session.score} > ${maxScore}`);
    }
  }

  /**
   * Check 2: Bot Speed Detection
   */
  private async checkBotSpeed(session: GameSession, result: DetectionResult): Promise<void> {
    const { data: rule } = await supabase
      .from('ai_detection_rules')
      .select('*')
      .eq('rule_name', 'bot_speed')
      .eq('is_active', true)
      .single();

    if (!rule || !session.movesPerMinute || !session.averageReactionTime) return;

    const thresholds = rule.thresholds as any;
    
    // Check if moves per minute is inhuman
    if (session.movesPerMinute > thresholds.max_moves_per_minute) {
      result.isSuspicious = true;
      result.suspicionScore += 30;
      result.flaggedReasons.push('bot_speed_high');
      result.severity = 'high';
      console.log(`⚠️ Bot-like speed: ${session.movesPerMinute} moves/min`);
    }
    
    // Check if reaction time is too fast
    if (session.averageReactionTime < thresholds.min_reaction_time_ms) {
      result.isSuspicious = true;
      result.suspicionScore += 25;
      result.flaggedReasons.push('reaction_time_too_fast');
      result.severity = 'high';
      console.log(`⚠️ Inhuman reaction time: ${session.averageReactionTime}ms`);
    }
  }

  /**
   * Check 3: Perfect Gameplay Detection
   */
  private async checkPerfectGameplay(session: GameSession, result: DetectionResult): Promise<void> {
    const { data: rule } = await supabase
      .from('ai_detection_rules')
      .select('*')
      .eq('rule_name', 'perfect_gameplay')
      .eq('is_active', true)
      .single();

    if (!rule || session.perfectMoves === undefined || session.mistakes === undefined) return;

    const thresholds = rule.thresholds as any;
    const totalMoves = session.perfectMoves + session.mistakes;
    
    if (totalMoves > 0) {
      const perfectRate = session.perfectMoves / totalMoves;
      
      if (perfectRate >= thresholds.perfect_moves_threshold && session.mistakes === 0 && totalMoves > thresholds.zero_mistakes_threshold) {
        result.isSuspicious = true;
        result.suspicionScore += 20;
        result.flaggedReasons.push('perfect_gameplay');
        result.severity = 'medium';
        console.log(`⚠️ Suspiciously perfect: ${(perfectRate * 100).toFixed(1)}% perfect moves`);
      }
    }
  }

  /**
   * Check 4: Score Anomaly (compared to player's history)
   */
  private async checkScoreAnomaly(session: GameSession, playerStats: PlayerStats | null, result: DetectionResult): Promise<void> {
    if (!playerStats || playerStats.totalGames < 5) {
      // Not enough history to detect anomaly
      return;
    }

    // Check if score is way higher than average (3x standard deviation)
    const scoreDeviation = session.score / playerStats.averageScore;
    
    if (scoreDeviation > 3.0) {
      result.isSuspicious = true;
      result.suspicionScore += 15;
      result.flaggedReasons.push('score_anomaly');
      console.log(`⚠️ Score anomaly: ${session.score} vs avg ${playerStats.averageScore}`);
    }
  }

  /**
   * Check 5: Session Anomaly (too many games too fast)
   */
  private async checkSessionAnomaly(wallet: string, result: DetectionResult): Promise<void> {
    // Check games in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentGames, error } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('wallet', wallet)
      .gte('created_at', oneHourAgo);

    if (error) return;

    const { data: rule } = await supabase
      .from('ai_detection_rules')
      .select('*')
      .eq('rule_name', 'session_anomaly')
      .eq('is_active', true)
      .single();

    if (!rule) return;

    const thresholds = rule.thresholds as any;
    const gameCount = recentGames?.length || 0;
    
    if (gameCount > thresholds.session_count_per_hour) {
      result.isSuspicious = true;
      result.suspicionScore += 10;
      result.flaggedReasons.push('excessive_sessions');
      console.log(`⚠️ Too many games: ${gameCount} in last hour`);
    }
  }

  /**
   * Get player statistics
   */
  private async getPlayerStats(wallet: string): Promise<PlayerStats | null> {
    const { data, error } = await supabase
      .from('player_statistics')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (error || !data) return null;

    return {
      totalGames: data.total_games_played,
      averageScore: data.average_score,
      highestScore: data.highest_score,
      suspicionRate: data.suspicion_rate,
      trustScore: data.trust_score
    };
  }

  /**
   * Log suspicious activity
   */
  private async logSuspiciousActivity(params: {
    wallet: string;
    gameSessionId: string;
    activityType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    confidenceScore: number;
    evidenceData: any;
  }): Promise<void> {
    const { error } = await supabase
      .from('suspicious_activities')
      .insert([{
        wallet: params.wallet,
        game_session_id: params.gameSessionId,
        activity_type: params.activityType,
        severity: params.severity,
        description: params.description,
        confidence_score: params.confidenceScore,
        evidence_data: params.evidenceData,
        detected_by: 'ai_system',
        status: 'pending'
      }]);

    if (error) {
      console.error('Error logging suspicious activity:', error);
    } else {
      console.log(`📝 Logged suspicious activity for ${params.wallet}`);
    }
  }

  /**
   * Ban a player
   */
  async banPlayer(params: {
    wallet: string;
    banType: 'temporary' | 'permanent';
    reason: string;
    evidence: string[];
    bannedBy: string;
    bannedUntil?: string;
  }): Promise<void> {
    const { error } = await supabase
      .from('ban_list')
      .insert([{
        wallet: params.wallet,
        ban_type: params.banType,
        reason: params.reason,
        evidence: params.evidence,
        banned_by: params.bannedBy,
        banned_until: params.bannedUntil || null,
        is_active: true
      }]);

    if (error) {
      console.error('Error banning player:', error);
      throw error;
    }

    // Update player statistics
    await supabase
      .from('player_statistics')
      .update({ is_banned: true, trust_score: 0 })
      .eq('wallet', params.wallet);

    console.log(`🚫 Banned player: ${params.wallet} (${params.banType})`);
  }

  /**
   * Unban a player
   */
  async unbanPlayer(wallet: string, unban_reason: string, unbanned_by: string): Promise<void> {
    const { error } = await supabase
      .from('ban_list')
      .update({
        is_active: false,
        unbanned_at: new Date().toISOString(),
        unbanned_by,
        unban_reason
      })
      .eq('wallet', wallet)
      .eq('is_active', true);

    if (error) {
      console.error('Error unbanning player:', error);
      throw error;
    }

    // Update player statistics
    await supabase
      .from('player_statistics')
      .update({ is_banned: false })
      .eq('wallet', wallet);

    console.log(`✅ Unbanned player: ${wallet}`);
  }

  /**
   * Check if a player is currently banned
   */
  async isPlayerBanned(wallet: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('ban_list')
      .select('*')
      .eq('wallet', wallet)
      .eq('is_active', true)
      .or(`ban_type.eq.permanent,and(ban_type.eq.temporary,banned_until.gt.${new Date().toISOString()})`)
      .single();

    return !error && data !== null;
  }

  /**
   * Get suspicious activities for admin review
   */
  async getSuspiciousActivities(limit: number = 50, status: string = 'pending'): Promise<any[]> {
    const { data, error } = await supabase
      .from('suspicious_activities')
      .select(`
        *,
        game_sessions(*)
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching suspicious activities:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Review a suspicious activity (manual admin review)
   */
  async reviewSuspiciousActivity(
    activityId: string,
    reviewedBy: string,
    status: 'confirmed' | 'false_positive',
    reviewNotes: string,
    actionTaken: 'none' | 'warning' | 'temp_ban' | 'permanent_ban'
  ): Promise<void> {
    const { error } = await supabase
      .from('suspicious_activities')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
        action_taken: actionTaken,
        action_taken_at: actionTaken !== 'none' ? new Date().toISOString() : null
      })
      .eq('id', activityId);

    if (error) {
      console.error('Error reviewing activity:', error);
      throw error;
    }

    console.log(`✅ Reviewed suspicious activity: ${activityId} - ${status}`);
  }
}

export default AIMonitoringService;
