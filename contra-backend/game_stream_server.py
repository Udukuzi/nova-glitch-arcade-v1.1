from flask import Flask, jsonify
from flask_socketio import SocketIO
from flask_cors import CORS
import eventlet, socket, os

eventlet.monkey_patch()

app = Flask(__name__)
# Enable CORS for all routes (frontend dev on http://localhost:5174)
CORS(app, resources={r"/*": {"origins": ["http://localhost:5174", "http://127.0.0.1:5174", "*"]}})
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/')
def home():
    return 'Contra backend server is live!'

@app.route('/api/ping')
def ping():
    return jsonify({"ok": True, "message": "pong"})


def find_free_port(preferred_ports=[5001, 5000, 8000, 5050]):
    for port in preferred_ports:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(('127.0.0.1', port))
                s.close()
                return port
            except OSError:
                continue
    raise RuntimeError('No available port found!')


if __name__ == '__main__':
    port = find_free_port()
    print(f'[*] Contra backend starting on port {port} (binding 0.0.0.0)')

    # Write frontend .env with detected backend URL
    frontend_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'frontend', '.env')
    try:
        with open(frontend_env_path, 'w', encoding='utf-8') as f:
            f.write(f'VITE_BACKEND_URL=http://127.0.0.1:{port}\n')
            f.write(f'VITE_GAME_SOCKET_URL=http://127.0.0.1:{port}\n')
        print(f"[+] Wrote {frontend_env_path} with VITE_BACKEND_URL and VITE_GAME_SOCKET_URL -> http://127.0.0.1:{port}")
    except Exception as e:
        print(f"[!] Could not write frontend .env: {e}")

    socketio.run(app, host='0.0.0.0', port=port)
