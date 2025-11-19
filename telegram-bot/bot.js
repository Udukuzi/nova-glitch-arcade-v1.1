// Nova Arcade Glitch Telegram Bot
require('dotenv').config(); // Load .env file

const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const QRCode = require('qrcode');
const fs = require('fs');

// Initialize bot with token
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!BOT_TOKEN || BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
  console.error('❌ TELEGRAM_BOT_TOKEN is missing. Create telegram-bot/.env and set TELEGRAM_BOT_TOKEN=your_actual_token');
  process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// API endpoints
const API_URL = process.env.API_URL || 'http://localhost:5178';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://novarcadeglitch.dev';

// Helper to add Telegram parameter to URLs
function getTelegramUrl(path = '', extraParams = {}) {
  const url = new URL(path, WEBAPP_URL);
  url.searchParams.set('tg', '1');
  Object.entries(extraParams).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

// Game data
const games = [
  { id: 'snake', name: '🐍 Snake Classic', entry: '5 USDC' },
  { id: 'flappy', name: '🐤 Flappy Nova', entry: '5 USDC' },
  { id: 'memory', name: '🧠 Memory Match', entry: '5 USDC' },
  { id: 'bonk', name: '🏍️ Bonk Ryder', entry: '10 USDC' },
  { id: 'pacman', name: '👾 PacCoin Rush', entry: '10 USDC' },
  { id: 'tetris', name: '🎮 TetraMem', entry: '10 USDC' }
];

// Battle modes
const battleModes = [
  { id: '1v1', name: '⚔️ 1v1 Duel', entry: '10 USDC', prize: '180 NAG' },
  { id: 'team', name: '👥 Team Battle', entry: '5 USDC', prize: '90 NAG' },
  { id: 'tournament', name: '🏆 Tournament', entry: '50 USDC', prize: '5000 NAG' },
  { id: 'propool', name: '💎 Pro Pool', entry: '100 USDC', prize: '50K+ NAG' }
];

// User sessions with trial tracking
const userSessions = new Map();
const userTrials = new Map(); // Track trials per user
const TRIALS_FILE = './trials.json';

// Load trials from file on startup
function loadTrials() {
  try {
    if (fs.existsSync(TRIALS_FILE)) {
      const data = fs.readFileSync(TRIALS_FILE, 'utf8');
      const trialsData = JSON.parse(data);
      Object.entries(trialsData).forEach(([userId, trials]) => {
        userTrials.set(userId, trials);
      });
      console.log(`✅ Loaded ${userTrials.size} user trials from file`);
    }
  } catch (error) {
    console.error('❌ Error loading trials:', error);
  }
}

// Save trials to file
function saveTrials() {
  try {
    const trialsData = {};
    userTrials.forEach((trials, userId) => {
      trialsData[userId] = trials;
    });
    fs.writeFileSync(TRIALS_FILE, JSON.stringify(trialsData, null, 2));
    console.log(`💾 Saved ${userTrials.size} user trials to file`);
  } catch (error) {
    console.error('❌ Error saving trials:', error);
  }
}

// Load trials on startup
loadTrials();

// Session tokens for secure trial validation
const sessionTokens = new Map();

// Generate secure session token
function generateSecureToken(userId, gameId) {
  const token = `${userId}_${gameId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const hashedToken = require('crypto').createHash('sha256').update(token).digest('hex');
  
  // Store token with expiration (5 minutes)
  sessionTokens.set(hashedToken, {
    userId,
    gameId,
    created: Date.now(),
    used: false
  });
  
  // Clean up expired tokens
  setTimeout(() => {
    sessionTokens.delete(hashedToken);
  }, 5 * 60 * 1000); // 5 minutes
  
  return hashedToken;
}

// Validate session token (API endpoint for frontend)
function validateSessionToken(token, userId, gameId) {
  const session = sessionTokens.get(token);
  
  if (!session) {
    console.log(`❌ Invalid session token: ${token}`);
    return false;
  }
  
  if (session.used) {
    console.log(`❌ Session token already used: ${token}`);
    return false;
  }
  
  if (session.userId !== userId || session.gameId !== gameId) {
    console.log(`❌ Session token mismatch: ${token}`);
    return false;
  }
  
  const now = Date.now();
  if (now - session.created > 5 * 60 * 1000) { // 5 minutes
    console.log(`❌ Session token expired: ${token}`);
    sessionTokens.delete(token);
    return false;
  }
  
  // Mark as used
  session.used = true;
  console.log(`✅ Session token validated: ${token}`);
  return true;
}

// Helper function to check trials
function getUserTrials(userId) {
  if (!userTrials.has(userId)) {
    userTrials.set(userId, { count: 0, games: [], lastReset: Date.now() });
    console.log(`🆕 New user ${userId} - Trials: 3/3`);
  }
  return userTrials.get(userId);
}

function incrementTrial(userId, gameId) {
  const trials = getUserTrials(userId);
  trials.count++;
  trials.games.push({ gameId, timestamp: Date.now() });
  userTrials.set(userId, trials);
  saveTrials(); // Save after each increment
  console.log(`📊 User ${userId} - Trial ${trials.count}/3 used (${gameId})`);
  return trials.count;
}

function hasTrialsRemaining(userId) {
  const trials = getUserTrials(userId);
  const hasTrials = trials.count < 3;
  console.log(`🔍 User ${userId} - Has trials: ${hasTrials} (${trials.count}/3 used)`);
  return hasTrials;
}

function getTrialsRemaining(userId) {
  const trials = getUserTrials(userId);
  const remaining = Math.max(0, 3 - trials.count);
  console.log(`📈 User ${userId} - Trials remaining: ${remaining}/3`);
  return remaining;
}

// Start command
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username || ctx.from.first_name;
  const trialsRemaining = getTrialsRemaining(userId);
  const hasTrials = hasTrialsRemaining(userId);
  
  // Welcome message
  await ctx.reply(
    `
🎮 *Welcome to Nova Arcade Glitch!* 🎮

Hey ${username}! Ready to play arcade games and win crypto? 🚀

*What you can do:*
• 🎯 Play 6 classic arcade games
• ⚔️ Battle other players for crypto
• 💱 Swap tokens instantly
• 🏆 Check leaderboards
• 💰 Manage your $NAG tokens

${hasTrials ? `\n🎮 *Free Trials: ${trialsRemaining}/3 remaining*` : `\n🔒 *Free trials used - Connect wallet to play!*`}

*Get started:*
Use /menu to see all options
Use /play to start gaming
Use /battle for PvP competitions

_AI Anti-Cheat Active_ ✅
    `,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        hasTrials 
          ? [Markup.button.callback('🎮 Play Games', 'games')]
          : [Markup.button.webApp('🔗 Connect Wallet', getTelegramUrl('/', { connect: 'true' }))],
        [Markup.button.callback('📊 Stats', hasTrials ? 'stats' : 'trial_stats'), Markup.button.callback('💰 Balance', 'balance')]
      ])
    }
  );
  
  // Store user session
  userSessions.set(userId, { username, startTime: Date.now() });
});

// Menu command
bot.command('menu', async (ctx) => {
  await ctx.reply(
    '*🎮 Nova Arcade Menu*',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎯 Play Games', 'games')],
        [Markup.button.callback('⚔️ Battle Arena', 'battle')],
        [Markup.button.callback('💱 Swap Tokens', 'swap')],
        [Markup.button.callback('🏆 Leaderboard', 'leaderboard')],
        [Markup.button.callback('💰 My Balance', 'balance')],
        [Markup.button.callback('📊 My Stats', 'stats')],
        [Markup.button.webApp('🌐 Open App', getTelegramUrl())]
      ])
    }
  );
});

// Play command with trial gating
bot.command('play', async (ctx) => {
  const userId = ctx.from.id;
  const trialsRemaining = getTrialsRemaining(userId);
  
  // Check if trials exceeded
  if (!hasTrialsRemaining(userId)) {
    await ctx.reply(
      '*🔒 Trial Limit Reached*\n\n' +
      'You\'ve used your 3 free plays! 🎮\n\n' +
      '✨ Connect your wallet to:\n' +
      '• Play unlimited games\n' +
      '• Compete for crypto prizes\n' +
      '• Access Battle Arena\n' +
      '• Earn $NAG tokens',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🔗 Connect Wallet', getTelegramUrl('/', { connect: 'true' }))],
          [Markup.button.callback('📊 My Stats', 'trial_stats')],
          [Markup.button.callback('❓ Why Connect?', 'why_connect')]
        ])
      }
    );
    return;
  }
  
  const gameButtons = games.map(game => 
    [Markup.button.callback(`${game.name}`, `play_${game.id}`)]
  );
  
  gameButtons.push([Markup.button.webApp('🌐 Open Full App', getTelegramUrl())]);
  
  await ctx.reply(
    `*🎯 Choose a Game:*\n\n` +
    `🎮 Free plays remaining: *${trialsRemaining}/3*\n\n` +
    `_Connect wallet for unlimited access & prizes!_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(gameButtons)
    }
  );
});

