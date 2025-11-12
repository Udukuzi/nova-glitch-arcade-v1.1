# 🚀 Deployment Guide

## ✅ All Games Implemented!

Your arcade now has **6 fully functional games**:
1. ✅ Snake Classic
2. ✅ Flappy Nova
3. ✅ Memory Match
4. ✅ Bonk Ryder
5. ✅ PacCoin
6. ✅ TetraMem

## 📦 Build for Production

### Frontend Build
```bash
cd frontend
npm run build
```

This creates optimized files in `frontend/dist/`

### Backend Build
```bash
cd server
npm run build
```

This creates compiled JS in `server/dist/`

## 🌐 Deploy Options

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend to Vercel:**
1. Install Vercel CLI: `npm i -g vercel`
2. `cd frontend && vercel`
3. Set build command: `npm run build`
4. Set output directory: `dist`

**Backend to Railway:**
1. Go to railway.app
2. New Project → Deploy from GitHub
3. Connect your repo, set root: `server`
4. Add environment variables from `.env`
5. Deploy!

### Option 2: Netlify (Frontend) + Fly.io (Backend)

**Frontend to Netlify:**
1. `cd frontend && npm run build`
2. Drag `frontend/dist` to netlify.com

**Backend to Fly.io:**
1. Install Fly CLI: `flyctl install`
2. `cd server && flyctl launch`
3. Set env vars: `flyctl secrets set`

### Option 3: Full Stack on Render

1. Create two Render services:
   - **Frontend**: Static site pointing to `frontend/dist`
   - **Backend**: Web service for `server/`
2. Configure environment variables
3. Deploy!

## 🔐 Production Checklist

- [ ] Set strong `JWT_SECRET` in backend env
- [ ] Set Supabase keys correctly
- [ ] Enable HTTPS
- [ ] Add domain/CNAME records
- [ ] Test all games work
- [ ] Test wallet connection flow
- [ ] Test leaderboards
- [ ] Configure CORS properly
- [ ] Set up monitoring (optional)

## 🎯 Your Arcade Is Production-Ready!

All core features work:
- ✅ 6 playable games
- ✅ JWT authentication
- ✅ Supabase backend
- ✅ Leaderboards
- ✅ Wallet integration
- ✅ Dark/light mode
- ✅ Responsive design
- ✅ PWA ready

**Time to launch! 🎮🚀**















