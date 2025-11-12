# 🐷 PORKBUN DEPLOYMENT GUIDE - Nova Glitch Arcade

## 📋 Important: Porkbun = Domain Registrar (Not Hosting)

**Porkbun is a domain registrar**, meaning you bought your **domain name** there (e.g., novaglitcharcade.com).

However, **Porkbun doesn't provide traditional web hosting** for React apps.

---

## 🎯 YOUR OPTIONS

You have **3 main options** for hosting your arcade:

### **Option 1: Netlify + Porkbun Domain (RECOMMENDED - FREE)** ⭐

**Best for:**
- Easy deployment
- Automatic updates
- Global CDN
- Free SSL
- No server management

**Cost:** FREE (hosting) + Domain price (already paid)

### **Option 2: Vercel + Porkbun Domain (Alternative - FREE)**

Similar to Netlify, also excellent for React apps.

### **Option 3: Traditional Hosting + Porkbun Domain**

Buy hosting separately (Hostinger, Bluehost, etc.) and point Porkbun domain to it.

**Cost:** $3-10/month + Domain price

---

## ⭐ RECOMMENDED: Deploy to Netlify with Porkbun Domain

This is the **BEST** solution because:
- ✅ Netlify hosting is **FREE**
- ✅ You already own the domain (Porkbun)
- ✅ Easy to connect them
- ✅ Automatic SSL/HTTPS
- ✅ Fast global CDN

---

## 🚀 STEP-BY-STEP: NETLIFY + PORKBUN

### **PHASE 1: Deploy to Netlify (10 minutes)**

#### Step 1: Build Your Project
```bash
cd frontend
npm install
npm run build
```

#### Step 2: Create Netlify Account
1. Go to **https://www.netlify.com**
2. Sign up with GitHub, GitLab, or Email
3. Free account is perfect

#### Step 3: Deploy Your Site
**Method A: Drag & Drop (Easiest)**
1. Click **"Add new site"** → **"Deploy manually"**
2. **Drag the `frontend/dist` folder** into the upload area
3. Wait for deployment (1-2 minutes)
4. You'll get a URL like: `https://random-name-12345.netlify.app`

**Method B: CLI (For Updates)**
```bash
npm install -g netlify-cli
netlify login
cd frontend
netlify init
npm run build
netlify deploy --prod
```

#### Step 4: Test Your Site
Visit your temporary Netlify URL (`https://random-name.netlify.app`) and verify everything works.

---

### **PHASE 2: Connect Porkbun Domain to Netlify (15 minutes)**

Now let's connect your Porkbun domain to Netlify!

#### Step 1: Add Domain in Netlify

1. Go to your site in **Netlify Dashboard**
2. Click **"Domain settings"**
3. Click **"Add custom domain"**
4. Enter your domain (e.g., `novaglitcharcade.com`)
5. Click **"Verify"**

Netlify will ask how you want to configure DNS. Choose:

**Option A: Use Netlify DNS** (EASIEST - Recommended) ⭐

#### Step 2A: If Using Netlify DNS

1. In Netlify, click **"Use Netlify DNS"**
2. Netlify will show you **4 nameservers** like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
3. **COPY THESE** - you'll need them for Porkbun

---

#### Step 3: Update Nameservers in Porkbun

1. **Login to Porkbun**: https://porkbun.com/account/domainsSpeedy
2. Find your domain in the list
3. Click **"Details"** or click on the domain name
4. Look for **"Nameservers"** section
5. Click **"Edit"** or **"Change Nameservers"**
6. Select **"Custom Nameservers"** or **"Use custom nameservers"**
7. **Enter Netlify's 4 nameservers** (one in each field):
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
8. Click **"Submit"** or **"Update"**

#### Step 4: Wait for DNS Propagation

- **Minimum**: 15 minutes
- **Maximum**: 48 hours
- **Average**: 2-4 hours

You can check status at: https://dnschecker.org

#### Step 5: Verify in Netlify

1. Go back to Netlify Dashboard
2. In Domain settings, click **"Verify DNS configuration"**
3. Once verified, Netlify will **automatically provision SSL certificate** (HTTPS)
4. Wait 5-10 minutes for SSL activation

✅ **Your site is now live at `https://yourdomain.com`!**

---