// Battle command
bot.command('battle', async (ctx) => {
  const modeButtons = battleModes.map(mode => 
    [Markup.button.callback(`${mode.name} (${mode.entry})`, `battle_${mode.id}`)]
  );
  
  await ctx.reply(
    '*⚔️ Battle Arena Modes:*\n\n_Entry in USDC, prizes in $NAG tokens!_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(modeButtons)
    }
  );
});

// Handle game selection with trial tracking
bot.action(/^play_(.+)$/, async (ctx) => {
  const gameId = ctx.match[1];
  const game = games.find(g => g.id === gameId);
  const userId = ctx.from.id;
  
  if (game) {
    // Check trials before allowing play
    if (!hasTrialsRemaining(userId)) {
      await ctx.answerCbQuery('❌ No trials remaining!');
      await ctx.reply(
        '*🔒 Trial Limit Reached*\n\n' +
        'Connect your wallet to continue playing!',
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp('🔗 Connect Wallet', getTelegramUrl('/', { connect: 'true' }))]
          ])
        }
      );
      return;
    }
    
    // Generate secure session token for this play session
    const sessionToken = generateSecureToken(userId, gameId);
    
    // Increment trial count BEFORE generating link
    const trialCount = incrementTrial(userId, gameId);
    const trialsRemaining = getTrialsRemaining(userId);
    
    // Generate game link with secure session token
    const gameLink = getTelegramUrl('/', { game: gameId, tg_user: ctx.from.id, session: sessionToken, trial: trialCount });
    
    await ctx.answerCbQuery(`✅ Trial ${trialCount}/3 used`);
    
    if (trialsRemaining === 0) {
      // Last trial
      await ctx.reply(
        `*${game.name}*\n\n` +
        `🎉 This is your *last free play!*\n\n` +
        `Entry Fee: ${game.entry}\n\n` +
        `💡 Connect your wallet after this game to:\n` +
        `• Continue playing\n` +
        `• Compete for prizes\n` +
        `• Earn $NAG tokens`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp(`🎮 Play ${game.name}`, gameLink)],
            [Markup.button.callback('🔗 Connect Wallet', 'connect_wallet')]
          ])
        }
      );
    } else if (trialsRemaining === 1) {
      // Second trial
      await ctx.reply(
        `*${game.name}*\n\n` +
        `Entry Fee: ${game.entry}\n` +
        `Free plays left: *${trialsRemaining}/3*\n\n` +
        `⚠️ Only 1 free play remaining after this!`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp(`🎮 Play ${game.name}`, gameLink)],
            [Markup.button.callback('🔗 Connect Now', 'connect_wallet')]
          ])
        }
      );
    } else {
      // First trial
      await ctx.reply(
        `*${game.name}*\n\n` +
        `Entry Fee: ${game.entry}\n` +
        `Free plays left: *${trialsRemaining}/3*\n\n` +
        `Click below to start playing!`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp(`🎮 Play ${game.name}`, gameLink)]
          ])
        }
      );
    }
  }
});

