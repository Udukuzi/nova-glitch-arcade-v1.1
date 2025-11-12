# 🤖 TELEGRAM BOT INTEGRATION - @NAGTokenBot

## **✅ You Already Have:**
- Bot Name: **@NAGTokenBot**
- Bot Token: Your HTTP API key from BotFather

## **📋 STEP-BY-STEP SETUP**

### **Step 1: Update Bot Configuration**

1. **Create `.env` file in telegram-bot folder:**
```bash
cd telegram-bot
```

2. **Create `.env` file with your token:**
```env
# Replace with your actual bot token from BotFather
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN_HERE

# Your app URLs (update after deployment)
API_URL=http://localhost:5178
WEBAPP_URL=http://localhost:5173

# For production
# API_URL=https://nova-arcade-api.netlify.app
# WEBAPP_URL=https://nova-arcade.netlify.app
```

### **Step 2: Install Dependencies**
```bash
cd telegram-bot
npm install
```

### **Step 3: Configure Bot Commands with BotFather**

Send these messages to @BotFather:
```
/setcommands

Choose @NAGTokenBot

Then paste:
start - Welcome to Nova Arcade
menu - Main menu
play - Choose a game
battle - PvP competitions
balance - Check your balance
stats - View statistics
swap - Token swap interface
help - Get help
```

### **Step 4: Set Bot Description**
```
/setdescription

Choose @NAGTokenBot

Then paste:
🎮 Nova Glitch Arcade Official Bot
Play arcade games and earn crypto! Battle other players in PvP competitions with AI anti-cheat protection.

✅ 6 Classic Games
⚔️ Battle Arena
💱 Token Swap
🏆 Leaderboards
```

### **Step 5: Add Bot Profile Photo**
```
/setuserpic

Choose @NAGTokenBot

Upload the Nova logo image
```

### **Step 6: Test Locally**
```bash
# In telegram-bot folder
node bot.js
```

Now open Telegram and message your bot:
- Send `/start` - Should show welcome message
- Send `/menu` - Should show main menu
- Test all commands

### **Step 7: Add Web App Button**

1. Message BotFather:
```
/newapp

Choose @NAGTokenBot

Title: Nova Arcade
Description: Play & Earn Crypto
Photo: Upload logo
Demo GIF: Skip (or create one)
Web App URL: https://nova-arcade.netlify.app
Short name: nova_arcade
```

---

## **🚀 DEPLOYMENT OPTIONS**

### **Option 1: Railway (Recommended)**

1. **Push bot code to GitHub**
2. **Go to Railway.app**
3. **New Project → Deploy from GitHub**
4. **Select telegram-bot folder**
5. **Add environment variables:**
   - `TELEGRAM_BOT_TOKEN`
   - `API_URL`
   - `WEBAPP_URL`
6. **Deploy!**

### **Option 2: Heroku**

1. **Create `Procfile`:**
```
worker: node bot.js
```

2. **Deploy:**
```bash
heroku create nag-token-bot
heroku config:set TELEGRAM_BOT_TOKEN=your_token
git push heroku main
```

### **Option 3: VPS (Digital Ocean/AWS)**

1. **SSH to server**
2. **Clone repo**
3. **Install Node.js**
4. **Use PM2:**
```bash
npm install -g pm2
pm2 start bot.js --name nag-bot
pm2 save
pm2 startup
```

---

## **🔧 WEBHOOK SETUP (Production)**

For production, use webhooks instead of polling:

### **Step 1: Update bot.js**
```javascript
// Replace bot.launch() with:
if (process.env.WEBHOOK_URL) {
  const webhookUrl = `${process.env.WEBHOOK_URL}/bot${BOT_TOKEN}`;
  bot.telegram.setWebhook(webhookUrl);
  bot.startWebhook(`/bot${BOT_TOKEN}`, null, process.env.PORT || 3000);
} else {
  bot.launch(); // Polling for local dev
}
```

### **Step 2: Set webhook URL**
```bash
# In production .env
WEBHOOK_URL=https://your-bot-server.com
PORT=3000
```

---

## **📱 BOT FEATURES OVERVIEW**

### **Main Commands:**
- `/start` - Welcome message with web app button
- `/menu` - Interactive menu with all options
- `/play` - Game selection menu
- `/battle` - Battle Arena modes
- `/balance` - Check NAG, USDC, USDT balances
- `/stats` - Games played, wins, earnings
- `/swap` - Opens swap interface
- `/help` - Help and support

### **Inline Buttons:**
- 🎮 **Play Now** - Opens web app
- ⚔️ **Battle Arena** - Competition modes
- 💱 **Swap Tokens** - Token exchange
- 🏆 **Leaderboard** - Top players
- 💰 **Balance** - Wallet info

### **Special Features:**
- QR code generation for deposits
- Real-time game notifications
- Match creation/joining
- Automatic result updates

---

## **🔐 SECURITY NOTES**

### **Never commit:**
- Bot token
- API keys
- Database credentials

### **Always use:**
- Environment variables
- HTTPS in production
- Rate limiting
- Input validation

---

## **🧪 TESTING CHECKLIST**

- [ ] Bot responds to /start
- [ ] Menu buttons work
- [ ] Web app opens correctly
- [ ] Balance checks work
- [ ] Game selection works
- [ ] Battle modes display
- [ ] Swap interface opens
- [ ] Help command works

---

## **📊 MONITORING**

### **Track these metrics:**
- Active users
- Command usage
- Error rates
- Response times

### **Use these tools:**
- Bot analytics: @BotStats_bot
- Error tracking: Sentry
- Uptime: UptimeRobot

---

## **🆘 TROUBLESHOOTING**

### **Bot not responding:**
1. Check token is correct
2. Verify bot is running
3. Check network/firewall
4. Review logs for errors

### **Commands not working:**
1. Re-register commands with BotFather
2. Check command handlers in code
3. Verify database connection

### **Web app not opening:**
1. Check WEBAPP_URL is correct
2. Verify HTTPS certificate
3. Test URL in browser first

---

## **YOUR NEXT STEPS:**

1. **Add your bot token to .env**
2. **Run `npm install` in telegram-bot folder**
3. **Start bot with `node bot.js`**
4. **Test all commands in Telegram**
5. **Deploy when ready**

**Your @NAGTokenBot is ready to launch! 🚀**
