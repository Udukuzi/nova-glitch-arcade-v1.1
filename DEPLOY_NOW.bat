@echo off
echo ========================================
echo NOVA GLITCH ARCADE - QUICK DEPLOY
echo ========================================
echo.

echo [1/5] Installing dependencies...
cd frontend
call npm install
cd ..

echo.
echo [2/5] Building frontend...
cd frontend
call npm run build
cd ..

echo.
echo [3/5] Checking backend...
cd server
call npm install
cd ..

echo.
echo [4/5] Creating deployment package...
mkdir deploy_package 2>nul
xcopy /E /I /Y frontend\dist deploy_package\frontend
xcopy /E /I /Y server deploy_package\server

echo.
echo [5/5] Deployment package ready!
echo.
echo ========================================
echo NEXT STEPS:
echo ========================================
echo.
echo Option A: Deploy to Netlify
echo   1. Install: npm install -g netlify-cli
echo   2. Deploy: cd deploy_package/frontend ^&^& netlify deploy --prod
echo.
echo Option B: Deploy to Vercel
echo   1. Install: npm install -g vercel
echo   2. Deploy: cd deploy_package/frontend ^&^& vercel --prod
echo.
echo Option C: Manual Upload
echo   1. Upload deploy_package/frontend to your hosting
echo   2. Deploy server to Railway.app or Render.com
echo.
echo Backend Deployment:
echo   - Railway: https://railway.app
echo   - Render: https://render.com
echo   - Update VITE_API_URL in frontend .env
echo.
echo ========================================
echo.
pause