// Handle battle mode selection
bot.action(/^battle_(.+)$/, async (ctx) => {
  const modeId = ctx.match[1];
  const mode = battleModes.find(m => m.id === modeId);
  
  if (mode) {
    await ctx.answerCbQuery();
    await ctx.reply(
      `*${mode.name}*\n\nEntry: ${mode.entry}\nPrize Pool: ${mode.prize}\n\n_AI Anti-Cheat Enabled_`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('✅ Join Match', `join_${modeId}`)],
          [Markup.button.callback('❌ Cancel', 'cancel')]
        ])
      }
    );
  }
});

// Balance check
bot.action('balance', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    // Mock balance for demo (replace with API call)
    const balance = {
      nag: 1000,
      usdc: 50,
      usdt: 25
    };
    
    await ctx.answerCbQuery();
    await ctx.reply(
      `*💰 Your Balance:*\n\n🎮 NAG: ${balance.nag}\n💵 USDC: ${balance.usdc}\n💚 USDT: ${balance.usdt}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('💱 Swap', 'swap')],
          [Markup.button.callback('📥 Deposit', 'deposit')]
        ])
      }
    );
  } catch (error) {
    await ctx.reply('Error fetching balance. Please try again.');
  }
});

// Stats check
bot.action('stats', async (ctx) => {
  const userId = ctx.from.id;
  
  try {
    // Mock stats for demo (replace with API call)
    const stats = {
      gamesPlayed: 42,
      wins: 18,
      earnings: '850 NAG',
      rank: '#127'
    };
    
    await ctx.answerCbQuery();
    await ctx.reply(
      `*📊 Your Stats:*\n\n🎮 Games: ${stats.gamesPlayed}\n🏆 Wins: ${stats.wins}\n💰 Earnings: ${stats.earnings}\n🥇 Rank: ${stats.rank}`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.callback('🏆 Full Leaderboard', 'leaderboard')]
        ])
      }
    );
  } catch (error) {
    await ctx.reply('Error fetching stats. Please try again.');
  }
});

// Swap interface
bot.action('swap', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '*💱 Token Swap*\n\nSwap between NAG, USDC, USDT, and SOL',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔄 Open Swap', getTelegramUrl('/swap'))],
        [Markup.button.callback('📊 View Rates', 'rates')]
      ])
    }
  );
});

// Leaderboard
bot.action('leaderboard', async (ctx) => {
  try {
    // Mock leaderboard (replace with API call)
    const leaders = [
      '🥇 @cryptoKing - 5420 NAG',
      '🥈 @gamer123 - 4850 NAG',
      '🥉 @proPlayer - 3920 NAG'
    ].join('\n');
    
    await ctx.answerCbQuery();
    await ctx.reply(
      `*🏆 Top Players:*\n\n${leaders}\n\n_Your rank: #127_`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('📊 Full Leaderboard', getTelegramUrl('/leaderboard'))]
        ])
      }
    );
  } catch (error) {
    await ctx.reply('Error loading leaderboard.');
  }
});

