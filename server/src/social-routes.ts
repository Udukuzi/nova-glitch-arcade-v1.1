/**
 * Social Features API Routes
 * Friends, challenges, feed, and messaging
 */

import express, { Request, Response } from 'express';
import SocialService from './social-service';

const router = express.Router();
const socialService = new SocialService();

// ============================================
// FRIEND SYSTEM
// ============================================

/**
 * POST /api/social/friends/request
 * Send a friend request
 */
router.post('/friends/request', async (req: Request, res: Response) => {
  try {
    const { userWallet, friendWallet } = req.body;

    if (!userWallet || !friendWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.sendFriendRequest(userWallet, friendWallet);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: error.message || 'Failed to send friend request' });
  }
});

/**
 * POST /api/social/friends/accept
 * Accept a friend request
 */
router.post('/friends/accept', async (req: Request, res: Response) => {
  try {
    const { userWallet, friendWallet } = req.body;

    if (!userWallet || !friendWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.acceptFriendRequest(userWallet, friendWallet);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: error.message || 'Failed to accept friend request' });
  }
});

/**
 * DELETE /api/social/friends/remove
 * Remove a friend
 */
router.delete('/friends/remove', async (req: Request, res: Response) => {
  try {
    const { userWallet, friendWallet } = req.body;

    if (!userWallet || !friendWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await socialService.removeFriend(userWallet, friendWallet);

    res.json({ success: true, message: 'Friend removed' });
  } catch (error: any) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: error.message || 'Failed to remove friend' });
  }
});

/**
 * GET /api/social/friends/:wallet
 * Get user's friends list
 */
router.get('/friends/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const friends = await socialService.getFriends(wallet);

    res.json({ success: true, friends });
  } catch (error: any) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

/**
 * GET /api/social/friends/requests/:wallet
 * Get pending friend requests
 */
router.get('/friends/requests/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const requests = await socialService.getPendingRequests(wallet);

    res.json({ success: true, requests });
  } catch (error: any) {
    console.error('Error getting friend requests:', error);
    res.status(500).json({ error: 'Failed to get friend requests' });
  }
});

// ============================================
// CHALLENGE SYSTEM
// ============================================

/**
 * POST /api/social/challenges/create
 * Create a game challenge
 */
router.post('/challenges/create', async (req: Request, res: Response) => {
  try {
    const { challengerWallet, challengedWallet, gameName, wagerAmount, wagerCurrency } = req.body;

    if (!challengerWallet || !challengedWallet || !gameName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.createChallenge({
      challengerWallet,
      challengedWallet,
      gameName,
      wagerAmount,
      wagerCurrency
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: error.message || 'Failed to create challenge' });
  }
});

/**
 * POST /api/social/challenges/accept
 * Accept a challenge
 */
router.post('/challenges/accept', async (req: Request, res: Response) => {
  try {
    const { challengeId, userWallet } = req.body;

    if (!challengeId || !userWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.acceptChallenge(challengeId, userWallet);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error accepting challenge:', error);
    res.status(500).json({ error: error.message || 'Failed to accept challenge' });
  }
});

/**
 * POST /api/social/challenges/decline
 * Decline a challenge
 */
router.post('/challenges/decline', async (req: Request, res: Response) => {
  try {
    const { challengeId, userWallet } = req.body;

    if (!challengeId || !userWallet) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await socialService.declineChallenge(challengeId, userWallet);

    res.json({ success: true, message: 'Challenge declined' });
  } catch (error: any) {
    console.error('Error declining challenge:', error);
    res.status(500).json({ error: error.message || 'Failed to decline challenge' });
  }
});

/**
 * POST /api/social/challenges/score
 * Submit challenge score
 */
router.post('/challenges/score', async (req: Request, res: Response) => {
  try {
    const { challengeId, userWallet, score } = req.body;

    if (!challengeId || !userWallet || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.submitChallengeScore(challengeId, userWallet, score);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error submitting challenge score:', error);
    res.status(500).json({ error: error.message || 'Failed to submit score' });
  }
});

/**
 * GET /api/social/challenges/:wallet
 * Get user's challenges
 */
router.get('/challenges/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const { status } = req.query;
    
    const challenges = await socialService.getChallenges(wallet, status as string);

    res.json({ success: true, challenges });
  } catch (error: any) {
    console.error('Error getting challenges:', error);
    res.status(500).json({ error: 'Failed to get challenges' });
  }
});

// ============================================
// SOCIAL FEED & ACTIVITIES
// ============================================

/**
 * POST /api/social/activity
 * Create a social activity
 */
router.post('/activity', async (req: Request, res: Response) => {
  try {
    const { userWallet, activityType, gameName, score, achievementId, metadata, isPublic } = req.body;

    if (!userWallet || !activityType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.createActivity({
      userWallet,
      activityType,
      gameName,
      score,
      achievementId,
      metadata,
      isPublic
    });

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

/**
 * GET /api/social/feed/:wallet
 * Get social feed (friends' activities)
 */
router.get('/feed/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const { limit = 50 } = req.query;

    const feed = await socialService.getSocialFeed(wallet, parseInt(limit as string));

    res.json({ success: true, feed });
  } catch (error: any) {
    console.error('Error getting feed:', error);
    res.status(500).json({ error: 'Failed to get feed' });
  }
});

/**
 * GET /api/social/activities/:wallet
 * Get user's activity history
 */
router.get('/activities/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const { limit = 50 } = req.query;

    const activities = await socialService.getUserActivities(wallet, parseInt(limit as string));

    res.json({ success: true, activities });
  } catch (error: any) {
    console.error('Error getting activities:', error);
    res.status(500).json({ error: 'Failed to get activities' });
  }
});

// ============================================
// MESSAGING
// ============================================

/**
 * POST /api/social/messages/send
 * Send a direct message
 */
router.post('/messages/send', async (req: Request, res: Response) => {
  try {
    const { senderWallet, recipientWallet, message } = req.body;

    if (!senderWallet || !recipientWallet || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await socialService.sendMessage(senderWallet, recipientWallet, message);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message || 'Failed to send message' });
  }
});

/**
 * GET /api/social/messages/:userWallet/:otherWallet
 * Get messages between two users
 */
router.get('/messages/:userWallet/:otherWallet', async (req: Request, res: Response) => {
  try {
    const { userWallet, otherWallet } = req.params;
    const { limit = 100 } = req.query;

    const messages = await socialService.getMessages(
      userWallet,
      otherWallet,
      parseInt(limit as string)
    );

    res.json({ success: true, messages });
  } catch (error: any) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

/**
 * GET /api/social/messages/unread/:wallet
 * Get unread message count
 */
router.get('/messages/unread/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const count = await socialService.getUnreadCount(wallet);

    res.json({ success: true, count });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
});

// ============================================
// USER PREFERENCES
// ============================================

/**
 * GET /api/social/preferences/:wallet
 * Get user preferences
 */
router.get('/preferences/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const preferences = await socialService.getPreferences(wallet);

    res.json({ success: true, preferences });
  } catch (error: any) {
    console.error('Error getting preferences:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

/**
 * PUT /api/social/preferences/:wallet
 * Update user preferences
 */
router.put('/preferences/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const preferences = req.body;

    const result = await socialService.updatePreferences(wallet, preferences);

    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// ============================================
// USER SEARCH
// ============================================

/**
 * GET /api/social/search
 * Search for users
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const users = await socialService.searchUsers(q as string, parseInt(limit as string));

    res.json({ success: true, users });
  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;
