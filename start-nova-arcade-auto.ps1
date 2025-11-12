# ===========================================
# NOVA ARCADE: PYTHON GAME STREAM AUTO-RECOVERY
# ===========================================

$ErrorActionPreference = "Continue"
$projectRoot = "C:\Users\Nsikan\Downloads\nova-glitch-arcade-v1.1-worldclass"
Set-Location $projectRoot

Write-Host "`n=== NOVA ARCADE: AUTO-RECOVERY BUILD ===" -ForegroundColor Cyan
Write-Host ""

# 1. Clean up ports
Write-Host "[*] Cleaning up ports..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Kill specific ports if kill-port is available
try {
    npx kill-port 5000 5001 5173 8000 2>$null
} catch {
    Write-Host "[INFO] npx kill-port not available, using process cleanup" -ForegroundColor Gray
}

Write-Host "[OK] Ports cleaned" -ForegroundColor Green

# 2. Install dependencies
Write-Host "[*] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "contra-backend"
pip install flask flask-cors flask-socketio eventlet pygame pillow numpy pytmx --quiet 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Some dependencies may not have installed correctly" -ForegroundColor Yellow
}

# 3. Start backend with auto-restart
Write-Host "[*] Starting Python Contra Game Server..." -ForegroundColor Yellow
Write-Host "[INFO] Server will auto-restart on errors" -ForegroundColor Gray

# 3. Start backend (Python Contra) directly
Write-Host "[*] Starting Python Contra Game Server (server_fixed.py)..." -ForegroundColor Yellow
Set-Location "$projectRoot\contra-backend"
Start-Process powershell -ArgumentList "-NoExit","-Command","python server_fixed.py" -WindowStyle Normal -WorkingDirectory "$projectRoot\contra-backend"
Set-Location $projectRoot

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
    Write-Host "[WARNING] Backend may not be ready. Check the backend window." -ForegroundColor Yellow
}

# 4. Start Node API (server)
Write-Host "[*] Starting Node API server..." -ForegroundColor Yellow
Set-Location "$projectRoot\server"
Start-Process powershell -ArgumentList "-NoExit","-Command","npm run dev" -WindowStyle Normal
Set-Location $projectRoot

# Wait and verify Node API health
Start-Sleep -Seconds 4
$apiRunning = $false
for ($i = 0; $i -lt 15; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:5178/api/health" -TimeoutSec 2 -ErrorAction Stop
        if ($r.StatusCode -eq 200) { $apiRunning = $true; break }
    } catch { Start-Sleep -Milliseconds 700 }
}
if ($apiRunning) {
    Write-Host "[OK] Node API is responding!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Node API not responding yet. Check server window." -ForegroundColor Yellow
}

# 5. Start frontend
Write-Host "[*] Starting frontend..." -ForegroundColor Yellow
Set-Location "$projectRoot\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal
Set-Location $projectRoot

Start-Sleep -Seconds 6

# 6. Open browser
Write-Host "[*] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:5001"

# Summary
Write-Host "`n=== LAUNCH COMPLETE ===" -ForegroundColor Green
Write-Host "[OK] CONTRA BACKEND: http://127.0.0.1:5001" -ForegroundColor White
Write-Host "[OK] NODE API: http://localhost:5178/api/health" -ForegroundColor White
Write-Host "[OK] FRONTEND: http://localhost:5173" -ForegroundColor White
Write-Host "[OK] Auto-recovery enabled - server will restart on errors" -ForegroundColor White
Write-Host ""
Write-Host "Servers are running in separate windows." -ForegroundColor Yellow
Write-Host "Refresh the browser and navigate to Contra game." -ForegroundColor Yellow
Write-Host ""






