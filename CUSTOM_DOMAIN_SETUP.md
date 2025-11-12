# 🌐 CUSTOM DOMAIN SETUP - novarcadeglitch.dev

**Domain**: `novarcadeglitch.dev` ✅  
**Status**: Ready to configure!  
**Time**: 5-10 minutes (+ DNS propagation)

---

## ⚡ QUICK SETUP GUIDE

### **STEP 1: Add Domain in Netlify** (2 min)

1. Open: https://app.netlify.com
2. Click: **brilliant-cucurucho-b92e28**
3. Left sidebar → **"Domain management"**
4. Click green **"Add custom domain"** button
5. Enter: `novarcadeglitch.dev`
6. Click **"Verify"**
7. Popup asks: "Do you own this domain?" → Click **"Yes, add domain"**

---

### **STEP 2: Choose DNS Setup Method**

#### **METHOD A: Netlify DNS** (Recommended - Easiest)

**Pros**: 
- ✅ Automatic configuration
- ✅ Free SSL (HTTPS)
- ✅ Fast propagation
- ✅ Netlify manages everything

**Steps**:
1. In Netlify, click **"Set up Netlify DNS"**
2. Click **"Verify"** then **"Add domain"**
3. Netlify shows 4 nameservers:
   ```
   dns1.p0X.nsone.net
   dns2.p0X.nsone.net
   dns3.p0X.nsone.net
   dns4.p0X.nsone.net
   ```
4. **Copy these 4 nameservers**

5. Go to your domain registrar (where you bought novarcadeglitch.dev)
6. Find **"DNS Settings"** or **"Nameservers"**
7. Change from current nameservers to Netlify's 4 nameservers
8. Save changes
9. Wait 5-30 minutes for propagation

**Done!** Netlify handles the rest automatically ✅

---

#### **METHOD B: External DNS** (Keep Current Registrar's DNS)

**If you want to keep your registrar's DNS**:

1. In Netlify, click **"Set up external DNS"** or skip DNS setup
2. Go to your domain registrar's DNS management
3. Add these records:

**Apex Domain (novarcadeglitch.dev)**:
```
Type:    A
Name:    @ (or leave blank, or use "novarcadeglitch.dev")
Value:   75.2.60.5
TTL:     3600 (or Auto)
```

**WWW Subdomain (www.novarcadeglitch.dev)**:
```
Type:    CNAME
Name:    www
Value:   brilliant-cucurucho-b92e28.netlify.app
TTL:     3600 (or Auto)
```

**Optional - API Subdomain** (if you want api.novarcadeglitch.dev later):
```
Type:    CNAME
Name:    api
Value:   brilliant-cucurucho-b92e28.netlify.app
TTL:     3600
```

4. Save all records
5. Wait 5-30 minutes for DNS propagation

**Then in Netlify**:
1. Go back to Domain management
2. Click **"Verify DNS configuration"**
3. Once verified, Netlify will provision SSL certificate (1-2 min)

---

### **STEP 3: Enable HTTPS** (Automatic)

**After DNS is verified**:

1. In Netlify Domain settings
2. Scroll to **"HTTPS"** section
3. Netlify auto-provisions **Let's Encrypt SSL certificate**
4. Takes 1-2 minutes
5. Once done, you'll see: **"Your site has HTTPS enabled"** ✅

**Enable Force HTTPS**:
1. Toggle **"Force HTTPS"** to ON
2. Redirects all HTTP → HTTPS automatically

---

### **STEP 4: Test Domain** (1 min)

**Check these URLs**:
- https://novarcadeglitch.dev → Should load your arcade ✅
- http://novarcadeglitch.dev → Should redirect to HTTPS ✅
- https://www.novarcadeglitch.dev → Should work ✅

**If not working yet**:
- Wait 5-10 more minutes (DNS propagation)
- Check DNS records are correct
- Use https://dnschecker.org to check propagation

---

### **STEP 5: Update Telegram Bot** ✅ (Already Done!)

Bot updated to use: `https://novarcadeglitch.dev`

**Restart bot**:
```bash
cd telegram-bot
# Stop current bot (Ctrl+C if running)
node bot.js
```

**Test**:
1. Send `/start` to bot
2. Click "🎮 Play Now"
3. Should open: https://novarcadeglitch.dev ✅

---

## 🐦 UPDATED LAUNCH TWEET

```
🚨 $NAG TOKEN IS LIVE! 🚨

First token-gated arcade on Solana 🎮

✨ 7 Classic Games
🔒 100K $NAG = Access
⚔️ Battle Arena (USDC → NAG)
🤖 AI Anti-Cheat (x402)
🔄 Jupiter Swap
📱 Telegram Bot

CA: 957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump

🎮 Play: novarcadeglitch.dev
🤖 Bot: t.me/[YOUR_BOT_USERNAME]

Only serious holders! 🚀

#Solana #GameFi #Web3Gaming #x402
```

