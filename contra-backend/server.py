#!/usr/bin/env python3
"""
Nova Arcade Glitch — Simple Frame Streaming Server
Streams Contra game frames via Socket.IO
"""

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import pygame
import base64
import io
import threading
import time
import os
import sys

# Set SDL drivers for Windows (use windib as fallback)
try:
    os.environ["SDL_VIDEODRIVER"] = "windib"
except:
    pass
try:
    os.environ["SDL_AUDIODRIVER"] = "directsound"
except:
    pass

# Initialize Pygame
pygame.init()
pygame.mixer.init()

WIDTH, HEIGHT = 1280, 720
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Nova Arcade Glitch — Contra")

# Flask + Socket.IO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# Game state
game_instance = None
keys_state = set()
running = False

# Import Contra game
try:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from main import Game
    print("[Contra] Loading game...")
    game_instance = Game()
    game_instance.display_surface = screen
    print("[Contra] Game loaded successfully!")
except Exception as e:
    print(f"[Contra] Error loading game: {e}")
    import traceback
    traceback.print_exc()

@app.route('/')
def home():
    return "✅ Python Game Server Running (Nova Arcade Glitch - Contra)"

@app.route('/health')
def health():
    return {"status": "ok", "game": "contra", "loaded": game_instance is not None}

@socketio.on('connect')
def handle_connect():
    global running
    print("Client connected ✔")
    emit('status', {'msg': 'Connected to Python Game Server'})
    
    if not running and game_instance:
        running = True
        threading.Thread(target=game_loop, daemon=True).start()

@socketio.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

@socketio.on('frame_request')
def send_frame():
    try:
        buffer = io.BytesIO()
        pygame.image.save(screen, buffer, 'PNG')
        frame_data = base64.b64encode(buffer.getvalue()).decode('utf-8')
        emit('frame_update', {'frame': frame_data})
    except Exception as e:
        print(f"[Frame Error] {e}")

@socketio.on('key_down')
def handle_key_down(data):
    if 'key' in data:
        keys_state.add(data['key'])

@socketio.on('key_up')
def handle_key_up(data):
    if 'key' in data:
        keys_state.discard(data['key'])

def game_loop():
    """Main game loop"""
    global running, game_instance, keys_state
    
    if not game_instance:
        print("[ERROR] Game not loaded")
        return
    
    clock = pygame.time.Clock()
    
    # Monkey patch pygame.key.get_pressed
    original_get_pressed = pygame.key.get_pressed
    
    def custom_get_pressed():
        keys = original_get_pressed()
        key_map = {
            'KeyA': pygame.K_LEFT,
            'ArrowLeft': pygame.K_LEFT,
            'KeyD': pygame.K_RIGHT,
            'ArrowRight': pygame.K_RIGHT,
            'KeyW': pygame.K_UP,
            'ArrowUp': pygame.K_UP,
            'KeyS': pygame.K_DOWN,
            'ArrowDown': pygame.K_DOWN,
            'Space': pygame.K_SPACE,
            'KeyF': pygame.K_SPACE
        }
        for web_key in keys_state:
            if web_key in key_map:
                keys[key_map[web_key]] = True
        return keys
    
    pygame.key.get_pressed = custom_get_pressed
    
    while running:
        try:
            dt = clock.tick(60) / 1000.0
            
            # Process events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                    break
            
            # Update game
            game_instance.platform_collisions()
            game_instance.all_sprites.update(dt)
            game_instance.bullet_collisions()
            
            # Draw
            screen.fill((249, 131, 103))
            game_instance.all_sprites.custom_draw(game_instance.player)
            game_instance.overlay.display()
            pygame.display.flip()
            
            time.sleep(1/60)
            
        except Exception as e:
            print(f"[Game Loop Error] {e}")
            import traceback
            traceback.print_exc()
            time.sleep(0.1)

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Nova Arcade Glitch - Contra Server")
    print("=" * 60)
    print("Running on http://0.0.0.0:5000")
    print("=" * 60)
    socketio.run(app, host="0.0.0.0", port=5000, allow_unsafe_werkzeug=True)
