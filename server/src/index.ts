import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import jwt from 'jsonwebtoken';
import supabase from './db';
import x402Routes from './x402-routes';
import battleArenaRoutes from './battle-arena-routes';
import jupiterRoutes from './jupiter-routes';
import activityRoutes from './activity-routes';
import achievementRoutes from './achievement-routes';
import leaderboardRoutes from './leaderboard-routes';
import migrationRoutes from './migration-routes';
import profileRoutes from './profile-routes';
import referralRoutes from './referral-routes';
import tournamentRoutes from './tournament-routes';
import paymentRoutes from './payment-routes';
import aiMonitoringRoutes from './ai-monitoring-routes';
import socialRoutes from './social-routes';
import PayoutProcessor from './payout-processor';

dotenv.config();
const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://nova-arcade.vercel.app', 'https://nova-arcade.netlify.app', /.+\.netlify\.app$/, 'https://novarcadeglitch.dev'] 
    : true,
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later'
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (shorter window)
  max: process.env.NODE_ENV === 'production' ? 200 : 10000, // 10k for dev, 200 for prod
  message: 'Too many requests, please slow down'
});

app.use(express.json());

// Apply rate limiters to specific routes
app.use('/api/auth', authLimiter);
// Only apply API rate limiter in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
  console.log('✅ Rate limiting enabled for production');
} else {
  console.log('⚠️ Rate limiting disabled for development');
}

// x402 betting routes
app.use('/api/x402', x402Routes);

// Battle Arena demo routes
app.use('/api/battle-arena', battleArenaRoutes);

// Jupiter swap routes
app.use('/api/jupiter', jupiterRoutes);

// Activity tracking routes (player count, activity feed)
app.use('/api', activityRoutes);

// Achievement system routes
app.use('/api/achievements', achievementRoutes);

// Leaderboard routes (global & per-game)
app.use('/api/leaderboard', leaderboardRoutes);

// Migration routes (one-time fixes)
app.use('/api/migrate', migrationRoutes);

// User Profile routes
app.use('/api/profile', profileRoutes);

// Referral Program routes
app.use('/api/referral', referralRoutes);

// Tournament System routes
app.use('/api/tournaments', tournamentRoutes);

// Payment Dashboard routes
app.use('/api/payments', paymentRoutes);

// AI Monitoring & Anti-Cheat routes
app.use('/api/ai', aiMonitoringRoutes);

// Social Features routes
app.use('/api/social', socialRoutes);

// Optional: Early access test gate
const TEST_ACCESS_PASSWORD = process.env.TEST_ACCESS_PASSWORD || '';
const ALLOWED_TEST_ADDRESSES = (process.env.ALLOWED_TEST_ADDRESSES || '')
  .split(',')
  .map(s => s.trim().toLowerCase())
  .filter(Boolean);

function testAccessGate(req: any, res: any, next: any) {
  if (!TEST_ACCESS_PASSWORD) return next(); // gate disabled
  const pw = req.headers['x-test-password'] || req.query?.test_password;
  const addr = (req as any).auth?.address?.toLowerCase?.();
  if (pw === TEST_ACCESS_PASSWORD) return next();
  if (addr && ALLOWED_TEST_ADDRESSES.includes(addr)) return next();
  return res.status(403).json({ error: 'test_access_required' });
}

const PORT = process.env.PORT || 5178;
const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org/';
const SOL_RPC = process.env.SOL_RPC || 'https://api.mainnet-beta.solana.com';

let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'change_me') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to a secure random string in production');
  }
  // Development fallback - generate a temporary secret
  JWT_SECRET = 'dev-secret-' + Math.random().toString(36).slice(2);
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using temporary development secret. This is insecure for production!');
}
const MIN_HOLD = Number(process.env.MIN_HOLD || '50000'); // token units (adjust for decimals)
const MIN_STAKE = Number(process.env.MIN_STAKE || '250000');

