# ⚡ Quick Netlify Deployment Reference

## 🎯 The Problem & Solution

**Problem**: Multiple sites = Updates don't show  
**Solution**: Use ONE site, always deploy to it

---

## 🚀 Fast Deployment (3 Steps)

### **Step 1: Build**
```bash
cd frontend
npm run build
```

### **Step 2: Deploy to Your ONE Site**

**Option A: Using Site ID (Recommended)**
```bash
netlify deploy --prod --site-id=YOUR_SITE_ID
```

**Option B: Using Site Name**
```bash
netlify deploy --prod --site=YOUR_SITE_NAME
```

**Option C: If Linked (Easiest)**
```bash
netlify deploy --prod
```

---

## 🗑️ Remove Old Sites (One-Time Setup)

1. Go to: https://app.netlify.com/sites
2. Click each old site → **Site settings** → **Delete site**
3. Keep only ONE site

---

## 📋 Get Your Site ID/Name

1. Go to your site in Netlify dashboard
2. Click **Site settings**
3. **Site ID**: Under "General" section
4. **Site Name**: In the URL (`your-name.netlify.app`)

---

## ✅ One-Time Setup (Link Project)

```bash
cd frontend
netlify login
netlify link
# Select your site from the list
```

After this, just use: `npm run build && netlify deploy --prod`

---

**See `NETLIFY_DEPLOYMENT_FIX.md` for detailed instructions.**










