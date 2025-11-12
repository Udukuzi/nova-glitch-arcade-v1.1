@echo off
echo.
echo ========================================
echo   NETLIFY DEPLOYMENT - Nova Arcade
echo ========================================
echo.

cd frontend

echo [1/2] Building production bundle...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed! Fix errors before deploying.
    pause
    exit /b 1
)

echo.
echo [2/2] Deploying to Netlify...
echo.
echo IMPORTANT: Make sure you have:
echo 1. Netlify CLI installed (npm install -g netlify-cli)
echo 2. Logged in (netlify login)
echo 3. Site initialized (netlify init - first time only)
echo.

choice /C YN /M "Ready to deploy to production"

if %ERRORLEVEL% EQU 2 (
    echo.
    echo Deployment cancelled.
    pause
    exit /b 0
)

echo.
echo Deploying...
call netlify deploy --prod

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   DEPLOYMENT SUCCESSFUL!
    echo ========================================
    echo.
    echo Your site is now live!
    echo Check the URL above.
    echo.
) else (
    echo.
    echo ERROR: Deployment failed!
    echo.
    echo If you haven't installed Netlify CLI:
    echo   npm install -g netlify-cli
    echo   netlify login
    echo   netlify init
    echo.
    echo Then run this script again.
    echo.
)

pause
