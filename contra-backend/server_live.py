import io, base64, time, traceback, os
from threading import Thread
import pygame, eventlet
from flask import Flask
from flask_socketio import SocketIO

# --- Ensure headless mode ---
os.environ["SDL_VIDEODRIVER"] = "windib"  # Use windib for Windows
os.environ["SDL_AUDIODRIVER"] = "directsound"

pygame.init()
screen = pygame.Surface((640, 480))

# --- Flask + SocketIO setup ---
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

@app.route("/")
def index():
    return "✅ Contra backend running and reachable."

@app.route("/health")
def health():
    return {"status": "ok", "game": "contra", "streaming": True}

def game_loop():
    clock = pygame.time.Clock()
    x = 0
    while True:
        try:
            screen.fill((10, 10, 30))
            pygame.draw.rect(screen, (255, 100, 100), (x % 560, 220, 80, 80))
            
            buffer = io.BytesIO()
            pygame.image.save(screen, buffer)
            encoded = base64.b64encode(buffer.getvalue()).decode("utf-8")
            
            # Frontend expects {"data": encoded} format
            socketio.emit("frame", {"data": encoded}, broadcast=True)
            
            x += 5
            clock.tick(30)
        except Exception as e:
            print("Frame error:", e)
            traceback.print_exc()
            time.sleep(1)

@socketio.on("connect")
def on_connect():
    print("🔗 Connected from frontend")
    socketio.emit('status', {'msg': 'Connected to Contra server'})

@socketio.on("disconnect")
def on_disconnect():
    print("[Socket] Client disconnected")

def start_game():
    Thread(target=game_loop, daemon=True).start()

if __name__ == "__main__":
    start_game()
    print("🔥 Contra backend server is live at http://127.0.0.1:5001")
    socketio.run(app, host="127.0.0.1", port=5001, debug=False, allow_unsafe_werkzeug=True)






