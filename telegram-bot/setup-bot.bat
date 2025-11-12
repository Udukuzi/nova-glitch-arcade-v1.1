@echo off
echo Setting up Telegram Bot...
echo.

echo TELEGRAM_BOT_TOKEN=8503408053:AAHL97CE5gTPdNMKlkwfbF_3bnhQaqKPucg> .env
echo WEBAPP_URL=https://brilliant-cucurucho-b92e28.netlify.app>> .env
echo API_URL=http://localhost:5178>> .env

echo ✅ Bot token configured!
echo.
echo Starting bot...
echo.

node bot.js
