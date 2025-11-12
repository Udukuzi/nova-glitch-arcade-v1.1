# 🚀 Immediate Action Plan - Nova Glitch Arcade

## 🎯 Quick Fixes You Can Implement Today

### 1️⃣ Fix Server Stability (15 minutes)

**Install PM2 for process management:**
```bash
# Install PM2 globally
npm install -g pm2

# Start backend with auto-restart
cd server
pm2 start npm --name "nova-backend" -- run dev

# Start frontend with auto-restart
cd ../frontend
pm2 start npm --name "nova-frontend" -- run dev

# Save PM2 configuration
pm2 save
pm2 startup

# View running processes
pm2 list

# View logs
pm2 logs
```

### 2️⃣ Add Security Headers (10 minutes)

**Install and configure helmet.js:**
```bash
cd server
npm install helmet
```

**Add to server/src/index.ts:**
```typescript
import helmet from 'helmet';

// Add after express initialization
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

### 3️⃣ Implement Rate Limiting (10 minutes)

**Install rate limiter:**
```bash
cd server
npm install express-rate-limit
```

**Add to server/src/index.ts:**
```typescript
import rateLimit from 'express-rate-limit';

// Create rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // 100 requests per window
});

// Apply to routes
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
```

### 4️⃣ Fix Environment Variables (5 minutes)

**Create production environment template:**
```bash
cd server
cat > .env.production.example << EOF
NODE_ENV=production
PORT=5178

# Supabase (Required)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key

# Security (Required - Generate strong random string)
JWT_SECRET=generate_strong_random_string_here

# Blockchain RPCs
BSC_RPC=https://bsc-dataseed.binance.org/
SOL_RPC=https://api.mainnet-beta.solana.com

# Token Configuration
MIN_HOLD=100000
MIN_STAKE=250000
TOKEN_DECIMALS=18
WHALE_THRESHOLD=1000000

# Optional: Early Access
TEST_ACCESS_PASSWORD=
ALLOWED_TEST_ADDRESSES=
EOF
```

### 5️⃣ Add Error Monitoring (20 minutes)

**Install Sentry:**
```bash
cd server
npm install @sentry/node
cd ../frontend
npm install @sentry/react
```

**Backend setup (server/src/index.ts):**
```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
  ],
  tracesSampleRate: 1.0,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add at the end, before app.listen
app.use(Sentry.Handlers.errorHandler());
```

**Frontend setup (frontend/src/main.tsx):**
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 6️⃣ Optimize Frontend Bundle (15 minutes)

**Update vite.config.ts for better optimization:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'wallet-vendor': ['@solana/web3.js', '@solana/wallet-adapter-react'],
          'ui-vendor': ['framer-motion', '@headlessui/react'],
        }
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 7️⃣ Add Health Check Monitoring (5 minutes)

**Create health check endpoint with details:**
```typescript
// In server/src/index.ts
app.get('/api/health', async (req, res) => {
  try {
    // Check database connection
    const { error } = await supabase.from('profiles').select('count').limit(1);
    
    const health = {
      status: error ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: error ? 'disconnected' : 'connected',
      version: process.env.npm_package_version || '1.1.0'
    };
    
    res.status(error ? 503 : 200).json(health);
  } catch (err) {
    res.status(503).json({ 
      status: 'unhealthy', 
      error: 'Service unavailable' 
    });
  }
});
```

### 8️⃣ Setup Basic Caching (10 minutes)

**Install node-cache:**
```bash
cd server
npm install node-cache
```

**Add caching to leaderboard:**
```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300 }); // 5 minute cache

