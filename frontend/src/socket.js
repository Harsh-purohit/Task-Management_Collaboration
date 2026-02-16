import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL;

const socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

export default socket;
