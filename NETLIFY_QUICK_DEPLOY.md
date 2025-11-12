# 🚀 NETLIFY DEPLOYMENT - DRAG & DROP METHOD

## **✅ QUICKEST DEPLOYMENT (5 MINUTES)**

### **Step 1: Build Your App**
```bash
# Open PowerShell in project folder
cd frontend
npm install
npm run build
```

This creates a `dist` folder with your built app.

### **Step 2: Create Netlify Config File**

Create `netlify.toml` in the **frontend** folder:
```toml
[build]
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Content-Security-Policy = "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; connect-src *;"
```

### **Step 3: Prepare Environment File**

Create `.env.production` in **frontend** folder:
```env
VITE_SOLANA_RPC=https://api.mainnet-beta.solana.com
VITE_NAG_TOKEN_MINT=NAGTokenMintPlaceholder
VITE_API_URL=https://nova-arcade-api.netlify.app
```

### **Step 4: Rebuild with Production Env**
```bash
# Build with production environment
npm run build
```

### **Step 5: DRAG & DROP DEPLOY**

1. **Open browser:** https://app.netlify.com/drop
2. **Drag the `dist` folder** onto the page
3. **Wait 30 seconds** - Your site is live!
4. **Get your URL:** something like `amazing-einstein-123abc.netlify.app`

---

## **📝 POST-DEPLOYMENT SETUP**

### **Step 1: Claim Your Site**
- Click "Claim this site" on the Netlify page
- Create free account if needed
- Site is now in your dashboard

### **Step 2: Rename Your Site**
1. Go to **Site settings**
2. Click **Change site name**
3. Enter: `nova-arcade` (or your preferred name)
4. New URL: `nova-arcade.netlify.app`

### **Step 3: Set Environment Variables**
1. Go to **Site settings** → **Environment variables**
2. Add these:
   ```
   VITE_SOLANA_RPC = https://api.mainnet-beta.solana.com
   VITE_NAG_TOKEN_MINT = YOUR_TOKEN_MINT_WHEN_LAUNCHED
   VITE_API_URL = YOUR_BACKEND_URL
   ```
3. Click **Save**
4. Trigger redeploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy**

### **Step 4: Custom Domain (Optional)**
1. Go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain: `yourdomain.com`
4. Follow DNS instructions

---

## **🔄 UPDATING YOUR SITE**

### **Method 1: Drag & Drop Again**
```bash
# Make changes, then:
cd frontend
npm run build

# Go to Netlify dashboard
# Drag new dist folder to site overview page
```

### **Method 2: Netlify CLI**
```bash
# Install CLI once
npm install -g netlify-cli

# Login once
netlify login

# Deploy updates
netlify deploy --dir=dist --prod
```

### **Method 3: Git Integration (Automatic)**
1. Push code to GitHub
2. In Netlify: **Site settings** → **Build & deploy**
3. Link to GitHub repository
4. Auto-deploys on every push!

---

## **🎯 QUICK COMMANDS**

### **Full Deploy in One Go:**
```bash
# From project root
cd frontend
npm install
npm run build
# Now drag dist folder to netlify.com/drop
```

### **With Environment Variables:**
```bash
# Create .env.production first, then:
cd frontend
npm install
npm run build
# Drag dist to Netlify
```

---

## **⚡ NETLIFY FEATURES TO ENABLE**

### **After deployment, enable these free features:**

1. **Asset Optimization**
   - Settings → Build & deploy → Post processing
   - ✅ Bundle CSS
   - ✅ Minify CSS
   - ✅ Bundle JS
   - ✅ Minify JS
   - ✅ Compress images

2. **Forms (for contact)**
   - Automatically detected
   - Free up to 100 submissions/month

3. **Analytics**
   - Analytics tab → Enable
   - Free basic analytics

4. **Split Testing**
   - Split different branches
   - A/B test features

---

## **🔧 TROUBLESHOOTING**

### **Site shows 404:**
- Check `netlify.toml` has redirect rules
- Ensure `dist` folder contains index.html
- Verify build command completed

### **White screen:**
- Check browser console for errors
- Verify environment variables are set
- Clear cache and redeploy

### **Wallet not connecting:**
- Ensure HTTPS is enabled (automatic on Netlify)
- Check RPC endpoint is correct
- Verify wallet adapter versions

### **Images not loading:**
- Check paths are relative (`/images/` not `../images/`)
- Verify images are in `public` folder
- Clear browser cache

---

## **📊 PERFORMANCE OPTIMIZATION**

### **Netlify Automatic Optimizations:**
- ✅ CDN distribution (global)
- ✅ Instant cache invalidation
- ✅ Brotli compression
- ✅ HTTP/2 push
- ✅ SSL certificate (automatic)

### **Your Build Optimizations:**
```bash
# Before building, ensure production mode:
NODE_ENV=production npm run build
```

---

## **🎉 LAUNCH CHECKLIST**

### **Before Going Live:**
- [x] Build with production environment
- [x] Test locally with `npm run preview`
- [x] Include netlify.toml
- [x] Set favicon (already done!)
- [ ] Drag to Netlify
- [ ] Set environment variables
- [ ] Test live site
- [ ] Share with team

### **After Launch:**
- [ ] Enable analytics
- [ ] Set up monitoring
- [ ] Configure custom domain
- [ ] Submit to search engines

---

## **💡 PRO TIPS**

1. **Preview Deploys:**
   - Every drag & drop creates unique URL
   - Test changes before updating main site

2. **Rollback:**
   - Netlify keeps all deploys
   - One-click rollback if issues

3. **Branch Deploys:**
   - Different branches = different URLs
   - Perfect for staging/testing

4. **Headers File:**
   Create `_headers` in public folder for more control:
   ```
   /*
     X-Frame-Options: DENY
     X-Content-Type-Options: nosniff
   ```

---

## **🚀 YOUR DEPLOYMENT STEPS**

### **Right now, do this:**

1. **Open PowerShell** in your project
2. **Run:**
   ```bash
   cd frontend
   npm run build
   ```
3. **Open browser:** https://app.netlify.com/drop
4. **Drag the `dist` folder**
5. **Done! Site is live!**

**Time needed: 5 minutes** ⏱️

**Your Nova Arcade will be live at: https://[your-site-name].netlify.app**

---

## **🎊 SUCCESS MESSAGE**

After deployment, you'll see:
```
✅ Site is live at: https://nova-arcade.netlify.app
✅ SSL enabled automatically
✅ Global CDN active
✅ Compressed assets
✅ Ready to share!
```

**Congratulations! Your game is now live on the internet! 🎮🚀**