### **ALTERNATIVE: Option B - Use Porkbun DNS**

If you prefer to keep DNS at Porkbun:

#### Step 1: Get Netlify's Load Balancer IP

In Netlify Domain settings, you'll see an IP address like: `75.2.60.5`

#### Step 2: Add DNS Records in Porkbun

1. Login to **Porkbun**: https://porkbun.com/account/domainsSpeedy
2. Click your domain
3. Go to **"DNS Records"** section
4. Click **"Add"** and create these records:

**A Record (for root domain):**
```
Type: A
Host: @ (or leave blank)
Answer: 75.2.60.5
TTL: 600
```

**CNAME Record (for www):**
```
Type: CNAME
Host: www
Answer: [your-site-name].netlify.app
TTL: 600
```

**Note:** Replace `[your-site-name]` with your actual Netlify subdomain.

5. Click **"Add"** or **"Submit"**

#### Step 3: Verify in Netlify

1. Go to Netlify Dashboard → Domain settings
2. Click **"Verify DNS configuration"**
3. Wait for SSL certificate (automatic)

---

## 🔄 UPDATING YOUR SITE

### Every Time You Make Changes:

**Method 1: Drag & Drop**
```bash
cd frontend
npm run build
# Go to Netlify → Deploys → Drag new dist folder
```

**Method 2: CLI (Faster)**
```bash
cd frontend
npm run build
netlify deploy --prod
```

**Method 3: Git Integration (Best)**
1. Push code to GitHub
2. Connect Netlify to your GitHub repo
3. Every push automatically deploys!

To set up Git integration:
1. In Netlify: Site settings → Build & deploy
2. Link repository
3. Set build command: `cd frontend && npm install && npm run build`
4. Set publish directory: `frontend/dist`

---

## 📧 PORKBUN EMAIL FORWARDING (Optional)

Porkbun offers free email forwarding!

### Set Up Email (e.g., hello@yourdomain.com):

1. Login to Porkbun
2. Go to your domain details
3. Find **"Email Forwarding"**
4. Add forwarding rule:
   - **From**: hello@yourdomain.com
   - **To**: your-gmail@gmail.com
5. Save

Now emails sent to `hello@yourdomain.com` will forward to your Gmail!

---

## 🆘 TROUBLESHOOTING

### **"Domain not connecting"**

**Check:**
- [ ] Nameservers updated in Porkbun
- [ ] Waited at least 2 hours for DNS propagation
- [ ] Check propagation: https://dnschecker.org
- [ ] Verified in Netlify dashboard

### **"SSL Certificate Pending"**

- DNS must be fully propagated first
- Can take up to 24 hours
- Check: Domain settings → HTTPS in Netlify

### **"Site shows old Porkbun page"**

- Clear browser cache (Ctrl+Shift+R)
- DNS not propagated yet - wait longer
- Check nameservers are correct

### **"www vs non-www not working"**

In Netlify:
- Domain settings → Set primary domain
- Netlify auto-redirects the other version

---

## 💰 COST BREAKDOWN

**What You're Paying:**
- Porkbun Domain: ~$10-15/year ✅ (already paid)

**What's FREE:**
- Netlify Hosting: $0/month ✅
- Netlify SSL: $0/month ✅
- Netlify CDN: $0/month ✅
- Google Analytics: $0/month ✅

**Total Monthly Cost: $0** (after domain purchase)

**Free tier includes:**
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites
- Automatic SSL
- More than enough for your arcade!

---

## 🎯 QUICK COMMAND REFERENCE

### Build and Deploy
```bash
# Build
cd frontend
npm run build

# Deploy to Netlify (after initial setup)
netlify deploy --prod

# Or use the batch file
./deploy-to-netlify.bat
```

### Check DNS
```bash
# Check nameservers
nslookup -type=ns yourdomain.com

# Check A record
nslookup yourdomain.com
```

---

## ✅ DEPLOYMENT CHECKLIST

### Before Connecting Domain:
- [ ] Site deployed to Netlify
- [ ] Site works on temporary URL (random-name.netlify.app)
- [ ] All games tested
- [ ] Sound works
- [ ] Mobile responsive

### During Domain Setup:
- [ ] Added domain in Netlify
- [ ] Copied nameservers
- [ ] Updated nameservers in Porkbun
- [ ] Verified DNS configuration

