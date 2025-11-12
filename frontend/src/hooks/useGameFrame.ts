import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { GAME_SOCKET_URL, BACKEND_URL } from "../config";

// Try ports in order: 5000, 8000, 5050, 5001 (fallback)
const BACKEND_PORTS = [5000, 8000, 5050, 5001];
const SOCKET_URL = import.meta.env.VITE_GAME_SOCKET_URL || GAME_SOCKET_URL;

function findBackendPort(): string {
  // If env var is set, use it
  if (import.meta.env.VITE_GAME_SOCKET_URL) {
    return import.meta.env.VITE_GAME_SOCKET_URL;
  }
  // Use BACKEND_URL from config (defaults to port 5000)
  return BACKEND_URL;
}

interface GameFrameHook {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  status: string;
  connected: boolean;
  gameState: any;
  sendKey: (key: string, pressed: boolean) => void;
}

export function useGameFrame(): GameFrameHook {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<string>("connecting");
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState<any>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Try to discover backend port by checking health endpoint
    const discoverBackendPort = async (): Promise<string> => {
      for (const port of BACKEND_PORTS) {
        try {
          const response = await fetch(`http://127.0.0.1:${port}/health`);
          if (response.ok) {
            const data = await response.json();
            console.log(`✅ Found backend on port ${port}`);
            return `http://127.0.0.1:${port}`;
          }
        } catch (e) {
          // Port not available, try next
          continue;
        }
      }
      // Fallback to default
      console.warn("⚠️ Could not discover backend port, using default");
      return SOCKET_URL;
    };

    let socket: Socket | null = null;
    
    discoverBackendPort().then((url) => {
      socket = io(url, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        setStatus("connected");
        setConnected(true);
        console.log("✅ Connected to game stream server");
      });

      socket.on("disconnect", () => {
        setStatus("disconnected");
        setConnected(false);
        console.log("❌ Disconnected from game stream server");
      });

      socket.on("connect_error", (error) => {
        setStatus(`Connection error: ${error.message}`);
        setConnected(false);
      });

      socket.on("status", (data: any) => {
        setStatus(data.msg || "connected");
        console.log("Status:", data);
      });

      socket.on("frame", (payload: { data: string }) => {
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.onerror = () => {
          console.error("Failed to load frame image");
        };
        img.src = "data:image/jpeg;base64," + payload.data;
      });

      socket.on("game_state", (data: any) => {
        setGameState(data);
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendKey = (key: string, pressed: boolean) => {
    if (socketRef.current && connected) {
      if (pressed) {
        socketRef.current.emit("key_down", { key });
      } else {
        socketRef.current.emit("key_up", { key });
      }
    }
  };

  return { canvasRef, status, connected, gameState, sendKey };
}

