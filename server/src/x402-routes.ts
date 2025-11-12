import express, { Request, Response, NextFunction } from 'express';
import X402BettingAgent from './x402-agent';
import supabase from './db';
import jwt from 'jsonwebtoken';

// Extend Express Request type
interface AuthRequest extends Request {
  auth?: any;
}

const router = express.Router();
const bettingAgent = new X402BettingAgent();

// Middleware to verify JWT
const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const auth = req.headers?.authorization;
  if (!auth) return res.status(401).json({ error: 'missing_auth' });
  const token = auth.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    req.auth = decoded;
    return next();
  } catch (e) { 
    return res.status(401).json({ error: 'invalid_token' }); 
  }
};

// x402 Facilitator endpoint
router.get('/facilitate', async (req, res) => {
  const facilitatorInfo = await bettingAgent.createFacilitatorEndpoint();
  res.json(facilitatorInfo);
});

// Create a betting match
router.post('/bet/create', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { opponent, gameId, amount, currency } = req.body;
    const player1 = req.auth.address;
    
    // Validate inputs
    if (!opponent || !gameId || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create match
    const match = await bettingAgent.createBettingMatch({
      player1,
      player2: opponent,
      gameId,
      betAmount: amount,
      currency: currency as 'USDC' | 'USDT'
    });
    
    // Store in database
    const { error } = await supabase
      .from('betting_matches')
      .insert([match]);
    
    if (error) throw error;
    
    // Generate x402 payment request
    const paymentRequest = await bettingAgent.processX402Payment({
      from: player1,
      to: match.escrowAddress,
      amount: amount,
      currency: currency,
      matchId: match.id
    });
    
    res.set(paymentRequest.headers);
    res.status(402).json({
      match,
      paymentRequest: {
        url: paymentRequest.paymentUrl,
        qr: paymentRequest.qrCode
      }
    });
  } catch (error: any) {
    console.error('Error creating bet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept a betting challenge
router.post('/bet/accept/:matchId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const player2 = req.auth.address;
    
    // Get match from database
    const { data: match, error } = await supabase
      .from('betting_matches')
      .select('*')
      .eq('id', matchId)
      .single();
    
    if (error || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    if (match.status !== 'pending') {
      return res.status(400).json({ error: 'Match already started or completed' });
    }
    
    // Update match status
    const { error: updateError } = await supabase
      .from('betting_matches')
      .update({ 
        status: 'accepted',
        player2Accepted: true 
      })
      .eq('id', matchId);
    
    if (updateError) throw updateError;
    
    // Generate payment request for player 2
    const paymentRequest = await bettingAgent.processX402Payment({
      from: player2,
      to: match.escrowAddress,
      amount: match.betAmount,
      currency: match.currency,
      matchId: matchId
    });
    
    res.set(paymentRequest.headers);
    res.status(402).json({
      message: 'Please complete payment to join match',
      paymentRequest: {
        url: paymentRequest.paymentUrl,
        qr: paymentRequest.qrCode
      }
    });
  } catch (error: any) {
    console.error('Error accepting bet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Settle bet after game completion
router.post('/bet/settle/:matchId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId } = req.params;
    const { scores } = req.body;
    
    // Verify caller is one of the players or system admin
    const { data: match, error } = await supabase
      .from('betting_matches')
      .select('*')
      .eq('id', matchId)
      .single();
    
    if (error || !match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    
    // Determine winner based on scores
    const winner = scores.player1 > scores.player2 ? 'player1' : 'player2';
    
    // Settle the bet
    const settlement = await bettingAgent.settleBet(matchId, winner, scores);
    
    res.json({
      success: true,
      settlement
    });
  } catch (error: any) {
    console.error('Error settling bet:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get active bets for a player
router.get('/bets/active', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const playerAddress = req.auth.address;
    
    const { data: bets, error } = await supabase
      .from('betting_matches')
      .select('*')
      .or(`player1.eq.${playerAddress},player2.eq.${playerAddress}`)
      .in('status', ['pending', 'accepted', 'in_progress']);
    
    if (error) throw error;
    
    res.json({ bets });
  } catch (error: any) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get bet history
router.get('/bets/history', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const playerAddress = req.auth.address;
    
    const { data: bets, error } = await supabase
      .from('betting_matches')
      .select('*')
      .or(`player1.eq.${playerAddress},player2.eq.${playerAddress}`)
      .eq('status', 'settled')
      .order('settledAt', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json({ bets });
  } catch (error: any) {
    console.error('Error fetching bet history:', error);
    res.status(500).json({ error: error.message });
  }
});

// x402 webhook for payment confirmations
router.post('/webhook/x402', async (req, res) => {
  try {
    // Validate x402 signature
    const isValid = await bettingAgent.validateX402Signature(req.headers, req.body);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    const { matchId, paymentId, status, amount, from } = req.body;
    
    // Update match payment status
    const { error } = await supabase
      .from('betting_matches')
      .update({ 
        [`${from === 'player1' ? 'player1' : 'player2'}PaymentStatus`]: status,
        [`${from === 'player1' ? 'player1' : 'player2'}PaymentId`]: paymentId
      })
      .eq('id', matchId);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('x402 webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
