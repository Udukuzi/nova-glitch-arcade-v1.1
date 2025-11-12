# 🚀 Netlify Deployment Guide - Complete Step-by-Step

## ✅ Prerequisites

1. **Netlify Account**: Sign up at https://www.netlify.com (free account works)
2. **Netlify CLI** (optional but recommended): `npm install -g netlify-cli`
3. **Git Repository** (optional): Can deploy directly from folder

---

## 📋 Step-by-Step Deployment

### **Option 1: Deploy via Netlify Dashboard (Easiest)**

#### Step 1: Build Your Project
```bash
cd frontend
npm run build
```

This creates a `dist` folder in `frontend/` with all production files.

#### Step 2: Go to Netlify Dashboard
1. Visit https://app.netlify.com
2. Click **"Add new site"** → **"Deploy manually"**

#### Step 3: Upload Your Build
1. **Drag and drop** the `frontend/dist` folder to Netlify
2. OR click **"Browse to upload"** and select the `frontend/dist` folder
3. Wait for upload to complete

#### Step 4: Your Site is Live!
- Netlify will give you a URL like: `https://random-name-12345.netlify.app`
- Your site is now live! 🎉

---

### **Option 2: Deploy via Netlify CLI (Recommended for Updates)**

#### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login to Netlify
```bash
netlify login
```
This opens your browser to authenticate.

#### Step 3: Initialize Netlify in Your Project
```bash
cd frontend
netlify init
```

Follow the prompts:
- **Create & configure a new site**: Choose "Yes"
- **Team**: Select your team
- **Site name**: Enter a name (or leave blank for random)
- **Build command**: `npm run build`
- **Directory to deploy**: `dist`

#### Step 4: Build and Deploy
```bash
npm run build
netlify deploy --prod
```

Your site is now live! 🚀

---

### **Option 3: Deploy via Git (Best for Continuous Updates)**

#### Step 1: Push to GitHub/GitLab
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: Connect to Netlify
1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub/GitLab/Bitbucket**
4. Authorize Netlify access
5. Select your repository

#### Step 3: Configure Build Settings
- **Build command**: `cd frontend && npm install && npm run build`
- **Publish directory**: `frontend/dist`
- **Base directory**: (leave empty or set to `frontend`)

#### Step 4: Deploy
Click **"Deploy site"** - Netlify will automatically deploy whenever you push to your repo!

---

## 🔧 Fixing "Project Not Updating" Issue

### Problem: Multiple projects with different names, updates don't show

### Solution: Use ONE Project and Update It

#### Option A: Remove Old Projects (Recommended)
1. Go to https://app.netlify.com/sites
2. Find **ALL** your old deployments
3. Click on each one → **Site settings** → **General** → Scroll down → **Delete site**
4. Keep **ONE** project (the one you want to use)
5. Deploy updates to that ONE project

#### Option B: Always Deploy to the Same Site
1. **Identify your main site** (the one you want to keep)
2. **Note the site name** (e.g., `my-arcade-12345.netlify.app`)
3. **Always deploy to this site**:

```bash
cd frontend
npm run build
netlify deploy --prod --site=my-arcade-12345
```

Or if using drag-and-drop:
- Always use the **same site** in Netlify dashboard
- Don't create new sites each time

#### Option C: Use Site ID (Most Reliable)
1. In Netlify dashboard, go to your site
2. Click **Site settings** → **General**
3. Copy the **Site ID** (looks like: `abc123-def456-789`)
4. Use this ID when deploying:

```bash
netlify deploy --prod --site-id=abc123-def456-789
```

---

## 📁 Project Structure for Netlify

Your project should look like this:
```
nova-glitch-arcade-v1.1-worldclass/
├── frontend/
│   ├── dist/          ← This is what gets deployed
│   ├── public/        ← Sound files, images, etc.
│   ├── src/
│   └── package.json
└── server/            ← Backend (deploy separately)
```

**Important**: Netlify only deploys the `frontend/dist` folder (or whatever you specify).

---

## ⚙️ Netlify Configuration File (Optional but Recommended)

Create `netlify.toml` in your **root** directory:

