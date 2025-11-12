# 🚀 COMPLETE DEPLOYMENT CHECKLIST - Nova Glitch Arcade

## 🎯 QUICK START GUIDE

Follow these steps in order to test and deploy your complete build.

---

## ✅ PHASE 1: FIX FAVICON (5 minutes)

### Problem Identified
The current `nova-logo.png` (52 bytes) and `favicon.ico` (39 bytes) are placeholder files, not actual images.

### Solution: Generate Proper Favicon

**Option A: Use Online Favicon Generator (Recommended)**

1. **Go to**: https://favicon.io/favicon-generator/
2. **Settings**:
   - Text: `NAG` or `🎮`
   - Background: `#1a1a2e` (dark)
   - Font Color: `#00ff88` (neon green)
   - Font: Orbitron or similar arcade font
   - Font Size: 80-100
   - Shape: Square or Rounded
3. **Download** the generated favicon package
4. **Extract** and copy files to `frontend/public/`:
   - `favicon.ico`
   - `favicon-16x16.png`
   - `favicon-32x32.png`
   - `apple-touch-icon.png`
   - `android-chrome-192x192.png`
   - `android-chrome-512x512.png`

**Option B: Use Your Logo**

1. If you have a Nova logo file (PNG, at least 512x512):
   - Go to https://realfavicongenerator.net/
   - Upload your logo
   - Generate all formats
   - Download and extract to `frontend/public/`

**Option C: Quick Fix (Temporary)**

Use the splash image as favicon:
```bash
# In the project root directory
copy frontend\public\splash-image.png frontend\public\nova-logo.png
```

Then use an online tool to convert to .ico format.

### Update index.html

Replace favicon links in `frontend/index.html`:

```html
<!-- Favicon - Multiple formats for better compatibility -->
<link rel="icon" type="image/x-icon" href="/favicon.ico" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png" />
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png" />
```

---

## ✅ PHASE 2: LOCAL BUILD TEST (10 minutes)

### Step 1: Test Frontend Build

```bash
# Navigate to frontend
cd frontend

# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

**Expected Output:**
- ✅ Build completes without errors
- ✅ `dist` folder is created in `frontend/`
- ✅ `dist` contains `index.html` and `assets/`

### Step 2: Preview Production Build

```bash
# Still in frontend directory
npm run preview
```

This starts a local server with the production build.

**Expected Output:**
```
➜  Local:   http://localhost:4173/
➜  Network: use --host to expose
```

### Step 3: Test Full Application

Open browser to `http://localhost:4173` and test:

**Critical Tests:**
- [ ] Page loads without errors
- [ ] Favicon appears in browser tab
- [ ] Splash screen shows
- [ ] Sound toggle works
- [ ] Can navigate to Lobby
- [ ] All 6 games are visible
- [ ] Can open game (select any game)
- [ ] Game controls work
- [ ] Sound effects play
- [ ] Mobile view looks good (F12 → Device toolbar)
- [ ] Battle Arena modal opens
- [ ] Swap modal opens
- [ ] Settings work
- [ ] Theme toggle works (dark/light)
- [ ] No console errors (F12 → Console)

### Step 4: Check Build Size

```bash
# In frontend directory
dir dist /s
```

**Important Files to Check:**
- `dist/index.html` - Should exist
- `dist/assets/*.js` - JavaScript bundles
- `dist/assets/*.css` - Stylesheets
- `dist/nova-logo.png` - Favicon
- `dist/*.mp3` - Sound files

---

## ✅ PHASE 3: BACKEND PREPARATION (Optional - if using backend)

### Test Backend Locally

```bash
# In new terminal, navigate to server
cd server

# Install dependencies
npm install

# Start backend
npm start
```

**Expected Output:**
```
Server running on http://localhost:5178
Database connected
```

### Backend Deployment (Separate from Netlify)

**Backend must be deployed separately:**

**Option 1: Railway.app** (Recommended)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add root directory: `server`
5. Add environment variables (Supabase keys, JWT secret, etc.)
6. Deploy

