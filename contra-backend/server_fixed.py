#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Nova Arcade Glitch - Contra Server (Fixed Headless Mode)
Fixed version based on user's script
"""

import io
import base64
import time
import traceback
import os
import sys
import json

# Fix Windows console encoding
if sys.platform == 'win32':
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
    except:
        pass

# Set SDL to dummy BEFORE pygame imports
os.environ["SDL_VIDEODRIVER"] = "windib"  # Use windib for Windows
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
from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO
from threading import Thread

# Initialize Flask + SocketIO
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

sio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# Initialize Pygame in headless mode
try:
    pygame.init()
    WIDTH, HEIGHT = 1280, 720
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
except:
    pass

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
    game_instance.display_surface = screen
    CONTRA_IMPORTED = True
    print("[OK] Game instance created successfully!")
    
    os.chdir(original_cwd)
except Exception as e:
    print(f"[ERROR] Contra import error: {e}")
    traceback.print_exc()
    CONTRA_IMPORTED = False

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
            
            # Capture and emit frame
            frame_b64 = surface_to_base64(screen)
            if frame_b64:
                sio.emit("frame", {"data": frame_b64}, broadcast=True)
            
            # Emit game state periodically
            if tick_count % (FPS * 2) == 0:
                try:
                    score = getattr(game_instance.overlay, 'score', 0)
                    sio.emit("game_state", {
                        "health": game_instance.player.health,
                        "score": score,
                        "time": tick_count
                    }, broadcast=True)
                except Exception as e:
                    print(f"[State Error] {e}")
            
            tick_count += 1
            
        except Exception as e:
            print(f"[Stream Error] {e}")
            traceback.print_exc()
            time.sleep(0.1)

@sio.on("connect")
def on_connect():
    global running
    print("🔗 Frontend connected to backend via SocketIO")
    sio.emit('status', {'msg': 'Connected to Contra server'})
    
    # Start game if not already running
    if not running:
        running = True
        Thread(target=game_loop, daemon=True).start()
        sio.emit('status', {'msg': 'Contra game started!'})

@sio.on("disconnect")
def on_disconnect():
    print("[Socket] Client disconnected")

@sio.on('key_down')
def on_key_down(data):
    """Handle key press"""
    if 'key' in data:
        keys_state.add(data['key'])

@sio.on('key_up')
def on_key_up(data):
    """Handle key release"""
    if 'key' in data:
        keys_state.discard(data['key'])

@app.route('/health')
def health():
    return {'status': 'ok', 'game': 'contra', 'streaming': running, 'contra_loaded': CONTRA_IMPORTED}

@app.route('/')
def index():
    return "✅ Contra backend is streaming in headless mode (fixed)."

def start_game():
    """Start game loop in background thread"""
    if CONTRA_IMPORTED and not running:
        Thread(target=game_loop, daemon=True).start()

if __name__ == "__main__":
    print("=" * 60)
    print("Nova Arcade Glitch - Contra Server (Fixed)")
    print("=" * 60)
    print(f"Game loaded: {CONTRA_IMPORTED}")
    print("Running on http://127.0.0.1:5001")
    print("=" * 60)
    
    try:
        sio.run(app, host="127.0.0.1", port=5001, debug=False, allow_unsafe_werkzeug=True)
    except KeyboardInterrupt:
        print("\n[Server] Shutting down...")
    except Exception as e:
        print(f"[ERROR] Server failed: {e}")
        traceback.print_exc()