```toml
[build]
  base = "frontend"
  command = "npm install && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

This ensures:
- ✅ Builds from the `frontend` directory
- ✅ Publishes the `dist` folder
- ✅ Handles React Router (SPA routing)
- ✅ Uses Node 18

---

## 🔄 Updating Your Site

### Method 1: Re-deploy via CLI
```bash
cd frontend
npm run build
netlify deploy --prod
```

### Method 2: Re-deploy via Dashboard
1. Go to your site in Netlify dashboard
2. Click **"Deploys"** tab
3. Click **"Trigger deploy"** → **"Deploy site"**
4. Upload your new `frontend/dist` folder

### Method 3: Auto-deploy via Git (Best)
- Just push to your Git repository
- Netlify automatically deploys updates!

---

## 🌐 Custom Domain Setup (Detailed)

### Step 1: Add Domain to Netlify

1. Go to your site in Netlify dashboard
2. Click **Domain settings**
3. Click **Add custom domain**
4. Enter your domain (e.g., `novaglitcharcade.com`)
5. Click **Verify**

Netlify will check if you own the domain.

### Step 2: Configure DNS

You have **2 options**:

#### Option A: Use Netlify DNS (Recommended - Easiest)

1. In Netlify, click **"Use Netlify DNS"**
2. Netlify will show you **nameservers** (4 of them):
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - `dns3.p01.nsone.net`
   - `dns4.p01.nsone.net`

3. **Go to your domain registrar** (where you bought the domain):
   - GoDaddy, Namecheap, Google Domains, etc.
   
4. **Update nameservers**:
   - Find DNS/Nameserver settings
   - Replace existing nameservers with Netlify's 4 nameservers
   - Save changes

5. **Wait** (15 minutes - 48 hours for DNS propagation)

6. Netlify will automatically:
   - ✅ Configure DNS records
   - ✅ Enable HTTPS
   - ✅ Handle www/non-www redirects

#### Option B: Use External DNS (Your Registrar)

1. In your domain registrar's DNS settings, add these records:

**For root domain (example.com):**
```
Type: A
Name: @
Value: 75.2.60.5
```

**For www subdomain (www.example.com):**
```
Type: CNAME
Name: www
Value: [your-site-name].netlify.app
```

2. In Netlify, click **"Verify DNS configuration"**

3. Wait for DNS propagation (up to 48 hours)

### Step 3: Enable HTTPS

1. After DNS is configured, go to **Domain settings**
2. Scroll to **HTTPS**
3. Click **Verify DNS configuration**
4. Netlify will automatically provision SSL certificate (free)
5. Wait 5-10 minutes for certificate activation

✅ Your site will now be accessible at `https://yourdomain.com`

### Step 4: Configure Redirects (Optional)

In Netlify dashboard:
- **Primary domain**: Choose www or non-www
- Netlify will auto-redirect the other version

Example:
- If primary is `novaglitcharcade.com`
- `www.novaglitcharcade.com` will redirect to it

---

## 🔐 Common Domain Registrars - Nameserver Setup

### GoDaddy
1. Go to **My Products** → **Domains**
2. Click **Manage** on your domain
3. Scroll to **Nameservers** → Click **Change**
4. Select **Custom** nameservers
5. Add Netlify's 4 nameservers
6. Save

### Namecheap
1. Go to **Domain List** → Click **Manage**
2. Find **Nameservers** section
3. Select **Custom DNS**
4. Add Netlify's 4 nameservers
5. Click green checkmark to save

### Google Domains
1. Go to **My Domains** → Select domain
2. Click **DNS** in sidebar
3. Scroll to **Name servers** → Click **Use custom name servers**
4. Add Netlify's 4 nameservers
5. Save

### Cloudflare
1. If using Cloudflare, you'll need to:
   - Add DNS records manually (Option B above)
   - OR transfer DNS to Netlify

---

## 📝 Environment Variables (If Needed)

If your frontend needs environment variables:

1. Go to **Site settings** → **Environment variables**
2. Add variables:
   - `VITE_API_BASE` = `https://your-backend-url.com/api`
   - Any other `VITE_*` variables

3. Redeploy your site

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Build succeeds: `cd frontend && npm run build`
- [ ] `frontend/dist` folder exists
- [ ] All sound files are in `frontend/public/`
- [ ] No console errors
- [ ] Test locally: `cd frontend && npm run preview`

After deploying:
- [ ] Site loads correctly
- [ ] Password gate works
- [ ] Games load and play
- [ ] Sounds play correctly
- [ ] Mobile controls work
- [ ] No console errors

---

## 🚨 Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Run `npm install` before building

### Site Shows "Page Not Found"
- Add `netlify.toml` with redirects (see above)
- Ensure `index.html` is in `dist` folder

### Updates Don't Show
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check if you're deploying to the correct site
- Wait 1-2 minutes for CDN to update

### Assets (Sounds, Images) Don't Load
- Ensure files are in `frontend/public/` (not `frontend/src/`)
- Check paths in code (should start with `/` not `./`)
- Rebuild after adding files

---

## 📊 Quick Reference Commands

```bash
# Build
cd frontend
npm run build

# Deploy to production
netlify deploy --prod

# Deploy to preview (for testing)
netlify deploy

# View deployment logs
netlify logs

# Open site in browser
netlify open
```

---

## 🎯 Summary: Best Practice

1. **Use ONE Netlify site** for your project
2. **Always deploy to the same site** using site ID or name
3. **Use Git integration** for automatic deployments
4. **Keep `netlify.toml`** for consistent configuration

**Your arcade is now live on Netlify! 🎮🚀**










