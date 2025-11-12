#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Nova Arcade Glitch - Contra Server (Headless Mode)
Fixed for blank window + Cursor freeze issues
"""

import sys
import os
import io
import base64
import time
import traceback
import json
from threading import Thread

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

# Set SDL to dummy/headless BEFORE pygame imports
os.environ["SDL_VIDEODRIVER"] = "windib"  # Use windib for Windows, fallback to dummy if needed
os.environ["SDL_AUDIODRIVER"] = "directsound"

# Eventlet monkey patch FIRST
try:
    import eventlet
    eventlet.monkey_patch()
except Exception as e:
    print(f"[Warning] eventlet not available: {e}")

import pygame
from PIL import Image
import numpy as np
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO, emit

# Flask + Socket.IO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    async_mode='eventlet' if 'eventlet' in sys.modules else 'threading',
    logger=True,
    engineio_logger=True,
    ping_timeout=60,
    ping_interval=25
)

# Initialize Pygame in headless mode
try:
    pygame.init()
    WIDTH, HEIGHT = 1280, 720
    # Try HIDDEN first, fallback to normal if needed
    try:
        screen = pygame.display.set_mode((WIDTH, HEIGHT), pygame.HIDDEN)
    except:
        screen = pygame.display.set_mode((WIDTH, HEIGHT))
    pygame.display.set_caption("Contra Stream (Headless)")
    print("[OK] Pygame initialized in headless mode")
except Exception as e:
    print(f"[ERROR] Pygame init failed: {e}")
    sys.exit(1)

# Audio setup (optional)
try:
    pygame.mixer.init()
    print("[OK] Audio initialized")
except Exception as e:
    print(f"[Warning] Audio init failed: {e}")

# Import Contra game
CONTRA_IMPORTED = False
game_instance = None
keys_state = set()
running = False

try:
    # Change to contra-backend directory for settings.json
    original_cwd = os.getcwd()
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(backend_dir)
    
    from main import Game
    print("[OK] Game class found. Instantiating...")
    game_instance = Game()
    game_instance.display_surface = screen  # Use our headless screen
    CONTRA_IMPORTED = True
    print("[OK] Game instance created successfully!")
    
    # Restore original working directory
    os.chdir(original_cwd)
except Exception as e:
    print(f"[ERROR] Contra import error: {e}")
    traceback.print_exc()
    CONTRA_IMPORTED = False

# Game state
FPS = 30

def surface_to_base64(surface):
    """Convert Pygame Surface to base64 JPEG"""
    try:
        arr = pygame.surfarray.array3d(surface)
        img = Image.fromarray(arr.swapaxes(0, 1))
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85, optimize=True)
        return base64.b64encode(buf.getvalue()).decode('utf-8')
    except Exception as e:
        print(f"[Frame Error] {e}")
        return None

def game_loop():
    """Main game loop that streams frames"""
    global running, game_instance, keys_state
    
    if not CONTRA_IMPORTED:
        print("[ERROR] Contra game not imported. Cannot stream.")
        return
    
    clock = pygame.time.Clock()
    tick_count = 0
    
    # Monkey patch pygame.key.get_pressed
    original_get_pressed = pygame.key.get_pressed
    
    def custom_get_pressed():
        keys = original_get_pressed()
        key_map = {
            'KeyA': pygame.K_LEFT, 'ArrowLeft': pygame.K_LEFT,
            'KeyD': pygame.K_RIGHT, 'ArrowRight': pygame.K_RIGHT,
            'KeyW': pygame.K_UP, 'ArrowUp': pygame.K_UP,
            'KeyS': pygame.K_DOWN, 'ArrowDown': pygame.K_DOWN,
            'Space': pygame.K_SPACE, 'KeyF': pygame.K_SPACE
        }
        for web_key in keys_state:
            if web_key in key_map:
                keys[key_map[web_key]] = True
        return keys
    
    pygame.key.get_pressed = custom_get_pressed
    
    while running:
        try:
            dt = clock.tick(FPS) / 1000.0
            
            # Process pygame events
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
            
            # Capture and emit frame (async-safe)
            frame_b64 = surface_to_base64(screen)
            if frame_b64:
                # Use socketio.emit in background task for async safety
                socketio.start_background_task(
                    socketio.emit, 
                    "frame", 
                    {"data": frame_b64}, 
                    broadcast=True
                )
            
            # Emit game state periodically
            if tick_count % (FPS * 2) == 0:
                try:
                    score = getattr(game_instance.overlay, 'score', 0)
                    socketio.start_background_task(
                        socketio.emit,
                        "game_state",
                        {
                            "health": game_instance.player.health,
                            "score": score,
                            "time": tick_count
                        },
                        broadcast=True
                    )
                except Exception as e:
                    print(f"[State Error] {e}")
            
            tick_count += 1
            
        except Exception as e:
            print(f"[Stream Error] {e}")
            traceback.print_exc()
            time.sleep(0.1)

@socketio.on('connect')
def on_connect(auth=None):
    global running
    print(f"[Socket] Client connected")
    emit('status', {'msg': 'Connected to Contra server'})
    
    # Start game if not already running
    if not running:
        running = True
        socketio.start_background_task(game_loop)
        emit('status', {'msg': 'Contra game started!'})

@socketio.on('disconnect')
def on_disconnect():
    global clients
    print("[Socket] Client disconnected")

@socketio.on('key_down')
def on_key_down(data):
    """Handle key press"""
    if 'key' in data:
        keys_state.add(data['key'])

@socketio.on('key_up')
def on_key_up(data):
    """Handle key release"""
    if 'key' in data:
        keys_state.discard(data['key'])

@app.route('/health')
def health():
    return {'status': 'ok', 'game': 'contra', 'streaming': running, 'contra_loaded': CONTRA_IMPORTED}

@app.route('/')
def index():
    return "Contra backend is streaming in headless mode."

if __name__ == "__main__":
    print("=" * 60)
    print("Nova Arcade Glitch - Contra Server (Headless Mode)")
    print("=" * 60)
    print(f"Game loaded: {CONTRA_IMPORTED}")
    print("Running on http://127.0.0.1:5001")
    print("=" * 60)
    print("[INFO] Server starting (headless mode, no window)...")
    
    try:
        socketio.run(
            app, 
            host="127.0.0.1", 
            port=5001, 
            debug=False, 
            allow_unsafe_werkzeug=True,
            use_reloader=False,
            log_output=False
        )
    except KeyboardInterrupt:
        print("\n[Server] Shutting down...")
    except Exception as e:
        print(f"[ERROR] Server failed to start: {e}")
        traceback.print_exc()
        sys.exit(1)






