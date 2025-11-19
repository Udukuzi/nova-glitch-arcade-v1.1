import crypto from 'crypto';
import supabase from './db';

export class AntiCheatSystem {
  private gameHashes: Map<string, string> = new Map();
  private suspiciousPatterns: Map<string, number> = new Map();
  
  // Validate game session integrity
  async validateGameSession(params: {
    sessionId: string;
    gameId: string;
    score: number;
    duration: number; // in seconds
    actions: Array<{ timestamp: number; action: string; value: number }>
  }): Promise<{ valid: boolean; reason?: string }> {
    
    // 1. Check minimum game duration
    if (params.duration < 30) {
      return { valid: false, reason: 'Game too short - minimum 30 seconds required' };
    }
    
    // 2. Check score rate limits
    const scorePerMinute = (params.score / params.duration) * 60;
    const maxAllowed = this.getMaxScorePerMinute(params.gameId);
    
    if (scorePerMinute > maxAllowed) {
      await this.flagSuspiciousActivity(params.sessionId, 'excessive_score_rate');
      return { valid: false, reason: 'Score rate exceeds maximum allowed' };
    }
    
    // 3. Analyze action patterns
    const patternScore = this.analyzeActionPatterns(params.actions);
    if (patternScore > 0.8) {
      await this.flagSuspiciousActivity(params.sessionId, 'bot_pattern_detected');
      return { valid: false, reason: 'Suspicious gameplay patterns detected' };
    }
    
    // 4. Check for replay attacks
    const gameHash = this.generateGameHash(params);
    if (this.gameHashes.has(gameHash)) {
      return { valid: false, reason: 'Duplicate game session detected' };
    }
    this.gameHashes.set(gameHash, params.sessionId);
    
    // 5. Validate score progression
    const progressionValid = this.validateScoreProgression(params.actions);
    if (!progressionValid) {
      return { valid: false, reason: 'Invalid score progression detected' };
    }
    
    return { valid: true };
  }
  
  // Generate unique hash for game session
  private generateGameHash(params: any): string {
    const data = `${params.sessionId}-${params.gameId}-${params.score}-${params.duration}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
  
  // Analyze action patterns for bot-like behavior
  private analyzeActionPatterns(actions: Array<{ timestamp: number; action: string; value: number }>): number {
    if (actions.length < 10) return 0;
    
    let suspicionScore = 0;
    const intervals: number[] = [];
    
    // Check for consistent timing patterns (bot indicator)
    for (let i = 1; i < actions.length; i++) {
      intervals.push(actions[i].timestamp - actions[i-1].timestamp);
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Low variance indicates bot-like consistency
    if (variance < 100) {
      suspicionScore += 0.4;
    }
    
    // Check for impossible reaction times
    const tooFastReactions = intervals.filter(i => i < 100).length; // < 100ms
    if (tooFastReactions > intervals.length * 0.3) {
      suspicionScore += 0.3;
    }
    
    // Check for repetitive patterns
    const actionSequence = actions.map(a => a.action).join(',');
    const patternLength = this.findRepeatingPattern(actionSequence);
    if (patternLength > 0 && patternLength < 10) {
      suspicionScore += 0.3;
    }
    
    return Math.min(suspicionScore, 1);
  }
  
  // Find repeating patterns in action sequence
  private findRepeatingPattern(sequence: string): number {
    for (let len = 2; len <= 10; len++) {
      const pattern = sequence.substring(0, len);
      const regex = new RegExp(`(${pattern}){3,}`, 'g');
      if (regex.test(sequence)) {
        return len;
      }
    }
    return 0;
  }
  
  // Validate score progression is realistic
  private validateScoreProgression(actions: Array<{ timestamp: number; action: string; value: number }>): boolean {
    let currentScore = 0;
    
    for (const action of actions) {
      // Score should only increase or stay same, never decrease
      if (action.value < currentScore) {
        return false;
      }
      
      // Check for impossible score jumps
      const jump = action.value - currentScore;
      if (jump > 1000) { // Adjust based on game
        return false;
      }
      
      currentScore = action.value;
    }
    
    return true;
  }
  
  // Get maximum allowed score per minute for a game
  private getMaxScorePerMinute(gameId: string): number {
    const limits: { [key: string]: number } = {
      snake: 100,
      flappy: 50,
      memory: 200,
      bonk: 150,
      paccoin: 120,
      tetramem: 300,
      contra: 500
    };
    return limits[gameId] || 100;
  }
  
  // Flag suspicious activity
  private async flagSuspiciousActivity(sessionId: string, reason: string) {
    const count = (this.suspiciousPatterns.get(sessionId) || 0) + 1;
    this.suspiciousPatterns.set(sessionId, count);
    
    // Log to database
    await supabase
      .from('anti_cheat_logs')
      .insert([{
        session_id: sessionId,
        reason: reason,
        timestamp: new Date().toISOString(),
        severity: count > 3 ? 'high' : 'medium'
      }]);
    
    // Ban if too many violations
    if (count > 5) {
      await this.banPlayer(sessionId);
    }
  }
  
  // Ban player for cheating
  private async banPlayer(sessionId: string) {
    // Get player address from session
    const { data: session } = await supabase
      .from('sessions')
      .select('profile_id')
      .eq('id', sessionId)
      .single();
    
    if (session) {
      await supabase
        .from('profiles')
        .update({ 
          banned: true,
          ban_reason: 'Cheating detected',
          banned_at: new Date().toISOString()
        })
        .eq('address', session.profile_id);
    }
  }
  
  // Verify player age for competition mode
  async verifyAgeForCompetition(address: string, mode: 'KIDS' | 'TEEN' | 'ADULT'): Promise<boolean> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('age_verified, age_group')
      .eq('address', address)
      .single();
    
    if (!profile?.age_verified) {
      return false;
    }
    
    const ageGroups = {
      KIDS: ['7-12'],
      TEEN: ['13-17'],
      ADULT: ['18+']
    };
    
    return ageGroups[mode].includes(profile.age_group);
  }
  
  // Calculate trust score for player
  async calculateTrustScore(address: string): Promise<number> {
    const { data: logs } = await supabase
      .from('anti_cheat_logs')
      .select('severity')
      .eq('profile_id', address)
      .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days
    
    if (!logs || logs.length === 0) return 100;
    
    let score = 100;
    logs.forEach(log => {
      if (log.severity === 'high') score -= 20;
      else if (log.severity === 'medium') score -= 10;
      else score -= 5;
    });
    
    return Math.max(0, score);
  }
}

export default AntiCheatSystem;
