@echo off
echo ========================================
echo   NOVA GLITCH ARCADE - Starting...
echo ========================================
echo.

:: Navigate to frontend directory
cd frontend

:: Start the development server
echo Starting development server...
start /B cmd /c "npm run dev"

:: Wait for server to start (5 seconds)
echo Waiting for server to start...
timeout /t 5 /nobreak > nul

:: Open browser
echo Opening Nova Arcade in browser...
start http://localhost:5173

echo.
echo ========================================
echo   Nova Arcade is running!
echo   Browser should open automatically.
echo   
echo   If not, go to: http://localhost:5173
echo   
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

:: Keep window open
cmd /k
