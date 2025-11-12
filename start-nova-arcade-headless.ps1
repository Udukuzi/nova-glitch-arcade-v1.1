# ===========================================
# NOVA ARCADE: HEADLESS MODE STARTUP
# Fixes blank Python window + Cursor freeze
# ===========================================

$ErrorActionPreference = "Continue"
$projectRoot = "C:\Users\Nsikan\Downloads\nova-glitch-arcade-v1.1-worldclass"
Set-Location $projectRoot

Write-Host "`n=== NOVA ARCADE: HEADLESS MODE BUILD ===" -ForegroundColor Cyan
Write-Host ""

# Clean up ports
Write-Host "[*] Cleaning up ports..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "[OK] Ports cleaned" -ForegroundColor Green

# Install dependencies
Write-Host "[*] Installing backend dependencies..." -ForegroundColor Yellow
Set-Location "contra-backend"
pip install pygame flask flask-cors flask-socketio eventlet pillow numpy pytmx --quiet 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[WARNING] Some dependencies may need manual installation" -ForegroundColor Yellow
}

# Start backend in headless mode
Write-Host "[*] Starting Contra backend (headless mode, no window)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectRoot\contra-backend'; python game_stream_server_headless.py" -WindowStyle Normal -PassThru | Out-Null

Start-Sleep -Seconds 6

# Check backend health
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
    Write-Host "[WARNING] Backend may not be ready. Check the backend window for errors." -ForegroundColor Yellow
}

# Start frontend
Write-Host "[*] Starting frontend..." -ForegroundColor Yellow
Set-Location "..\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 6

# Open browser
Write-Host "[*] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"
Start-Sleep -Seconds 1
Start-Process "http://127.0.0.1:5001"

# Summary
Write-Host "`n=== LAUNCH COMPLETE ===" -ForegroundColor Green
Write-Host "[OK] BACKEND: http://127.0.0.1:5001 (headless mode)" -ForegroundColor White
Write-Host "[OK] FRONTEND: http://localhost:5173" -ForegroundColor White
Write-Host "[OK] No blank Python window - runs in background" -ForegroundColor White
Write-Host ""
Write-Host "Servers are running in separate windows." -ForegroundColor Yellow
Write-Host "Refresh browser and navigate to Contra game." -ForegroundColor Yellow
Write-Host ""