---

## 📋 DEPLOYMENT CHECKLIST

### **Before Domain is Live**:
- [ ] Add domain in Netlify
- [ ] Configure DNS (nameservers or A/CNAME records)
- [ ] Wait for DNS propagation (5-30 min)
- [ ] Verify HTTPS is enabled
- [ ] Test domain loads

### **After Domain is Live**:
- [ ] Run `update-token-and-build.bat`
- [ ] Deploy dist folder to Netlify
- [ ] Test: https://novarcadeglitch.dev
- [ ] Connect wallet (0 NAG balance)
- [ ] Verify token gate shows "Need 100,000 NAG"
- [ ] Test "Buy $NAG" button
- [ ] Test Telegram bot with new domain
- [ ] Post launch tweet with domain
- [ ] Pin tweet

---

## 🔧 COMMON DNS REGISTRARS

### **Namecheap**:
1. Dashboard → Domain List → Manage
2. Advanced DNS → Add New Record
3. Or: Domain → Nameservers → Custom DNS

### **GoDaddy**:
1. My Products → Domains → DNS
2. Add Record (A or CNAME)
3. Or: Nameservers → Change

### **Porkbun**:
1. Domain Management → DNS
2. Add Record
3. Or: Nameservers → Use Custom

### **Cloudflare**:
1. DNS → Records → Add Record
2. Or: Nameservers (if transferring)

### **Google Domains**:
1. DNS → Custom records
2. Manage custom records → Create new record

---

## ⚡ SPEED UP DNS PROPAGATION

**Flush DNS Cache**:

**Windows**:
```bash
ipconfig /flushdns
```

**Mac**:
```bash
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
```

**Linux**:
```bash
sudo systemd-resolve --flush-caches
```

**Browser**:
- Chrome: `chrome://net-internals/#dns` → Clear host cache
- Firefox: Restart browser
- Safari: Clear cache in settings

---

## 🐛 TROUBLESHOOTING

### **Domain not loading**:
- Wait 10-30 minutes for DNS propagation
- Check DNS records are correct
- Use https://dnschecker.org/novarcadeglitch.dev
- Clear browser cache (Ctrl+Shift+Del)
- Try incognito mode

### **HTTPS not working**:
- Wait for SSL certificate (1-2 min after DNS verified)
- Check "Force HTTPS" is enabled in Netlify
- Try clearing browser cache
- Check Netlify domain settings for SSL status

### **Bot opens wrong URL**:
- Restart bot after updating code
- Check `telegram-bot/bot.js` line 20
- Should say: `https://novarcadeglitch.dev`
- Kill old bot process, start new one

### **WWW not working**:
- Add CNAME record for www subdomain
- Point to: brilliant-cucurucho-b92e28.netlify.app
- Wait for DNS propagation

---

## 📊 DNS PROPAGATION CHECKER

**Check if your domain is live worldwide**:

https://dnschecker.org/#A/novarcadeglitch.dev

**Should show**:
- Type: A
- Value: 75.2.60.5
- Green checkmarks worldwide

---

## ✅ FINAL VERIFICATION

**All these should work**:
- ✅ https://novarcadeglitch.dev
- ✅ http://novarcadeglitch.dev (redirects to HTTPS)
- ✅ https://www.novarcadeglitch.dev
- ✅ Wallet connects
- ✅ Token gate shows (0 balance)
- ✅ Buy button works
- ✅ Telegram bot opens domain
- ✅ SSL/HTTPS padlock shows

---

## 🎯 TIMELINE

**Immediate** (0-2 min):
- Add domain in Netlify
- Configure DNS records

**Short Wait** (5-15 min):
- DNS propagation
- SSL certificate provisioning

**Test** (15-20 min):
- Domain loads
- HTTPS works
- Token gate active

**Launch** (20-25 min):
- Post tweet with domain
- Share everywhere
- Monitor traffic

---

## 📞 DOMAIN CONFIGURED

**Your URLs**:
- **Main Site**: https://novarcadeglitch.dev
- **With WWW**: https://www.novarcadeglitch.dev
- **Netlify**: https://brilliant-cucurucho-b92e28.netlify.app (still works)

**Token Address**: 957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump

**Pump.fun**: https://pump.fun/957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump

---

## 🚀 READY TO LAUNCH!

**Once domain is live**:
1. ✅ Run `update-token-and-build.bat`
2. ✅ Deploy dist to Netlify
3. ✅ Test https://novarcadeglitch.dev
4. ✅ Post launch tweet
5. ✅ **YOU'RE LIVE!** 🎮✨

---

**Set up DNS now and let's launch!** 🌐🚀
