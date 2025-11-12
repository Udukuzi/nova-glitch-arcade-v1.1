# ===========================================
# NOVA ARCADE GLITCH - SIMPLIFIED STARTUP
# ===========================================

$ErrorActionPreference = "Stop"

$projectRoot = "C:\Users\Nsikan\Downloads\nova-glitch-arcade-v1.1-worldclass"
Set-Location $projectRoot

Write-Host "`n=== Starting Nova Arcade Glitch ===" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes
Write-Host "[*] Cleaning up old processes..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "[OK] Cleanup complete" -ForegroundColor Green

# Start backend server
Write-Host "[*] Starting backend server..." -ForegroundColor Yellow
$backendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\contra-backend'; python game_stream_server.py" -PassThru -WindowStyle Normal
Write-Host "[OK] Backend starting (PID: $($backendProc.Id))" -ForegroundColor Green

# Wait for backend to initialize
Start-Sleep -Seconds 5

# Check if backend is running
$backendRunning = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://127.0.0.1:5001/health" -TimeoutSec 2 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendRunning = $true
            Write-Host "[OK] Backend is responding!" -ForegroundColor Green
            break
        }
    } catch {
        Start-Sleep -Seconds 1
    }
}

if (-not $backendRunning) {
    Write-Host "[WARNING] Backend may not be ready yet. Check the backend window for errors." -ForegroundColor Yellow
}

# Start frontend server
Write-Host "[*] Starting frontend server..." -ForegroundColor Yellow
$frontendProc = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\frontend'; npm run dev" -PassThru -WindowStyle Normal
Write-Host "[OK] Frontend starting (PID: $($frontendProc.Id))" -ForegroundColor Green

# Wait for frontend to start
Start-Sleep -Seconds 6

# Open browser
Write-Host "[*] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:5001"

# Summary
Write-Host "`n=== LAUNCH COMPLETE ===" -ForegroundColor Green
Write-Host "[OK] BACKEND: http://127.0.0.1:5001" -ForegroundColor White
Write-Host "[OK] FRONTEND: http://localhost:5173" -ForegroundColor White
Write-Host "[OK] Game: Contra integration active" -ForegroundColor White
Write-Host ""
Write-Host "Servers are running in separate windows." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
