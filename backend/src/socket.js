import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
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
    console.log("Socket connected:", socket.id);
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket not initialized");
  return io;
};