// Deposit handler
bot.action('deposit', async (ctx) => {
  const userId = ctx.from.id;
  const depositAddress = 'YOUR_SOLANA_ADDRESS'; // Replace with actual address
  
  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(depositAddress);
  
  await ctx.answerCbQuery();
  await ctx.replyWithPhoto(
    { url: qrCodeUrl },
    {
      caption: `*📥 Deposit USDC/USDT*\n\nSend to this address:\n\`${depositAddress}\`\n\n_Network: Solana_\n_Min deposit: 5 USDC_`,
      parse_mode: 'Markdown'
    }
  );
});

// Trial stats
bot.action('trial_stats', async (ctx) => {
  const userId = ctx.from.id;
  const trials = getUserTrials(userId);
  const gamesPlayed = trials.games.map(g => {
    const game = games.find(gm => gm.id === g.gameId);
    return game ? game.name : g.gameId;
  }).join('\n• ');
  
  await ctx.answerCbQuery();
  await ctx.reply(
    `*📊 Your Trial Stats:*\n\n` +
    `🎮 Games played: *${trials.count}/3*\n` +
    `🔒 Status: ${trials.count >= 3 ? '❌ Exhausted' : '✅ Active'}\n\n` +
    (trials.games.length > 0 ? `*Games you tried:*\n• ${gamesPlayed}\n\n` : '') +
    `_Connect wallet for unlimited access and prizes!_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔗 Connect Wallet', getTelegramUrl('/', { connect: 'true' }))],
        [Markup.button.callback('🔙 Back to Menu', 'menu')]
      ])
    }
  );
});

// Connect wallet handler
bot.action('connect_wallet', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '*🔗 Connect Your Wallet*\n\n' +
    '✨ *Supported Wallets:*\n' +
    '• 👻 Phantom (Solana)\n' +
    '• ☀️ Solflare (Solana)\n' +
    '• 🦊 MetaMask (EVM)\n' +
    '• 🛡️ Trust Wallet\n' +
    '• 🎒 Backpack\n\n' +
    '*Benefits:*\n' +
    '✅ Unlimited gaming\n' +
    '✅ Compete for crypto prizes\n' +
    '✅ Earn $NAG tokens\n' +
    '✅ Access Battle Arena\n' +
    '✅ Join leaderboards\n\n' +
    '_Click below to connect and unlock everything!_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔗 Connect Now', getTelegramUrl('/', { connect: 'true' }))],
        [Markup.button.callback('❓ Why Connect?', 'why_connect')]
      ])
    }
  );
});

// Why connect handler
bot.action('why_connect', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '*❓ Why Connect Your Wallet?*\n\n' +
    '*Security:*\n' +
    '🔒 No passwords needed\n' +
    '🔒 You control your funds\n' +
    '🔒 Sign transactions only\n\n' +
    '*Benefits:*\n' +
    '💰 Win real crypto prizes\n' +
    '🎮 Unlimited game access\n' +
    '🏆 Compete in tournaments\n' +
    '📊 Track your earnings\n' +
    '🎯 Access Battle Arena\n\n' +
    '*How it works:*\n' +
    '1. Click "Connect Wallet"\n' +
    '2. Choose your wallet\n' +
    '3. Approve connection\n' +
    '4. Start playing!\n\n' +
    '_Your wallet = Your gaming account_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔗 Connect Wallet', getTelegramUrl('/', { connect: 'true' }))],
        [Markup.button.callback('🔙 Back', 'menu')]
      ])
    }
  );
});

// Menu callback
bot.action('menu', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '*🎮 Nova Arcade Menu*',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('🎯 Play Games', 'games')],
        [Markup.button.callback('⚔️ Battle Arena', 'battle')],
        [Markup.button.callback('💱 Swap Tokens', 'swap')],
        [Markup.button.callback('🏆 Leaderboard', 'leaderboard')],
        [Markup.button.callback('💰 My Balance', 'balance')],
        [Markup.button.callback('📊 My Stats', 'stats')],
        [Markup.button.webApp('🌐 Open App', getTelegramUrl())]
      ])
    }
  );
});

// Games callback
bot.action('games', async (ctx) => {
  await ctx.answerCbQuery();
  const userId = ctx.from.id;
  const trialsRemaining = getTrialsRemaining(userId);
  
  if (!hasTrialsRemaining(userId)) {
    await ctx.reply(
      '*🔒 Trial Limit Reached*\n\n' +
      'Connect your wallet to continue playing!',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🔗 Connect Wallet', getTelegramUrl('/', { connect: 'true' }))],
          [Markup.button.callback('📊 My Stats', 'trial_stats')]
        ])
      }
    );
    return;
  }
  
  const gameButtons = games.map(game => 
    [Markup.button.callback(`${game.name}`, `play_${game.id}`)]
  );
  
  await ctx.reply(
    `*🎯 Choose a Game:*\n\n` +
    `Free plays remaining: *${trialsRemaining}/3*`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(gameButtons)
    }
  );
});

// Help command
bot.help((ctx) => {
  ctx.reply(`
*🎮 Nova Arcade Commands:*

/start - Welcome message
/menu - Main menu
/play - Choose a game (3 free trials)
/battle - PvP competitions
/balance - Check balance
/stats - Your statistics
/help - This message

*Trial System:*
🎮 3 free plays to try games
🔗 Connect wallet for unlimited access

*Support:* @NovaArcadeSupport
  `, { parse_mode: 'Markdown' });
});

// Error handler
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err);
  ctx.reply('An error occurred. Please try again or contact support.');
});

// Launch bot
bot.launch({
  webhook: process.env.WEBHOOK_URL ? {
    domain: process.env.WEBHOOK_URL,
    port: process.env.PORT || 3000
  } : undefined
});

console.log('🤖 Nova Arcade Telegram Bot is running!');
console.log('📊 Trial gating system: ACTIVE');
console.log('🔒 Secure session tokens: ENABLED');
console.log('💾 Trials will be saved to: trials.json');

// API endpoint for session validation (if running as web server)
if (process.env.WEBHOOK_URL) {
  const express = require('express');
  const app = express();
  app.use(express.json());
  
  // Validate session endpoint
  app.post('/validate-session', (req, res) => {
    const { token, userId, gameId } = req.body;
    
    if (!token || !userId || !gameId) {
      return res.status(400).json({ valid: false, error: 'Missing parameters' });
    }
    
    const isValid = validateSessionToken(token, parseInt(userId), gameId);
    res.json({ valid: isValid });
  });
  
  // Get trial status endpoint
  app.get('/trial-status/:userId', (req, res) => {
    const userId = req.params.userId;
    const trials = getUserTrials(userId);
    const remaining = getTrialsRemaining(userId);
    
    res.json({
      used: trials.count,
      remaining: remaining,
      total: 3,
      hasTrials: hasTrialsRemaining(userId)
    });
  });
  
  const port = process.env.BOT_API_PORT || 3001;
  app.listen(port, () => {
    console.log(`🌐 Bot API server running on port ${port}`);
  });
}

// Enable graceful stop with trial saving
process.once('SIGINT', () => {
  console.log('\n💾 Saving trials before shutdown...');
  saveTrials();
  bot.stop('SIGINT');
});
process.once('SIGTERM', () => {
  console.log('\n💾 Saving trials before shutdown...');
  saveTrials();
  bot.stop('SIGTERM');
});
