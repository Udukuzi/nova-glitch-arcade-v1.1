@echo off
echo ========================================
echo REBUILDING WITH SOCIAL LINKS UPDATED
echo ========================================
echo.
echo Changes:
echo - DexScreener now ACTIVE in Footer
echo - Splash screen: Discord replaced with DexScreener
echo - All social links: X, DexScreener, Telegram
echo.
echo Building...
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
echo Next: Drag "dist" folder to Netlify
echo Test: https://novarcadeglitch.dev
echo.
pause
