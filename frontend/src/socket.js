import { io } from "socket.io-client";

const socket_url = import.meta.env.VITE_SOCKET_URL;

const socket = io(socket_url, {
  transports: ["websocket"],
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

export default socket;
