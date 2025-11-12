"""
Nova Arcade Glitch — Python Socket.IO Game Server
Real-time game state communication for Contra
"""

from flask import Flask, jsonify
from flask_socketio import SocketIO, emit
import eventlet
import threading
import os
import sys

eventlet.monkey_patch()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"])

game_running = False
game_instance = None
game_thread = None

# Keyboard state
keys_state = set()

@socketio.on('connect')
def on_connect():
    print('[+] Client connected')
    emit('status', {'msg': 'Connected to Nova Arcade Socket Server'})

@socketio.on('disconnect')
def on_disconnect():
    print('[-] Client disconnected')

@socketio.on('start_game')
def start_game(data=None):
    global game_running, game_instance, game_thread
    
    if game_running:
        emit('status', {'msg': 'Game already running'})
        return
    
    game_running = True
    emit('status', {'msg': 'Starting Contra game...'})
    
    # Start game in background thread
    game_thread = socketio.start_background_task(run_contra_game)

@socketio.on('stop_game')
def stop_game(data=None):
    global game_running
    game_running = False
    emit('status', {'msg': 'Game stopped'})

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

def run_contra_game():
    """Run the Contra Pygame game and emit game state"""
    global game_running, game_instance, keys_state
    
    try:
        import pygame
        import json
        
        # Initialize Pygame
        pygame.init()
        
        # Create display
        display = pygame.display.set_mode((1280, 720))
        
        # Import game
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from main import Game
        
        # Create game instance
        game_instance = Game()
        
        clock = pygame.time.Clock()
        
        # Monkey patch pygame.key.get_pressed
        original_get_pressed = pygame.key.get_pressed
        
        def custom_get_pressed():
            keys = original_get_pressed()
            # Map web keys to pygame keys
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
        
        # Game loop
        tick_count = 0
        while game_running:
            dt = clock.tick(60) / 1000
            
            # Process events
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    game_running = False
                    break
            
            # Update game
            game_instance.platform_collisions()
            game_instance.all_sprites.update(dt)
            game_instance.bullet_collisions()
            
            # Draw
            display.fill((249, 131, 103))
            game_instance.all_sprites.custom_draw(game_instance.player)
            game_instance.overlay.display()
            pygame.display.update()
            
            # Emit game state every few ticks (reduce frequency)
            if tick_count % 3 == 0:  # ~20 FPS updates
                try:
                    socketio.emit('game_state', {
                        'player_x': game_instance.player.rect.x,
                        'player_y': game_instance.player.rect.y,
                        'health': game_instance.player.health,
                        'score': getattr(game_instance.overlay, 'score', 0),
                        'time': tick_count
                    })
                except Exception as e:
                    print(f"Error emitting state: {e}")
            
            tick_count += 1
            
    except Exception as e:
        error_msg = f"Game error: {str(e)}"
        print(error_msg)
        import traceback
        traceback.print_exc()
        socketio.emit('status', {'msg': error_msg, 'error': True})
        game_running = False
    finally:
        game_running = False
        if game_instance:
            try:
                pygame.quit()
            except:
                pass

@app.route('/health')
def health():
    return {'status': 'ok', 'game': 'contra', 'python': True, 'socketio': True}

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 Nova Arcade Glitch: Python Socket.IO Server")
    print("=" * 60)
    print("Running on http://localhost:8001")
    print("=" * 60)
    socketio.run(app, host="127.0.0.1", port=8001, debug=False)

