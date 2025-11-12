@echo off
echo.
echo ========================================
echo   NOVA GLITCH ARCADE - BUILD TEST
echo ========================================
echo.

cd frontend

echo [1/3] Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Building production bundle...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo [3/3] Starting preview server...
echo.
echo ========================================
echo   Build successful! 
echo   Auto-opening browser at http://localhost:4173
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

timeout /t 2 /nobreak >nul
start http://localhost:4173

call npm run preview
