# Python Contra Backend Setup

## Overview
This directory contains the Python/Pygame Contra game

## Setup Instructions

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
pip install flask flask-cors
```

### 2. Download Required Assets
The game requires graphics and audio assets. You need to manually download:
- `graphics/` folder (contains player, enemy, bullet sprites)
- `audio/` folder (contains music.wav)
- `data/` folder (contains map.tmx)

From the GitHub repository or clone the full repo.

### 3. Run the Server
```bash
python server.py
```

The server will run on http://localhost:8000

### 4. Integration with React
The React frontend automatically detects if the Python backend is running.
- If available: Uses Python version via iframe
- If not available: Falls back to TypeScript version

## Files Structure
- `main.py` - Main game loop (Pygame)
- `player.py` - Player class
- `enemy.py` - Enemy class
- `bullet.py` - Bullet class
- `entity.py` - Base entity class
- `settings.json` - Game settings
- `server.py` - Flask server wrapper
- `game.html` - Web interface wrapper

## Note
Pygame requires a display server and cannot run directly in a browser.
The Flask server provides an HTTP interface, but full Pygame integration
would require additional setup (headless display, frame streaming, etc.).

For now, the TypeScript version serves as the primary implementation.
