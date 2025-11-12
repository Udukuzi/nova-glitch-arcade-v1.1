# Socket.IO Connection Troubleshooting Guide

## Issues Fixed:

1. **Added explicit CORS support**: Flask-CORS now handles HTTP CORS, Socket.IO handles WebSocket CORS
2. **Added connection logging**: Both frontend and backend now log connection attempts
3. **Fixed socket connection logic**: Frontend now explicitly calls `socket.connect()` if not connected
4. **Added error handling**: Frontend now listens for `connect_error` events

## How to Debug:

1. **Check Browser Console** (F12):
   - Look for `[Socket] Connecting to: http://127.0.0.1:5001`
   - Look for `[Socket] Connection error:` messages
   - Look for `[Contra] Socket connected!` when successful

2. **Check Backend Window**:
   - Should show `[Socket] Client connected: <session_id>` when frontend connects
   - Should show `[OK] Game instance created successfully!`

3. **Test Connection Manually**:
   ```powershell
   curl http://127.0.0.1:5001/health
   ```

## Common Issues:

- **"Connection refused"**: Backend not running or wrong port
- **"CORS error"**: Fixed with Flask-CORS and Socket.IO CORS config
- **"Socket not connecting"**: Check browser console for specific error

## Next Steps:

1. Refresh the browser page (Ctrl+F5)
2. Open browser console (F12)
3. Navigate to Contra game
4. Check console logs for connection status