**Option 2: Render.com**
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Root directory: `server`
5. Build command: `npm install`
6. Start command: `npm start`
7. Add environment variables
8. Deploy

**Option 3: Heroku**
```bash
cd server
heroku create nag-arcade-api
git push heroku main
```

### Update Frontend Environment Variables

After backend is deployed, create `frontend/.env.production`:

```env
VITE_API_BASE=https://your-backend-url.com/api
VITE_NAG_TOKEN_MINT=your-token-mint-address-after-launch
```

Rebuild frontend after setting these variables.

---

## ✅ PHASE 4: NETLIFY DEPLOYMENT (15 minutes)

### Method 1: Quick Deploy (Drag & Drop)

```bash
# Build frontend
cd frontend
npm run build
```

1. Go to https://app.netlify.com
2. **New site** → **Deploy manually**
3. **Drag `frontend/dist` folder** to upload area
4. Wait for deployment
5. Site is live at `https://random-name.netlify.app`

### Method 2: CLI Deploy (Better)

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login
netlify login

# Navigate to frontend
cd frontend

# Initialize (first time only)
netlify init

# Build and deploy
npm run build
netlify deploy --prod
```

### Method 3: Git Integration (Best for Updates)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Nova Glitch Arcade - Complete Build"
git branch -M main
git remote add origin https://github.com/yourusername/nova-arcade.git
git push -u origin main
```

2. In Netlify:
   - New site → Import from Git
   - Connect GitHub
   - Select repository
   - Build settings:
     - **Base directory**: `frontend`
     - **Build command**: `npm install && npm run build`
     - **Publish directory**: `frontend/dist`
   - Deploy

---

## ✅ PHASE 5: CUSTOM DOMAIN SETUP (20 minutes)

### Step 1: Add Domain in Netlify

1. Go to your deployed site in Netlify
2. **Domain settings** → **Add custom domain**
3. Enter your domain (e.g., `novaglitcharcade.com`)
4. Click **Verify**

### Step 2: Choose DNS Option

**Option A: Use Netlify DNS (EASIEST)**

1. Click **"Use Netlify DNS"**
2. Netlify shows 4 nameservers:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

3. Go to your domain registrar (where you bought the domain)
4. Find "Nameservers" or "DNS" settings
5. Replace existing nameservers with Netlify's 4 nameservers
6. Save changes

**Option B: Keep Your Current DNS**

1. In your domain registrar's DNS settings, add:

**A Record** (for root domain):
```
Type: A
Name: @ (or leave blank)
Value: 75.2.60.5
```

**CNAME Record** (for www):
```
Type: CNAME
Name: www
Value: [your-netlify-site].netlify.app
```

2. Save DNS records
3. In Netlify, click **Verify DNS configuration**

### Step 3: Wait for DNS Propagation

- **Minimum**: 15 minutes
- **Maximum**: 48 hours
- **Average**: 1-4 hours

Check propagation status: https://dnschecker.org

### Step 4: Enable HTTPS (Automatic)

1. After DNS is verified, go to **Domain settings**
2. Scroll to **HTTPS**
3. Netlify auto-provisions SSL certificate
4. Wait 5-10 minutes

✅ **Your site is now live at `https://yourdomain.com`!**

---

## ✅ PHASE 6: FINAL VERIFICATION (5 minutes)

### Test Live Site

Visit your deployed site and verify:

**Functionality:**
- [ ] Site loads at custom domain
- [ ] HTTPS is working (🔒 in browser)
- [ ] Favicon shows correctly
- [ ] All pages load
- [ ] Games work properly
- [ ] Sound effects play
- [ ] Wallet connection works (if implemented)
- [ ] Battle Arena modal works
- [ ] Swap interface works
- [ ] Mobile responsive
- [ ] No console errors

### Performance Check

1. Open DevTools (F12) → **Network** tab
2. Refresh page
3. Check:
   - [ ] Page load time < 3 seconds
   - [ ] No 404 errors
   - [ ] All assets load correctly

