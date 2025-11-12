@echo off
echo ========================================
echo TELEGRAM BOT DEBUG MODE
echo ========================================
echo.

echo [1/4] Creating .env file...
(
echo TELEGRAM_BOT_TOKEN=8503408053:AAHL97CE5gTPdNMKlkwfbF_3bnhQaqKPucg
echo WEBAPP_URL=https://brilliant-cucurucho-b92e28.netlify.app
echo API_URL=http://localhost:5178
) > .env
echo ✅ .env file created
echo.

echo [2/4] Checking if .env exists...
if exist .env (
    echo ✅ .env file found
) else (
    echo ❌ .env file not created!
    pause
    exit /b 1
)
echo.

echo [3/4] Checking Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js
    pause
    exit /b 1
)
echo ✅ Node.js is installed
echo.

echo [4/4] Starting bot (showing all errors)...
echo.
echo ----------------------------------------
node bot.js
echo ----------------------------------------
echo.

if errorlevel 1 (
    echo ❌ Bot stopped with error!
) else (
    echo Bot stopped normally
)

echo.
pause
