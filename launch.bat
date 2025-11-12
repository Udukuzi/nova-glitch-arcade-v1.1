@echo off
color 0A
echo ========================================
echo    NOVA GLITCH ARCADE LAUNCHER
echo    $NAG Token Powered Gaming Platform
echo    x402 Protocol Enabled
echo ========================================
echo.

echo [1/4] Starting backend server...
start "Nova Backend" cmd /k "cd server && npm run dev"

echo [2/4] Waiting for backend initialization...
timeout /t 5 /nobreak >nul

echo [3/4] Starting frontend application...
start "Nova Frontend" cmd /k "cd frontend && npm run dev"

echo [4/4] Waiting for frontend to build...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo    LAUNCHING GAME IN BROWSER...
echo ========================================
start http://localhost:5173

echo.
echo ========================================
echo    GAME LAUNCHED SUCCESSFULLY!
echo ========================================
echo.
echo    Backend API: http://localhost:5178
echo    Frontend UI: http://localhost:5173
echo    
echo    Features Active:
echo    - $NAG Token Economy
echo    - x402 Betting System
echo    - Anti-Cheat Protection
echo    - Competition Modes
echo    
echo    Press any key to view logs...
echo ========================================
pause >nul

echo.
echo Monitoring servers... Press Ctrl+C to stop all servers.
pause
