@echo off
echo.
echo ========================================
echo   QUICK BUILD + AUTO-RUN
echo ========================================
echo.

cd frontend

echo Building...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo Build complete! Auto-opening browser...
echo.

timeout /t 2 /nobreak >nul
start http://localhost:4173

call npm run preview
