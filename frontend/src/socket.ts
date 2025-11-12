import { io, Socket } from "socket.io-client";
import { GAME_SOCKET_URL } from "./config";

// In development, use relative path to leverage Vite proxy
// In production, use the full URL from environment variables
const SOCKET_URL = import.meta.env.DEV 
  ? "/" // Use Vite proxy in dev
  : (import.meta.env.VITE_BACKEND_URL ||
     import.meta.env.VITE_GAME_SOCKET_URL ||
     GAME_SOCKET_URL);

console.log("[Socket] Connecting to:", SOCKET_URL);
console.log("[Socket] Dev mode:", import.meta.env.DEV);
console.log("[Socket] Timestamp:", new Date().toISOString());

export const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  autoConnect: true,
  forceNew: false,
});

// Add connection event logging
socket.on("connect", () => {
  console.log("[Socket] Connected successfully! ID:", socket.id);
});

socket.on("connect_error", (error) => {
  console.error("[Socket] Connection error:", error.message);
  console.error("[Socket] Server URL:", SOCKET_URL);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] Disconnected:", reason);
});

export default socket;

