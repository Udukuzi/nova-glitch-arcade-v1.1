# 🚀 Deploy to Netlify - Complete Guide

## 📋 Overview

We'll deploy:
- **Frontend** → Netlify (static site)
- **Backend** → Railway/Render (Node.js server)
- **Database** → Supabase (already set up ✅)

---

## 🎯 Quick Deployment (15 Minutes)

### **Part 1: Deploy Backend (5 minutes)**

#### **Option A: Railway (Recommended)**

1. **Go to Railway**
   - Visit: https://railway.app
   - Sign up/Login with GitHub

2. **Create New Project**
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Connect your GitHub account
   - Select your repository

3. **Configure Backend**
   - Railway will auto-detect Node.js
   - Click **Add variables**
   - Add these environment variables:
     ```
     SUPABASE_URL=https://jhxgsznvbnseyakzcgxz.supabase.co
     SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoeGdzem52Ym5zZXlha3pjZ3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzUxMTksImV4cCI6MjA3NzI1MTExOX0.ac82jzZXjf8WqBBE-9Y4C0XhqPwt6klFAmWFcUS5Pzw
     SUPABASE_SERVICE_ROLE_KEY=(your service role key)
     JWT_SECRET=your-production-secret-here
     PORT=5178
     ```

4. **Set Root Directory**
   - Settings → Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Deploy**
   - Click **Deploy**
   - Wait 2-3 minutes
   - Copy your backend URL (e.g., `https://your-app.railway.app`)

#### **Option B: Render**

1. **Go to Render**
   - Visit: https://render.com
   - Sign up/Login

2. **New Web Service**
   - Click **New +** → **Web Service**
   - Connect GitHub repository
   - Select your repo

3. **Configure**
   - Name: `nova-arcade-backend`
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add environment variables (same as Railway)

4. **Deploy**
   - Click **Create Web Service**
   - Copy your backend URL

---

### **Part 2: Deploy Frontend to Netlify (5 minutes)**

#### **Step 1: Update Frontend Config**

First, update the frontend to use your production backend URL:

**File: `frontend/.env.production`** (create this file)
```env
VITE_API_BASE=https://your-backend-url.railway.app/api
VITE_GAME_SOCKET_URL=https://your-backend-url.railway.app
```

Replace `your-backend-url.railway.app` with your actual backend URL from Part 1.

#### **Step 2: Create Netlify Config**

**File: `frontend/netlify.toml`** (create this file)
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "https://your-backend-url.railway.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Replace `your-backend-url.railway.app` with your actual backend URL.

#### **Step 3: Deploy to Netlify**

1. **Go to Netlify**
   - Visit: https://app.netlify.com
   - Sign up/Login with GitHub

2. **New Site**
   - Click **Add new site** → **Import an existing project**
   - Choose **GitHub**
   - Select your repository

3. **Configure Build**
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

4. **Environment Variables**
   - Click **Site settings** → **Environment variables**
   - Add:
     ```
     VITE_API_BASE=https://your-backend-url.railway.app/api
     VITE_GAME_SOCKET_URL=https://your-backend-url.railway.app
     ```

5. **Deploy**
   - Click **Deploy site**
   - Wait 2-3 minutes
   - Your site will be live at: `https://random-name.netlify.app`

6. **Custom Domain (Optional)**
   - Click **Domain settings**
   - Add custom domain
   - Follow DNS instructions

---

## 🔧 Configuration Files Needed

I'll create these files for you automatically:

1. `frontend/.env.production` - Production environment variables
2. `frontend/netlify.toml` - Netlify configuration
3. `server/package.json` - Ensure start script exists

---

## ✅ Deployment Checklist

### **Before Deploying:**
- [ ] Backend works locally (`npm run dev` in server/)
- [ ] Frontend works locally (`npm run dev` in frontend/)
- [ ] Database is set up in Supabase
- [ ] All environment variables ready

### **Backend Deployment:**
- [ ] Railway/Render account created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] Backend deployed and running
- [ ] Backend URL copied

### **Frontend Deployment:**
- [ ] `.env.production` created with backend URL
- [ ] `netlify.toml` created with backend URL
- [ ] Netlify account created
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Site deployed

### **Testing:**
- [ ] Visit your Netlify URL
- [ ] Can login (trial or wallet)
- [ ] Can play games
- [ ] Scores persist
- [ ] Leaderboards work
- [ ] Sound effects work
- [ ] Mobile controls work

---

## 🐛 Common Issues & Fixes

### **Issue: "Failed to fetch" errors**
**Fix:** Check that backend URL in `.env.production` is correct and includes `https://`

### **Issue: "CORS errors"**
**Fix:** Backend needs CORS enabled. Check `server/src/index.ts` has:
```typescript
app.use(cors({ origin: '*' }))
```

### **Issue: "API not found"**
**Fix:** Verify `netlify.toml` redirects are correct and backend URL is right

### **Issue: Backend not starting**
**Fix:** Check Railway/Render logs for errors. Verify all environment variables are set.

### **Issue: Build fails**
**Fix:** 
- Check build logs
- Verify `package.json` has all dependencies
- Try building locally first: `npm run build`

---

## 📊 Expected URLs

After deployment:
- **Frontend:** `https://your-site.netlify.app`
- **Backend:** `https://your-app.railway.app`
- **Database:** `https://jhxgsznvbnseyakzcgxz.supabase.co` (already set up)

---

## 🚀 Quick Deploy Script

Want me to create the necessary config files now? I can:

1. Create `frontend/.env.production`
2. Create `frontend/netlify.toml`
3. Update `server/package.json` if needed
4. Create deployment instructions

**Just tell me your backend URL once it's deployed, and I'll configure everything!**

---

## 💡 Pro Tips

1. **Use Railway for backend** - Easier than Render, better free tier
2. **Enable auto-deploy** - Push to GitHub = auto-deploy
3. **Monitor logs** - Check Railway/Netlify logs for errors
4. **Test mobile** - Share Netlify URL with mobile testers
5. **Custom domain** - Makes it look professional

---

## 🎯 Next Steps

1. **Deploy backend first** (Railway/Render)
2. **Get backend URL**
3. **Tell me the URL** - I'll create config files
4. **Deploy frontend** (Netlify)
5. **Test everything**
6. **Share with testers!**

Ready to start? Let me know when you've deployed the backend, or if you want me to create the config files now with a placeholder URL! 🚀
