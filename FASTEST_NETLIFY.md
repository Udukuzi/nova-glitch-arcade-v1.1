# ⚡ FASTEST Netlify Deploy (5 Minutes)

## 🚀 Quick Steps

### **Step 1: Build Frontend (1 minute)**
```powershell
cd frontend
npm run build
```

### **Step 2: Drag & Drop to Netlify (2 minutes)**
1. Go to: **https://app.netlify.com/drop**
2. **Drag** the `frontend/dist` folder onto the page
3. **Done!** Copy your URL (e.g., `https://random-name.netlify.app`)

### **Step 3: Expose Your Local Backend (2 minutes)**

**Download ngrok:** https://ngrok.com/download

**Run ngrok:**
```powershell
ngrok http 5178
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok-free.app`)

### **Step 4: Update Your Site (Optional - for persistence)**

If you want scores to persist, update and redeploy:

1. Edit `frontend/.env.production`:
   ```env
   VITE_API_BASE=https://your-ngrok-url.ngrok-free.app/api
   VITE_GAME_SOCKET_URL=https://your-ngrok-url.ngrok-free.app
   ```

2. Rebuild:
   ```powershell
   cd frontend
   npm run build
   ```

3. Drag `dist` folder to Netlify again (it will update)

---

## ✅ That's It!

**Your arcade is live at:** `https://your-site.netlify.app`

**Share with friends!**

---

## 🎮 Keep These Running

While testing, keep these PowerShell windows open:

**Window 1 - Backend:**
```powershell
cd server
npm run dev
```

**Window 2 - ngrok:**
```powershell
ngrok http 5178
```

---

## 💡 Even Faster Alternative

**If you don't want to deal with ngrok:**

Just use **localStorage** for testing (scores won't persist across devices, but games will work):

1. Build: `cd frontend && npm run build`
2. Drag `dist` to https://app.netlify.com/drop
3. Done!

Games will work, but each person's scores stay on their device only.

---

## 🎯 Summary

**Fastest (no backend):**
- Build → Drag to Netlify → Share URL
- **Time:** 3 minutes
- **Limitation:** Scores don't sync across devices

**Best (with backend):**
- Build → ngrok → Update config → Drag to Netlify
- **Time:** 5 minutes  
- **Benefit:** Full features, synced scores

---

**Which do you prefer?**
1. **Super fast** (3 min, no backend) - Good for quick gameplay testing
2. **Full features** (5 min, with ngrok) - Good for testing leaderboards too

Let me know! 🚀
