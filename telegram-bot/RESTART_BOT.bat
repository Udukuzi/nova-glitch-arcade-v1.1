@echo off
echo ========================================
echo   RESTARTING NOVA ARCADE TELEGRAM BOT
echo ========================================
echo.

cd /d "%~dp0"

echo Stopping any running bot instances...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Nova*" 2>nul

echo.
echo Starting bot with trial gating enabled...
echo.

node bot.js

pause
