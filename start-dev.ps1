# Nova Glitch Arcade - Development Startup Script
Write-Host '🚀 Starting Nova Glitch Arcade...' -ForegroundColor Green

# Start backend server in background
Write-Host '📦 Starting backend server...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -WindowStyle Normal

# Wait a moment
Start-Sleep -Seconds 3

# Start frontend server in background
Write-Host '🎮 Starting frontend server...' -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev" -WindowStyle Normal

Write-Host '✅ Both servers starting in separate windows!' -ForegroundColor Green
Write-Host ''
Write-Host 'Backend: http://localhost:5178' -ForegroundColor Yellow
Write-Host 'Frontend: http://localhost:5173' -ForegroundColor Yellow
Write-Host ''
Write-Host 'Opening frontend in browser...' -ForegroundColor Cyan
Start-Sleep -Seconds 5
$frontendUrl = 'http://localhost:5173'
Start-Process $frontendUrl

