import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { GAME_SOCKET_URL } from "../config";

const SOCKET_URL = import.meta.env.VITE_GAME_SOCKET_URL || GAME_SOCKET_URL;

interface GameState {
  player_x?: number;
  player_y?: number;
  health?: number;
  score?: number;
  time?: number;
}

interface SocketStatus {
  msg: string;
  error?: boolean;
}

export const useGameSocket = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [status, setStatus] = useState<string>("connecting...");
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("connected");
      setConnected(true);
      console.log("✅ Connected to game server");
      // Auto-start game when connected
      socket.emit("start_game");
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
      setConnected(false);
      console.log("❌ Disconnected from game server");
    });

    socket.on("connect_error", (error) => {
      setStatus(`Connection error: ${error.message}`);
      setConnected(false);
    });

    socket.on("status", (data: SocketStatus) => {
      setStatus(data.msg);
      if (data.error) {
        console.error("Game error:", data.msg);
      } else {
        console.log("Status:", data.msg);
      }
    });

    socket.on("game_state", (data: GameState) => {
      setGameState(data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("stop_game");
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

  return { gameState, status, connected, sendKey };
};







