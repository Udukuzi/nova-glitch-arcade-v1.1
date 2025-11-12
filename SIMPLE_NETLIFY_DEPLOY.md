# 🚀 Simple Netlify Deploy (Drag & Drop)

## ✅ Easy Option: Local Backend + Netlify Frontend

**For testing with friends, you can:**
1. Keep backend running on your computer
2. Deploy only frontend to Netlify
3. Use a tunnel (like ngrok) to expose your local backend

---

## 🎯 Super Simple Method (10 Minutes)

### **Step 1: Build Frontend (2 minutes)**

```powershell
cd frontend
npm run build
```

This creates a `dist` folder with your built site.

### **Step 2: Expose Local Backend (2 minutes)**

**Option A: ngrok (Recommended)**
1. Download: https://ngrok.com/download
2. Run:
   ```powershell
   ngrok http 5178
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)

**Option B: localtunnel**
```powershell
npx localtunnel --port 5178
```

### **Step 3: Update Frontend Config (1 minute)**

Edit `frontend/.env.production`:
```env
VITE_API_BASE=https://your-ngrok-url.ngrok.io/api
VITE_GAME_SOCKET_URL=https://your-ngrok-url.ngrok.io
```

Rebuild:
```powershell
cd frontend
npm run build
```

### **Step 4: Deploy to Netlify (5 minutes)**

**Drag & Drop Method:**
1. Go to: https://app.netlify.com/drop
2. Drag the `frontend/dist` folder onto the page
3. Done! Get your URL

**OR GitHub Method:**
1. Go to: https://app.netlify.com
2. **New site** → **Import from GitHub**
3. Select your repo
4. Base directory: `frontend`
5. Build command: `npm run build`
6. Publish directory: `frontend/dist`
7. Deploy!

### **Step 5: Keep Backend Running**

Keep this PowerShell window open:
```powershell
cd server
npm run dev
```

And keep ngrok running in another window.

---

## 🎮 Even Simpler: Local Testing Only

**If you just want to share with local testers:**

1. **Keep both servers running locally**
2. **Share your local IP** (e.g., `http://192.168.1.100:5173`)
3. **Testers on same WiFi can access it**

Find your IP:
```powershell
ipconfig
```
Look for "IPv4 Address"

---

## 💡 Best Option for Quick Testing

**I recommend:**

### **Option 1: Vercel (Easiest - No Backend Needed)**
1. Go to: https://vercel.com
2. Import from GitHub
3. Select `frontend` folder
4. Deploy
5. Uses your Supabase directly (no separate backend needed!)

### **Option 2: Netlify Drag & Drop + ngrok**
1. Build frontend: `npm run build`
2. Start ngrok: `ngrok http 5178`
3. Update `.env.production` with ngrok URL
4. Rebuild frontend
5. Drag `dist` folder to https://app.netlify.com/drop

### **Option 3: Just Share Locally**
1. Keep servers running
2. Share your local IP
3. Testers on same network can access

---

## 🤔 Which Should You Use?

| Method | Pros | Cons | Time |
|--------|------|------|------|
| **Vercel** | Easiest, no backend setup | Need GitHub | 5 min |
| **Netlify + ngrok** | Drag & drop | Need ngrok running | 10 min |
| **Local IP** | Instant | Same WiFi only | 1 min |
| **Full Deploy** | Professional | Need Railway + Netlify | 15 min |

---

## 🚀 My Recommendation for Testing

**Use Vercel!** It's the simplest:

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Select `frontend` folder
5. Add environment variables:
   ```
   VITE_API_BASE=http://localhost:5178/api
   VITE_GAME_SOCKET_URL=http://localhost:5178
   ```
6. Deploy!

**No backend deployment needed** - it uses Supabase directly!

---

## ✅ What Do You Want?

**For quick testing with 2-3 friends:**
→ Use **Local IP sharing** (1 minute)

**For testing with remote friends:**
→ Use **Vercel** (5 minutes, easiest)

**For professional deployment:**
→ Use **Railway + Netlify** (15 minutes)

---

**Tell me which option you prefer and I'll give you exact steps!** 🚀
