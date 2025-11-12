# PowerShell script to run game_stream_server.py with combined logging
# Run this instead of Start-Process for better logging

$scriptPath = Join-Path $PSScriptRoot "game_stream_server.py"
$logPath = Join-Path $PSScriptRoot "server_log.txt"

# Kill any existing Python processes running the server
Get-Process python -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -eq "" 
} | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 1

# Start server with combined output logging
Start-Process python -ArgumentList $scriptPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $logPath `
    -RedirectStandardError $logPath `
    -WorkingDirectory $PSScriptRoot

Write-Host "Server started. Logs will be written to: $logPath"
Write-Host "Process ID: $((Get-Process python | Where-Object { $_.MainWindowTitle -eq "" } | Select-Object -First 1).Id)"





