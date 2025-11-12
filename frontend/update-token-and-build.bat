@echo off
echo ========================================
echo UPDATING TOKEN ADDRESS AND BUILDING
echo ========================================
echo.

echo [1/3] Creating .env file with token address...
(
echo VITE_NAG_TOKEN_MINT=957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump
echo VITE_MINIMUM_NAG_BALANCE=100000
echo VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
) > .env
echo ✅ Token address configured: 957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump
echo ✅ Minimum balance: 100,000 NAG
echo.

echo [2/3] Building production app...
echo (This will take 1-2 minutes)
echo.
call npm run build

if errorlevel 1 (
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ BUILD COMPLETE!
echo ========================================
echo.
echo [3/3] Next steps:
echo 1. Go to: https://app.netlify.com
echo 2. Find your site: brilliant-cucurucho-b92e28
echo 3. Drag the "dist" folder to deploy
echo 4. Wait 1-2 minutes for deploy
echo 5. TEST: Visit https://novarcadeglitch.dev
echo.
echo Token gate will now check for 100,000 NAG tokens!
echo.
pause
