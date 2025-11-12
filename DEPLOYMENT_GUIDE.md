# Nova Glitch Arcade - Deployment Guide

## 🎯 Overview

This guide covers deploying the Nova Glitch Arcade platform to production. The architecture consists of:

1. **Backend API** (Node.js/Express) - Authentication, sessions, leaderboards
2. **Frontend** (React/Vite) - Static SPA
3. **Socket Server** (Python) - Optional, for Contra game streaming

## 📋 Pre-Deployment Checklist

### Backend Requirements
- [ ] Supabase project created with all tables (see `server/migrations.sql`)
- [ ] Strong `JWT_SECRET` generated (use `openssl rand -base64 32`)
- [ ] Production RPC endpoints for BSC and Solana
- [ ] Environment variables documented and secured

### Frontend Requirements
- [ ] Backend API URL confirmed and accessible
- [ ] Socket server URL (if using Contra)
- [ ] Build tested locally (`npm run build`)

## 🚀 Deployment Steps

### 1. Deploy Backend (Node.js API)

#### Option A: Render.com (Recommended)

1. **Create New Web Service**
   - Connect your Git repository
   - Select `server` directory as root
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

2. **Set Environment Variables**
   ```
   NODE_ENV=production
   PORT=5178
   JWT_SECRET=<your-secure-random-string>
   SUPABASE_URL=<your-supabase-url>
   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
   BSC_RPC=https://bsc-dataseed.binance.org/
   SOL_RPC=https://api.mainnet-beta.solana.com
   MIN_HOLD=50000
   MIN_STAKE=250000
   WHALE_THRESHOLD=1000000
   TOKEN_DECIMALS=18
   ```

3. **Deploy**
   - Render will auto-deploy on git push
   - Note your service URL (e.g., `https://your-app.onrender.com`)

#### Option B: Railway.app

1. **Create New Project**
   - Connect repository
   - Add service from `server` directory

2. **Configure**
   - Set environment variables (same as above)
   - Railway auto-detects Node.js and runs `npm start`

3. **Deploy**
   - Note your Railway URL

#### Option C: Fly.io

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Initialize in server directory**
   ```bash
   cd server
   fly launch
   ```

3. **Set secrets**
   ```bash
   fly secrets set JWT_SECRET=<secret>
   fly secrets set SUPABASE_URL=<url>
   fly secrets set SUPABASE_SERVICE_ROLE_KEY=<key>
   # ... set all other env vars
   ```

4. **Deploy**
   ```bash
   fly deploy
   ```

### 2. Deploy Frontend (Static SPA)

#### Option A: Vercel (Recommended)

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Configure Build Settings**
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables**
   ```
   VITE_API_BASE=https://your-backend.onrender.com/api
   VITE_GAME_SOCKET_URL=https://your-socket-server.com
   ```

4. **Deploy**
   ```bash
   cd frontend
   vercel --prod
   ```
   Or connect via Vercel dashboard for auto-deployments.

#### Option B: Netlify

1. **Create `frontend/netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy via CLI or Dashboard**
   ```bash
   cd frontend
   npm install -g netlify-cli
   netlify deploy --prod
   ```

3. **Set Environment Variables** in Netlify dashboard:
   - `VITE_API_BASE`
   - `VITE_GAME_SOCKET_URL`

#### Option C: Cloudflare Pages

1. **Connect Repository**
   - Go to Cloudflare Pages dashboard
   - Connect your Git repo

2. **Configure Build**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `frontend`

3. **Set Environment Variables**
   - Add `VITE_API_BASE` and `VITE_GAME_SOCKET_URL`

4. **Deploy**
   - Cloudflare auto-deploys on push

### 3. Deploy Socket Server (Optional - for Contra)

If you're using the Contra game with Python streaming:

#### Option A: Render.com

1. **Create Python Web Service**
   - Root directory: `contra-backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python game_stream_server.py`

2. **Set Environment Variables**
   ```
   PORT=5001
   ```

#### Option B: Heroku

1. **Create Procfile** in `contra-backend/`
   ```
   web: python game_stream_server.py
   ```

2. **Deploy**
   ```bash
   cd contra-backend
   heroku create your-socket-server
   git push heroku main
   ```

## 🔒 Security Hardening

### Backend
1. **Enable CORS properly**
   - Update `server/src/index.ts` to whitelist only your frontend domain
   ```typescript
   app.use(cors({
     origin: ['https://your-frontend.vercel.app'],
     credentials: true
   }))
   ```

2. **Add Rate Limiting**
   ```bash
   cd server
   npm install express-rate-limit
   ```
   
   In `server/src/index.ts`:
   ```typescript
   import rateLimit from 'express-rate-limit'
   
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 10 // limit each IP to 10 requests per windowMs
   })
   
   app.use('/api/auth', authLimiter)
   ```

3. **Enable HTTPS**
   - Most platforms (Render, Vercel, etc.) provide this automatically

### Frontend
1. **Never expose service role keys**
   - Only use `SUPABASE_ANON_KEY` if needed on frontend
   - Service role key stays on backend only

2. **Content Security Policy**
   - Add CSP headers via hosting platform or meta tags

## 🧪 Testing Production Build

### Test Backend Locally
```bash
cd server
npm run build
NODE_ENV=production JWT_SECRET=test npm start
```

Test endpoints:
```bash
curl http://localhost:5178/api/health
```

### Test Frontend Build Locally
```bash
cd frontend
npm run build
npm run preview
```

Open `http://localhost:4173` and verify:
- [ ] Login works
- [ ] Trial system functions
- [ ] Games load
- [ ] Leaderboard displays

## 📊 Monitoring

### Backend
- Set up logging (e.g., Logtail, Papertrail)
- Monitor API response times
- Track error rates

### Frontend
- Use Vercel Analytics or Google Analytics
- Monitor Core Web Vitals
- Track user flows

## 🔄 CI/CD Setup

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd server && npm ci && npm run build
      # Add deployment step for your platform

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: cd frontend && npm ci && npm run build
      # Add deployment step for your platform
```

## 🐛 Troubleshooting

### Backend Issues
- **JWT errors**: Ensure `JWT_SECRET` is set and consistent
- **Supabase connection fails**: Verify URL and service role key
- **CORS errors**: Check origin whitelist in CORS config

### Frontend Issues
- **API calls fail**: Verify `VITE_API_BASE` is correct and includes `/api`
- **Blank page**: Check browser console for errors, verify build output
- **Socket connection fails**: Ensure `VITE_GAME_SOCKET_URL` points to Socket.IO server

### Common Errors
- **"Cannot GET /api/..."**: Backend not running or wrong URL
- **"Invalid token"**: JWT_SECRET mismatch or expired token
- **"Nonce invalid"**: Clock skew or nonce expired (5 min limit)

## 📞 Support

For deployment issues:
1. Check logs on your hosting platform
2. Verify all environment variables are set
3. Test endpoints individually with curl/Postman
4. Review this guide's checklist

---

**Last Updated:** 2025-11-07