### After Domain Connected:
- [ ] Domain resolves (yourdomain.com loads)
- [ ] SSL/HTTPS active (🔒 in browser)
- [ ] www redirects to non-www (or vice versa)
- [ ] All features work on live domain
- [ ] Google Analytics tracking ID updated

---

## 🔐 SECURITY & SSL

### Netlify Automatically Provides:

- ✅ **Free SSL Certificate** (Let's Encrypt)
- ✅ **Auto-renewal** (never expires)
- ✅ **HTTPS enforcement** (HTTP → HTTPS redirect)
- ✅ **Security headers**

No configuration needed - it just works!

---

## 📊 ANALYTICS INTEGRATION

Don't forget to update your Google Analytics:

1. Get tracking ID from https://analytics.google.com
2. Open `frontend/index.html`
3. Replace `G-XXXXXXXXXX` with your ID (lines 27 & 32)
4. Rebuild: `npm run build`
5. Redeploy to Netlify

See **`ANALYTICS_SETUP_GUIDE.md`** for details.

---

## 🎮 BACKEND DEPLOYMENT

**Important:** Your React frontend is just the UI.

If you need the backend API, deploy it separately:

### Backend Options:

**1. Railway.app (Recommended - FREE)**
```bash
# Deploy server folder
railway login
railway init
railway up
```

**2. Render.com (FREE)**
- Deploy Node.js service
- Connect GitHub repo
- Set root directory: `server`

**3. Heroku ($5/month)**
```bash
cd server
heroku create nag-arcade-api
git push heroku main
```

Then update your frontend environment variables with the backend URL.

---

## 🌐 COMPLETE SETUP SUMMARY

**Your Setup:**
1. **Domain**: Bought from Porkbun ✅
2. **Frontend Hosting**: Netlify (FREE) ✅
3. **Backend Hosting**: Railway.app (FREE) ✅
4. **SSL**: Automatic via Netlify ✅
5. **CDN**: Global via Netlify ✅
6. **Analytics**: Google Analytics (FREE) ✅

**Total Cost: Just your domain (~$1/month)**

---

## 🎉 FINAL STEPS

### 1. Deploy to Netlify
```bash
cd frontend
npm run build
# Upload dist folder to Netlify
```

### 2. Connect Porkbun Domain
- Update nameservers in Porkbun
- Point to Netlify's DNS

### 3. Wait for DNS
- 15 minutes - 48 hours
- Average: 2-4 hours

### 4. Test Your Site
- Visit yourdomain.com
- Verify HTTPS works
- Test all features

### 5. Update Telegram Bot
Edit `telegram-bot/.env`:
```env
WEBAPP_URL=https://yourdomain.com
```

### 6. Share Your Arcade! 🎮
- Twitter: Post your link
- Telegram: Share with community
- Discord: Promote your arcade

---

## 📞 PORKBUN SUPPORT

**If you need help with Porkbun:**
- Support: https://porkbun.com/support
- Live chat available
- Email: support@porkbun.com
- Response time: Usually < 24 hours

**Netlify Support:**
- Docs: https://docs.netlify.com
- Community: https://answers.netlify.com
- Support: https://www.netlify.com/support

---

## 💡 PRO TIPS

### Speed Optimization
- Netlify automatically optimizes your site
- Global CDN = Fast worldwide
- Compression enabled by default

### Custom Subdomain
You can add subdomains like `api.yourdomain.com`:
1. Add in Netlify (for another site)
2. Or add CNAME in Porkbun DNS

### Email Professional Setup
- Use Porkbun email forwarding (FREE)
- Or connect Gmail via G Suite ($6/month)

### Monitoring
- Netlify Analytics ($9/month - optional)
- Or use free Google Analytics (already setup!)

---

## ✅ YOU'RE READY!

**Perfect combination:**
- ✅ Porkbun domain (you own it)
- ✅ Netlify hosting (free, fast, reliable)
- ✅ Professional setup
- ✅ No monthly hosting costs

**Next steps:**
1. Build: `cd frontend && npm run build`
2. Deploy to Netlify
3. Connect your Porkbun domain
4. Watch your arcade go live! 🎮🚀

**Your Nova Glitch Arcade will be at `https://yourdomain.com` in just a few hours!**
