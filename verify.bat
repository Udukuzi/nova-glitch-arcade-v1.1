@echo off
color 0A
echo ========================================
echo    NOVA GLITCH ARCADE VERIFICATION
echo ========================================
echo.

echo [1/5] Checking Frontend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing -TimeoutSec 2; Write-Host '  ✓ Frontend running on port 5173' -ForegroundColor Green } catch { Write-Host '  ✗ Frontend NOT running' -ForegroundColor Red }"

echo.
echo [2/5] Checking Backend Server...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:5178/api/health -UseBasicParsing -TimeoutSec 2; Write-Host '  ✓ Backend running on port 5178' -ForegroundColor Green } catch { Write-Host '  ✗ Backend NOT running (optional for testing)' -ForegroundColor Yellow }"

echo.
echo [3/5] Checking Node Modules...
if exist "frontend\node_modules" (
    echo   ✓ Frontend dependencies installed
) else (
    echo   ✗ Frontend dependencies missing - run: cd frontend ^&^& npm install
)

if exist "server\node_modules" (
    echo   ✓ Backend dependencies installed
) else (
    echo   ✗ Backend dependencies missing - run: cd server ^&^& npm install
)

echo.
echo [4/5] Checking Build Files...
if exist "frontend\dist" (
    echo   ✓ Frontend production build exists
) else (
    echo   ! No production build - run: cd frontend ^&^& npm run build
)

echo.
echo [5/5] Opening Browser...
echo.
echo ========================================
echo    OPENING GAME IN BROWSER...
echo ========================================
start http://localhost:5173

echo.
echo IMPORTANT INSTRUCTIONS:
echo ----------------------
echo 1. If page is BLANK: Press Ctrl+Shift+R to hard refresh
echo 2. Check browser console (F12) for any errors
echo 3. Try incognito mode if issues persist
echo.
echo WHAT YOU SHOULD SEE:
echo -------------------
echo - "NOVA ARCADE GLITCH" in glowing text
echo - Purple/cyan gradient background  
echo - Two buttons: "PLAY FREE TRIAL" and "ENTER LOBBY"
echo.
echo ========================================
echo    Press any key to exit...
echo ========================================
pause >nul