// helper: generate nonce
function makeNonce() {
  return 'nova-' + Math.random().toString(36).slice(2, 12) + '-' + Date.now().toString(36);
}

// create nonce for address (upsert)
app.post('/api/auth/nonce', async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ error: 'address required' });
  try {
    const nonce = makeNonce();
    const expires = new Date(Date.now() + 5*60*1000).toISOString(); // 5 minutes
    await supabase.from('profiles').upsert({ address: address.toLowerCase(), nonce, nonce_expires: expires }, { onConflict: 'address' });
    return res.json({ nonce, expires });
  } catch (e:any) {
    console.error('nonce error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// verify signature and issue JWT
app.post('/api/auth/verify', async (req, res) => {
  const { chain, address, signature } = req.body;
  if (!chain || !address || !signature) return res.status(400).json({ error: 'missing params' });
  try {
    // fetch nonce
    const { data: profile } = await supabase.from('profiles').select('nonce,nonce_expires').eq('address', address.toLowerCase()).single();
    const nonce = profile?.nonce;
    const expires = profile?.nonce_expires ? new Date(profile.nonce_expires) : null;
    if (!nonce || !expires || expires < new Date()) {
      return res.status(400).json({ error: 'nonce_invalid' });
    }
    const message = nonce;
    let valid = false;
    if (chain === 'bnb') {
      // ethers verify
      try {
        const signer = ethers.verifyMessage(message, signature);
        valid = signer.toLowerCase() === address.toLowerCase();
      } catch(e) { valid = false; }
    } else if (chain === 'solana') {
      try {
        // solana signature expected base58
        const sigBytes = (()=>{ try{ return bs58.decode(signature); }catch(e){ return Buffer.from(signature,'base64'); } })();
        const msg = Buffer.from(message);
        const pk = new PublicKey(address);
        valid = nacl.sign.detached.verify(msg, sigBytes, pk.toBuffer());
      } catch(e) { valid = false; }
    }
    if (!valid) return res.status(400).json({ error: 'invalid_signature' });
    // update profile verified, clear nonce, set last login
    await supabase.from('profiles').upsert({ address: address.toLowerCase(), nonce: null, nonce_expires: null, updated_at: new Date().toISOString() });
    // issue JWT
    const token = jwt.sign({ address: address.toLowerCase(), chain }, JWT_SECRET, { expiresIn: '7d' }); // Changed to 7 days for better UX
    return res.json({ token, address: address.toLowerCase() });
  } catch (e:any) {
    console.error('verify error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// balance check endpoint (server canonical)
app.get('/api/balance/check/:chain/:address/:token', async (req, res) => {
  const { chain, address, token } = req.params;
  try {
    if (chain === 'bnb') {
      const provider = new ethers.JsonRpcProvider(BSC_RPC);
      const contract = new ethers.Contract(token, ['function balanceOf(address) view returns (uint256)'], provider);
      const bal = await contract.balanceOf(address);
      const balStr = bal.toString();
      const is_holder = BigInt(balStr) >= BigInt(Number(process.env.MIN_HOLD || MIN_HOLD)) * BigInt(10)**BigInt(process.env.TOKEN_DECIMALS || 18);
      // update profile holder flag
      await supabase.from('profiles').upsert({ address: address.toLowerCase(), is_holder });
      return res.json({ balance: balStr, is_holder });
    } else if (chain === 'solana') {
      const conn = new Connection(SOL_RPC, 'confirmed');
      const owner = new PublicKey(address);
      const mint = new PublicKey(token);
      const resp = await conn.getTokenAccountsByOwner(owner, { mint });
      let uiAmount = 0;
      if (resp.value && resp.value.length) {
        const info = await conn.getParsedAccountInfo(resp.value[0].pubkey);
        const parsed = (info.value?.data as any)?.parsed;
        if (parsed && parsed.info && parsed.info.tokenAmount) uiAmount = parsed.info.tokenAmount.uiAmount || 0;
      }
      const is_holder = uiAmount >= Number(process.env.MIN_HOLD || MIN_HOLD);
      await supabase.from('profiles').upsert({ address: address.toLowerCase(), is_holder });
      return res.json({ balance: uiAmount, is_holder });
    } else {
      return res.status(400).json({ error: 'unsupported_chain' });
    }
  } catch (e:any) {
    console.error('balance check error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// trials: use a trial (requires JWT authorization header)
function authMiddleware(req:any,res:any,next:any){
  const auth = req.headers?.authorization;
  if (!auth) return res.status(401).json({ error: 'missing_auth' });
  const token = auth.split(' ')[1];
  try {
    const decoded:any = jwt.verify(token, JWT_SECRET!);
    (req as any).auth = decoded;
    return next();
  } catch(e:any){ return res.status(401).json({ error: 'invalid_token' }); }
}

app.post('/api/trials/use', authMiddleware, testAccessGate, async (req, res) => {
  const address = (req as any).auth?.address;
  if (!address) return res.status(400).json({ error: 'missing_address' });
  try {
    // use trials table; atomic increment recommended via RPC; we'll do safe read+update
    const { data } = await supabase.from('trials').select('plays_used').eq('address', address).single();
    let used = data?.plays_used || 0;
    if (!data) {
      // create profile if not exists
      await supabase.from('profiles').upsert({ address });
      await supabase.from('trials').insert({ address, plays_used: 1 });
      used = 1;
    } else {
      used += 1;
      await supabase.from('trials').update({ plays_used: used, last_play: new Date().toISOString() }).eq('address', address);
    }
    const remaining = Math.max(0, 3 - used);
    const locked = used >= 3;
    return res.json({ remaining, used, locked });
  } catch (e:any) {
    console.error('trials use error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// session start/end and reward claim endpoints
app.post('/api/session/start', authMiddleware, testAccessGate, async (req, res) => {
  const address = (req as any).auth?.address;
  const { game } = req.body;
  try {
    const { data, error } = await supabase.from('sessions').insert({ address, game }).select('id,started_at').single();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(500).json({ error: 'session_create_failed' });
    return res.json({ session_id: data.id, started_at: (data as any).started_at });
  } catch (e:any) {
    console.error('session start error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Multiplier calculation based on tier
function getMultiplier(tier: string, stakedAmount: number): number {
  const stake = Number(stakedAmount || 0);
  const WHALE_THRESHOLD = Number(process.env.WHALE_THRESHOLD || 1000000);
  
  if (tier === 'whale' || stake >= WHALE_THRESHOLD) return 3.0;  // 3x for whales
  if (tier === 'staker' || stake >= Number(process.env.MIN_STAKE || MIN_STAKE)) return 2.0;  // 2x for stakers
  if (tier === 'holder') return 1.5;  // 1.5x for token holders
  return 1.0;  // 1x for guests
}

app.post('/api/session/end', authMiddleware, testAccessGate, async (req, res) => {
  const address = (req as any).auth?.address;
  const { session_id, score } = req.body;
  try {
    // Get user profile with tier and staked amount
    const prof = await supabase.from('profiles').select('tier, staked_amount').eq('address', address).single();
    const tier = prof.data?.tier || 'guest';
    const stakedAmount = Number(prof.data?.staked_amount || 0);
    
    // Calculate multiplier based on tier and staked amount
    const multiplier = getMultiplier(tier, stakedAmount);
    const finalScore = Math.floor(Number(score) * multiplier);
    
    // Update session with final score
    await supabase.from('sessions').update({ 
      ended_at: new Date().toISOString(), 
      score: finalScore 
    }).eq('id', session_id);
    
    const rewardEligible = finalScore > 100; // example threshold
    return res.json({ 
      rewardEligible, 
      multiplier, 
      tier,
      originalScore: score,
      finalScore 
    });
  } catch (e:any) {
    console.error('session end error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// stake update endpoint (admin or signed on-chain verification)
app.post('/api/stake/update', authMiddleware, testAccessGate, async (req, res) => {
  const address = (req as any).auth?.address;
  const { amount, tx_hash, chain } = req.body;
  try {
    await supabase.from('stakes').upsert({ address, amount, tx_hash, chain });
    // update profile stake amount and tier
    const isStaker = Number(amount) >= Number(process.env.MIN_STAKE || MIN_STAKE);
    await supabase.from('profiles').upsert({ address, staked_amount: amount, is_staker: isStaker, tier: isStaker ? 'staker' : 'holder' });
    return res.json({ ok: true, is_staker: isStaker });
  } catch (e:any) {
    console.error('stake update error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Leaderboard (overall)
app.get('/api/leaderboard', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('address, game, score')
      .not('score', 'is', null);

    if (error) return res.status(500).json({ error: error.message });

    const byUser = new Map<string, number>();
    for (const row of (data as any[]) || []) {
      const addr = (row as any).address?.toLowerCase?.() || (row as any).address;
      const score = Number((row as any).score || 0);
      byUser.set(addr, Math.max(byUser.get(addr) || 0, score));
    }

    const leaderboard = Array.from(byUser.entries())
      .map(([address, score]) => ({ address, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return res.json({ leaderboard });
  } catch (e:any) {
    console.error('leaderboard error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Leaderboard per game
app.get('/api/leaderboard/:game', async (req, res) => {
  const { game } = req.params as { game: string };
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('address, score')
      .eq('game', game)
      .not('score', 'is', null);

    if (error) return res.status(500).json({ error: error.message });

    const byUser = new Map<string, number>();
    for (const row of (data as any[]) || []) {
      const addr = (row as any).address?.toLowerCase?.() || (row as any).address;
      const score = Number((row as any).score || 0);
      byUser.set(addr, Math.max(byUser.get(addr) || 0, score));
    }

    const leaderboard = Array.from(byUser.entries())
      .map(([address, score]) => ({ address, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return res.json({ leaderboard, game });
  } catch (e:any) {
    console.error('leaderboard game error', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Health check endpoint with detailed status
app.get('/api/health', async (_req, res) => {
  try {
    // Check database connection
    const { error } = await supabase.from('profiles').select('count').limit(1).single();
    
    const health = {
      status: error ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: error ? 'disconnected' : 'connected',
      version: '1.1.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    res.status(error ? 503 : 200).json(health);
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Service unavailable',
      timestamp: new Date().toISOString()
    });
  }
});

// Production waitlist endpoint
app.post('/api/waitlist/join', async (req, res) => {
  const { email, walletAddress, source } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'Email already on waitlist' });
    }

    // Add to waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert([{
        email,
        wallet_address: walletAddress || null,
        source: source || 'Battle Arena',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    res.json({ 
      success: true, 
      message: 'Successfully joined waitlist',
      id: data.id 
    });
  } catch (error) {
    console.error('Waitlist error:', error);
    res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// Get waitlist stats (public)
app.get('/api/waitlist/stats', async (_req, res) => {
  try {
    const { count, error } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    res.json({ 
      total: count || 0,
      message: `${count || 0} users waiting for Battle Arena launch!`
    });
  } catch (error) {
    console.error('Waitlist stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Nova Arcade Glitch API Server',
    status: 'running',
    version: '1.1.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth/*',
      x402: '/api/x402/*',
      battleArena: '/api/battle-arena/*',
      waitlist: '/api/waitlist/*'
    },
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, ()=>{
  console.log('Nova Arcade Glitch server listening on', PORT);
  
  // Start automatic payout processor
  const payoutProcessor = new PayoutProcessor();
  payoutProcessor.start(30); // Process every 30 seconds
  console.log('💰 Automated payout processor started');
});
