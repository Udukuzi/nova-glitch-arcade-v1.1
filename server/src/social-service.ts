/**
 * Social Features Service
 * Handle friends, challenges, activities, and messaging
 */

import supabase from './db';

export class SocialService {
  
  /**
   * Send a friend request
   */
  async sendFriendRequest(userWallet: string, friendWallet: string): Promise<any> {
    // Check if friendship already exists
    const { data: existing } = await supabase
      .from('friendships')
      .select('*')
      .or(`and(user_wallet.eq.${userWallet},friend_wallet.eq.${friendWallet}),and(user_wallet.eq.${friendWallet},friend_wallet.eq.${userWallet})`)
      .single();

    if (existing) {
      if (existing.status === 'accepted') {
        throw new Error('Already friends');
      } else if (existing.status === 'pending') {
        throw new Error('Friend request already sent');
      } else if (existing.status === 'blocked') {
        throw new Error('Cannot send friend request');
      }
    }

    // Create friend request
    const { data, error } = await supabase
      .from('friendships')
      .insert([{
        user_wallet: userWallet,
        friend_wallet: friendWallet,
        status: 'pending',
        requested_by: userWallet
      }])
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Friend request sent: ${userWallet} → ${friendWallet}`);
    return data;
  }

  /**
   * Accept a friend request
   */
  async acceptFriendRequest(userWallet: string, friendWallet: string): Promise<any> {
    const { data, error } = await supabase
      .from('friendships')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('user_wallet', userWallet)
      .eq('friend_wallet', friendWallet)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    // Create social activity
    await this.createActivity({
      userWallet: userWallet,
      activityType: 'friend_added',
      metadata: { friend: friendWallet }
    });

    console.log(`✅ Friend request accepted: ${userWallet} ↔ ${friendWallet}`);
    return data;
  }

  /**
   * Remove a friend
   */
  async removeFriend(userWallet: string, friendWallet: string): Promise<void> {
    // Delete both directions of friendship
    await supabase
      .from('friendships')
      .delete()
      .or(`and(user_wallet.eq.${userWallet},friend_wallet.eq.${friendWallet}),and(user_wallet.eq.${friendWallet},friend_wallet.eq.${userWallet})`);

    console.log(`✅ Friendship removed: ${userWallet} ✗ ${friendWallet}`);
  }

  /**
   * Get user's friends list
   */
  async getFriends(userWallet: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_friends')
      .select('*')
      .eq('user_wallet', userWallet);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get pending friend requests
   */
  async getPendingRequests(userWallet: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('pending_friend_requests')
      .select('*')
      .eq('friend_wallet', userWallet);

    if (error) throw error;
    return data || [];
  }

  /**
   * Create a game challenge
   */
  async createChallenge(params: {
    challengerWallet: string;
    challengedWallet: string;
    gameName: string;
    wagerAmount?: number;
    wagerCurrency?: string;
  }): Promise<any> {
    // Check if users are friends
    const areFriends = await this.areFriends(params.challengerWallet, params.challengedWallet);
    if (!areFriends) {
      throw new Error('Can only challenge friends');
    }

    // Check user preferences
    const { data: prefs } = await supabase
      .from('user_social_preferences')
      .select('accept_challenges')
      .eq('wallet', params.challengedWallet)
      .single();

    if (prefs && !prefs.accept_challenges) {
      throw new Error('User is not accepting challenges');
    }

    const { data, error } = await supabase
      .from('game_challenges')
      .insert([{
        challenger_wallet: params.challengerWallet,
        challenged_wallet: params.challengedWallet,
        game_name: params.gameName,
        wager_amount: params.wagerAmount || 0,
        wager_currency: params.wagerCurrency || 'NAG',
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    console.log(`⚔️ Challenge created: ${params.challengerWallet} → ${params.challengedWallet} (${params.gameName})`);
    return data;
  }

  /**
   * Accept a challenge
   */
  async acceptChallenge(challengeId: string, userWallet: string): Promise<any> {
    const { data, error } = await supabase
      .from('game_challenges')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', challengeId)
      .eq('challenged_wallet', userWallet)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Challenge accepted: ${challengeId}`);
    return data;
  }

  /**
   * Decline a challenge
   */
  async declineChallenge(challengeId: string, userWallet: string): Promise<void> {
    await supabase
      .from('game_challenges')
      .update({ status: 'declined' })
      .eq('id', challengeId)
      .eq('challenged_wallet', userWallet)
      .eq('status', 'pending');

    console.log(`❌ Challenge declined: ${challengeId}`);
  }

  /**
   * Submit challenge score
   */
  async submitChallengeScore(challengeId: string, userWallet: string, score: number): Promise<any> {
    // Get challenge
    const { data: challenge, error: fetchError } = await supabase
      .from('game_challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (fetchError) throw fetchError;
    if (!challenge) throw new Error('Challenge not found');

    // Update appropriate score
    const isChallenger = challenge.challenger_wallet === userWallet;
    const updateField = isChallenger ? 'challenger_score' : 'challenged_score';
    
    const updates: any = { [updateField]: score };

    // Check if both scores are now submitted
    const otherScore = isChallenger ? challenge.challenged_score : challenge.challenger_score;
    
    if (otherScore !== null) {
      // Both scores submitted, determine winner
      const challengerScore = isChallenger ? score : challenge.challenger_score;
      const challengedScore = isChallenger ? challenge.challenged_score : score;
      
      updates.status = 'completed';
      updates.completed_at = new Date().toISOString();
      updates.winner_wallet = challengerScore > challengedScore 
        ? challenge.challenger_wallet 
        : challenge.challenged_wallet;

      // If there was a wager, transfer tokens
      if (challenge.wager_amount > 0) {
        // TODO: Implement token transfer logic
        console.log(`💰 Wager: ${challenge.wager_amount} ${challenge.wager_currency} → ${updates.winner_wallet}`);
      }
    }

    const { data, error } = await supabase
      .from('game_challenges')
      .update(updates)
      .eq('id', challengeId)
      .select()
      .single();

    if (error) throw error;

    console.log(`📊 Challenge score submitted: ${userWallet} scored ${score}`);
    return data;
  }

  /**
   * Get user's challenges
   */
  async getChallenges(userWallet: string, status?: string): Promise<any[]> {
    let query = supabase
      .from('game_challenges')
      .select('*')
      .or(`challenger_wallet.eq.${userWallet},challenged_wallet.eq.${userWallet}`)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  /**
   * Create a social activity
   */
  async createActivity(params: {
    userWallet: string;
    activityType: string;
    gameName?: string;
    score?: number;
    achievementId?: string;
    metadata?: any;
    isPublic?: boolean;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('social_activities')
      .insert([{
        user_wallet: params.userWallet,
        activity_type: params.activityType,
        game_name: params.gameName,
        score: params.score,
        achievement_id: params.achievementId,
        metadata: params.metadata,
        is_public: params.isPublic !== false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get social feed (user's friends' activities)
   */
  async getSocialFeed(userWallet: string, limit: number = 50): Promise<any[]> {
    // Get user's friends
    const friends = await this.getFriends(userWallet);
    const friendWallets = friends.map(f => f.friend_wallet);

    if (friendWallets.length === 0) {
      return [];
    }

    // Get friends' activities
    const { data, error } = await supabase
      .from('social_activities')
      .select('*')
      .in('user_wallet', friendWallets)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get user's own activity history
   */
  async getUserActivities(userWallet: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('social_activities')
      .select('*')
      .eq('user_wallet', userWallet)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Send a direct message
   */
  async sendMessage(senderWallet: string, recipientWallet: string, message: string): Promise<any> {
    // Check if users are friends
    const areFriends = await this.areFriends(senderWallet, recipientWallet);
    if (!areFriends) {
      throw new Error('Can only message friends');
    }

    // Check recipient preferences
    const { data: prefs } = await supabase
      .from('user_social_preferences')
      .select('accept_messages')
      .eq('wallet', recipientWallet)
      .single();

    if (prefs && !prefs.accept_messages) {
      throw new Error('User is not accepting messages');
    }

    const { data, error } = await supabase
      .from('direct_messages')
      .insert([{
        sender_wallet: senderWallet,
        recipient_wallet: recipientWallet,
        message: message
      }])
      .select()
      .single();

    if (error) throw error;

    console.log(`💬 Message sent: ${senderWallet} → ${recipientWallet}`);
    return data;
  }

  /**
   * Get messages between two users
   */
  async getMessages(userWallet: string, otherWallet: string, limit: number = 100): Promise<any[]> {
    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_wallet.eq.${userWallet},recipient_wallet.eq.${otherWallet}),and(sender_wallet.eq.${otherWallet},recipient_wallet.eq.${userWallet})`)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

    // Mark messages as read
    await supabase
      .from('direct_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_wallet', userWallet)
      .eq('sender_wallet', otherWallet)
      .eq('is_read', false);

    return data || [];
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userWallet: string): Promise<number> {
    const { count, error } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_wallet', userWallet)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Update user social preferences
   */
  async updatePreferences(userWallet: string, preferences: any): Promise<any> {
    const { data, error } = await supabase
      .from('user_social_preferences')
      .upsert({
        wallet: userWallet,
        ...preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Get user preferences
   */
  async getPreferences(userWallet: string): Promise<any> {
    const { data, error } = await supabase
      .from('user_social_preferences')
      .select('*')
      .eq('wallet', userWallet)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    
    // Return default preferences if not found
    return data || {
      wallet: userWallet,
      accept_friend_requests: true,
      accept_challenges: true,
      accept_messages: true,
      show_online_status: true,
      show_activity_feed: true
    };
  }

  /**
   * Check if two users are friends
   */
  private async areFriends(wallet1: string, wallet2: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('friendships')
      .select('id')
      .eq('user_wallet', wallet1)
      .eq('friend_wallet', wallet2)
      .eq('status', 'accepted')
      .single();

    return !error && data !== null;
  }

  /**
   * Search for users (for friend requests)
   */
  async searchUsers(searchQuery: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_stats')
      .select('wallet, highest_score, total_score, games_played')
      .ilike('wallet', `%${searchQuery}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

export default SocialService;
