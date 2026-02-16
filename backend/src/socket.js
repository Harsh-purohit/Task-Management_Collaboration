import { Server } from "socket.io";
import {
  socketConnectionsTotal,
  socketConnectedClients,
} from "./metrics/index.js";

let io;

export const initSocket = (server) => {
  // Allow local dev origins plus configured frontend URL.
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://127.0.0.1:5173",
    "http://localhost:5173",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    // Lifetime socket connection counter.
    socketConnectionsTotal.inc();
    // Current active socket connections gauge.
    socketConnectedClients.inc();
    console.log("Socket connected:", socket.id);

    socket.on("disconnect", () => {
      // Decrement active clients on disconnect.
      socketConnectedClients.dec();
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