app.get('/api/leaderboard/:game?', async (req, res) => {
  const { game } = req.params;
  const cacheKey = `leaderboard_${game || 'overall'}`;
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  // Fetch from database
  const query = supabase
    .from('sessions')
    .select('address, game, score')
    .order('score', { ascending: false })
    .limit(10);
    
  if (game) {
    query.eq('game', game);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  // Cache result
  cache.set(cacheKey, data);
  res.json(data);
});
```

---

## 📊 Deployment Quick Fix

### Deploy to Vercel + Railway (30 minutes)

#### Frontend to Vercel:
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Set root directory: `frontend`
5. Add environment variables:
   ```
   VITE_API_BASE=https://your-backend.railway.app/api
   VITE_GAME_SOCKET_URL=https://your-backend.railway.app
   ```
6. Deploy!

#### Backend to Railway:
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select repository
4. Set root directory: `server`
5. Add environment variables from `.env`
6. Deploy!

---

## 🔥 Top 3 Critical Fixes

### 🚨 1. Real Wallet Integration (MOST CRITICAL)
The app currently uses **mocked wallets**. This needs immediate attention:

```typescript
// Replace mock wallet provider with real implementation
// In frontend/src/contexts/WalletContext.tsx

import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { useWeb3React } from '@web3-react/core';

export function WalletProvider({ children }) {
  const solanaWallet = useSolanaWallet();
  const evmWallet = useWeb3React();
  
  // Implement real wallet connection logic
  const connectWallet = async (type: 'solana' | 'evm') => {
    if (type === 'solana') {
      await solanaWallet.connect();
    } else {
      // Connect EVM wallet
      await evmWallet.activate(injectedConnector);
    }
  };
  
  // ... rest of implementation
}
```

### 🚨 2. Database Security
Add Row Level Security (RLS) policies:

```sql
-- Run in Supabase SQL Editor
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = address);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = address);

CREATE POLICY "Anyone can view leaderboard" ON sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can create own sessions" ON sessions
  FOR INSERT WITH CHECK (auth.uid()::text = address);
```

### 🚨 3. Production Environment Setup
```bash
# Create production build script
cat > build-production.sh << 'EOF'
#!/bin/bash

echo "Building Nova Glitch Arcade for Production..."

# Build backend
echo "Building backend..."
cd server
npm ci --production
npm run build

# Build frontend
echo "Building frontend..."
cd ../frontend
npm ci
npm run build

# Create deployment package
echo "Creating deployment package..."
cd ..
tar -czf nova-arcade-production.tar.gz \
  server/dist \
  server/package*.json \
  frontend/dist

echo "Production build complete! 🚀"
echo "Deploy nova-arcade-production.tar.gz to your server"
EOF

chmod +x build-production.sh
```

---

## ⏰ Time Estimates

| Task | Time | Impact | Difficulty |
|------|------|--------|------------|
| PM2 Setup | 15 min | High | Easy |
| Security Headers | 10 min | High | Easy |
| Rate Limiting | 10 min | Critical | Easy |
| Environment Setup | 5 min | High | Easy |
| Error Monitoring | 20 min | High | Medium |
| Bundle Optimization | 15 min | Medium | Easy |
| Health Monitoring | 5 min | Medium | Easy |
| Basic Caching | 10 min | High | Easy |
| **Total** | **90 minutes** | - | - |

---

## 📝 Testing Checklist

After implementing fixes, test:

- [ ] Servers auto-restart on crash (PM2)
- [ ] Rate limiting blocks excessive requests
- [ ] Health endpoint returns proper status
- [ ] Leaderboard loads from cache (faster)
- [ ] Error tracking captures issues (Sentry)
- [ ] Production build completes successfully
- [ ] Environment variables load correctly
- [ ] Security headers present in responses

---

## 🎯 Next Steps After Quick Fixes

1. **Replace mock wallets** with real SDKs
2. **Add Redis** for persistent caching
3. **Implement WebSocket** for real-time features
4. **Add CI/CD pipeline** with GitHub Actions
5. **Setup monitoring** with Grafana
6. **Add automated testing** with Jest/Cypress
7. **Implement smart contracts** for tokenomics

---

*These improvements can be completed in 1-2 hours and will significantly improve the stability and security of your application!*
