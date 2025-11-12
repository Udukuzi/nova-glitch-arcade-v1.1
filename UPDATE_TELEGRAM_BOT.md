# 🤖 Update Telegram Bot with New Website & Gating

## 📋 Quick Update Steps

### **Step 1: Update the Website URL**

Open `telegram-bot\.env` and change the `WEBAPP_URL`:

```env
# OLD (your first Netlify link)
WEBAPP_URL=https://your-old-site.netlify.app

# NEW (your current website)
WEBAPP_URL=https://novarcadeglitch.dev
```

### **Step 2: Add Trial Gating to Bot**

The bot needs to track trial usage. Update `telegram-bot\bot.js`:

#### **Add Trial Tracking (After line 41)**

```javascript
// User sessions with trial tracking
const userSessions = new Map();
const userTrials = new Map(); // NEW: Track trials per user

// Helper function to check trials
function getUserTrials(userId) {
  if (!userTrials.has(userId)) {
    userTrials.set(userId, { count: 0, games: [] });
  }
  return userTrials.get(userId);
}

function incrementTrial(userId, gameId) {
  const trials = getUserTrials(userId);
  trials.count++;
  trials.games.push({ gameId, timestamp: Date.now() });
  userTrials.set(userId, trials);
  return trials.count;
}
```

#### **Update Play Command (Replace lines 102-115)**

```javascript
// Play command with trial gating
bot.command('play', async (ctx) => {
  const userId = ctx.from.id;
  const trials = getUserTrials(userId);
  
  // Check if trials exceeded
  if (trials.count >= 3) {
    await ctx.reply(
      '*🔒 Trial Limit Reached*\n\n' +
      'You\'ve used your 3 free plays!\n\n' +
      'Connect your wallet to continue playing and compete for prizes.',
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('🔗 Connect Wallet', `${WEBAPP_URL}?connect=true`)],
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
    `Free plays remaining: ${3 - trials.count}/3\n\n` +
    `_Connect wallet for unlimited access_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard(gameButtons)
    }
  );
});
```

#### **Update Game Selection Handler (Replace lines 133-152)**

```javascript
// Handle game selection with trial increment
bot.action(/^play_(.+)$/, async (ctx) => {
  const gameId = ctx.match[1];
  const game = games.find(g => g.id === gameId);
  const userId = ctx.from.id;
  
  if (game) {
    // Increment trial count
    const trialCount = incrementTrial(userId, gameId);
    
    // Generate game link with user ID and trial info
    const gameLink = `${WEBAPP_URL}/game/${gameId}?telegram_id=${ctx.from.id}&trial=${trialCount}`;
    
    await ctx.answerCbQuery();
    
    if (trialCount >= 3) {
      await ctx.reply(
        `*${game.name}*\n\n` +
        `🎉 This is your last free play!\n\n` +
        `Connect your wallet after this game to continue playing.`,
        {
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([
            [Markup.button.webApp(`🎮 Play ${game.name}`, gameLink)],
            [Markup.button.callback('🔗 Connect Wallet', 'connect_wallet')]
          ])
        }
      );
    } else {
      await ctx.reply(
        `*${game.name}*\n\n` +
        `Entry Fee: ${game.entry}\n` +
        `Free plays left: ${3 - trialCount}/3\n\n` +
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
```

#### **Add Trial Stats Handler (Add after line 228)**

```javascript
// Trial stats
bot.action('trial_stats', async (ctx) => {
  const userId = ctx.from.id;
  const trials = getUserTrials(userId);
  
  await ctx.answerCbQuery();
  await ctx.reply(
    `*📊 Your Trial Stats:*\n\n` +
    `🎮 Games played: ${trials.count}/3\n` +
    `🔒 Status: ${trials.count >= 3 ? 'Trials exhausted' : 'Active'}\n\n` +
    `_Connect wallet for unlimited access and prizes!_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔗 Connect Wallet', `${WEBAPP_URL}?connect=true`)]
      ])
    }
  );
});

// Connect wallet handler
bot.action('connect_wallet', async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(
    '*🔗 Connect Your Wallet*\n\n' +
    'Supported wallets:\n' +
    '• Phantom (Solana)\n' +
    '• Solflare (Solana)\n' +
    '• MetaMask (EVM)\n' +
    '• Trust Wallet\n\n' +
    '_Click below to connect and unlock unlimited gaming!_',
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.webApp('🔗 Connect Now', `${WEBAPP_URL}?connect=true`)]
      ])
    }
  );
});
```

---

## 🚀 Quick Update Method (Easiest)

If you don't want to edit the code, just update the `.env` file:

### **1. Open `telegram-bot\.env`**

### **2. Update these lines:**

```env
# Your bot token (keep this the same)
TELEGRAM_BOT_TOKEN=your_existing_token

# Update these URLs to your new site
API_URL=https://your-backend-url.com
WEBAPP_URL=https://novarcadeglitch.dev

# Optional: Add webhook for production
# WEBHOOK_URL=https://your-bot-server.com
# PORT=3000
```

### **3. Restart the bot:**

```bash
cd telegram-bot
node bot.js
```

---

## 🔄 Restart Bot Commands

### **Windows:**

```bash
# Stop current bot (Ctrl+C in the terminal)
# Then restart:
cd telegram-bot
node bot.js
```

### **Or use the batch file:**

```bash
telegram-bot\start-bot-debug.bat
```

---

## ✅ Verify Bot is Updated

### **1. Open Telegram and find your bot**

### **2. Send `/start` command**

### **3. Click "🎮 Play Now" button**

### **4. Should open:** `https://novarcadeglitch.dev`

### **5. Test trial gating:**
- Play a game 3 times
- On 4th attempt, should see "Trial Limit Reached"
- Should prompt to connect wallet

---

## 🎯 Full Code Update (If You Want Complete Gating)

If you want the complete updated `bot.js` with trial gating, I can create it for you. Just let me know!

---

## 📝 Quick Checklist

- [ ] Update `WEBAPP_URL` in `.env` to new website
- [ ] Update `API_URL` if backend changed
- [ ] Restart bot
- [ ] Test `/start` command
- [ ] Test "Play Now" button opens correct URL
- [ ] (Optional) Add trial gating code
- [ ] (Optional) Test trial limits work

---

## 🆘 Troubleshooting

### **Bot doesn't respond:**
```bash
# Check if bot is running
tasklist | findstr node

# Restart bot
cd telegram-bot
node bot.js
```

### **Wrong URL opens:**
- Check `.env` file has correct `WEBAPP_URL`
- Restart bot after changing `.env`
- Clear Telegram cache (Settings → Data and Storage → Clear Cache)

### **Trial gating not working:**
- Make sure you added the trial tracking code
- Restart bot after code changes
- Test with `/play` command

---

## 💡 Pro Tip

For production, use PM2 to keep bot running:

```bash
npm install -g pm2
cd telegram-bot
pm2 start bot.js --name nova-bot
pm2 save
```

---

**Need the full updated bot.js file? Let me know and I'll create it!** 🤖
