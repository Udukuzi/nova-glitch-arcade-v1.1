# 🌐 Share Your Website for Testing

## Quick Options to Share Your Website

### Option 1: Deploy to Vercel (Recommended - 5 minutes, FREE)

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Navigate to frontend:
   ```bash
   cd frontend
   ```

3. Deploy:
   ```bash
   vercel
   ```
   - Follow prompts (press Enter for defaults)
   - Choose "Set up and deploy"
   - When asked about directory, press Enter (uses current directory)
   - Build command: `npm run build`
   - Output directory: `dist`

4. Get your public URL!
   - Vercel will give you a URL like: `https://your-app-name.vercel.app`
   - Share this link with testers!

**Advantages:**
- ✅ Free forever
- ✅ Instant public URL
- ✅ HTTPS automatically
- ✅ Fast CDN
- ✅ Easy to update (just run `vercel` again)

---

### Option 2: Use Cloudflare Tunnel (FREE, No Installation)

**Steps:**
1. Download Cloudflare Tunnel (one-time):
   ```powershell
   # Download from: https://github.com/cloudflare/cloudflared/releases
   # Or use Chocolatey: choco install cloudflared
   ```

2. Create a tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:5173
   ```

3. Share the generated URL (e.g., `https://random-name.trycloudflare.com`)

**Advantages:**
- ✅ Completely free
- ✅ Works instantly
- ✅ No deployment needed
- ⚠️ URL changes each time (unless you set up a named tunnel)

---

### Option 3: Use ngrok (Quick Tunnel)

**Steps:**
1. Sign up at https://ngrok.com (free)
2. Download ngrok
3. Run:
   ```bash
   ngrok http 5173
   ```
4. Share the public URL (e.g., `https://abc123.ngrok.io`)

---

## 🚀 Recommended: Vercel Deployment

**Why Vercel?**
- Permanent URL that doesn't change
- Professional looking (your-name.vercel.app)
- Fast and reliable
- Free tier is generous
- Easy updates

**Quick Deploy Command:**
```bash
cd frontend
npm install -g vercel
vercel
```

That's it! You'll get a public URL in 2-3 minutes.

---

## 📝 Notes for Testers

When sharing, let testers know:
- "This is a testing version"
- "Report any bugs or issues"
- "Games may have minor glitches"

---

## 🔄 Updating After Changes

**Vercel:**
```bash
cd frontend
vercel --prod
```

**Cloudflare/ngrok:**
Just restart the tunnel (URL may change)

---

## ✅ After Testing

Once testing is complete and you're ready for launch:
- Update Vercel deployment to production
- Or set up a custom domain
- See `DEPLOY.md` for full production deployment guide