### Mobile Test

1. Open DevTools → Device toolbar (Ctrl+Shift+M)
2. Test on:
   - [ ] iPhone SE (small screen)
   - [ ] iPhone 12 Pro (medium)
   - [ ] iPad (tablet)
3. Or use real mobile device

---

## ✅ PHASE 7: POST-DEPLOYMENT SETUP (10 minutes)

### Update Telegram Bot

Edit `telegram-bot/.env`:
```env
TELEGRAM_BOT_TOKEN=8503408053:AAHL97CE5gTPdNMKlkwfbF_3bnhQaqKPucg
API_URL=https://your-backend-url.com
WEBAPP_URL=https://yourdomain.com
```

Deploy bot to Railway/Render/Heroku (see TELEGRAM_BOT_SETUP.md).

### Update Social Links

If you added social media:
1. Update links in `frontend/src/components/Footer.tsx`
2. Add real social URLs
3. Redeploy

### Set Up Analytics (Optional)

**Google Analytics:**
1. Create GA4 property
2. Add tracking code to `frontend/index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 📊 QUICK COMMAND REFERENCE

### Local Testing
```bash
# Frontend build and preview
cd frontend
npm install
npm run build
npm run preview

# Backend test
cd server
npm install
npm start

# Telegram bot test
cd telegram-bot
npm install
node bot.js
```

### Netlify Deployment
```bash
# CLI method
cd frontend
npm run build
netlify deploy --prod

# Update existing site
npm run build
netlify deploy --prod --site=your-site-name
```

### Troubleshooting
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules dist
npm install
npm run build

# Check for errors
npm run build 2>&1 | more

# Preview locally
npm run preview
```

---

## 🆘 TROUBLESHOOTING GUIDE

### Build Fails
- **Error**: `npm ERR!`
- **Fix**: Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

### 404 on Routes
- **Error**: Page not found on `/battle-arena` etc.
- **Fix**: Ensure `netlify.toml` has redirects (already included)

### Favicon Not Showing
- **Fix**: Clear browser cache (Ctrl+Shift+Delete)
- Or use incognito mode to test

### Images/Sounds Don't Load
- **Fix**: Ensure files are in `frontend/public/` not `src/`
- Rebuild: `npm run build`

### SSL Certificate Pending
- **Wait**: Can take up to 24 hours
- **Check**: DNS must be fully propagated first

### Domain Not Resolving
- **Check DNS**: https://dnschecker.org
- **Verify**: Nameservers are correct
- **Wait**: DNS can take 48 hours

---

## ✅ SUCCESS CHECKLIST

Before you're done, confirm:

- [ ] Frontend builds without errors
- [ ] Favicon is proper image (not 52 bytes)
- [ ] Local preview works (`npm run preview`)
- [ ] Deployed to Netlify successfully
- [ ] Custom domain is connected
- [ ] HTTPS/SSL is active
- [ ] All games work on live site
- [ ] Mobile view is responsive
- [ ] No console errors on live site
- [ ] Backend is deployed (if needed)
- [ ] Telegram bot is updated and running
- [ ] Analytics set up (optional)

---

## 🎉 YOU'RE LIVE!

**Your Nova Glitch Arcade is now:**
- ✅ Built and optimized
- ✅ Deployed to Netlify
- ✅ Accessible at custom domain
- ✅ Secured with HTTPS
- ✅ Favicon showing correctly
- ✅ Ready for players!

**Share your arcade:**
- Website: https://yourdomain.com
- Telegram Bot: @NAGTokenBot
- Social Media: Post your link!

🎮 **LET THE GAMES BEGIN!** 🎮

---

## 📞 SUPPORT RESOURCES

- **Netlify Docs**: https://docs.netlify.com
- **DNS Help**: https://dnschecker.org
- **Favicon Generator**: https://favicon.io
- **SSL Check**: https://www.ssllabs.com/ssltest/
- **Performance Test**: https://pagespeed.web.dev

**Remember**: Save this checklist for future updates!
