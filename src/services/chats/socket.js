import { io } from "socket.io-client";
import { getToken } from "../auth/authService"; // wherever you keep it

let socket = null;

const WS_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";
const WS_PATH = import.meta.env.REACT_APP_SOCKET_PATH || "/ws";

export function initSocket() {
  if (!socket) {
    const token = getToken();
    if (!token) throw new Error("No auth token found");

    socket = io(WS_URL, {
      path: WS_PATH,
      auth: { token },
      transports: ["websocket"],
    });
  }
  return socket;
}

export function joinRoom(room) {
  if (!socket) throw new Error("Socket not initialized");
  socket.emit("joinRoom", { room });
}

export function sendMessage(room, content,to) {
  if (!socket) throw new Error("Socket not initialized");
  socket.emit("sendMessage", { room, content,to });
}

export function onReceiveMessage(cb) {
  if (!socket) throw new Error("Socket not initialized");
  socket.on("receiveMessage", cb);
}

export function offReceiveMessage(cb) {
  if (!socket) return;
  socket.off("receiveMessage", cb);
}
// new: listen for the “saved and queued” ack from server
export function onMessageSent(cb) {
  if (!socket) throw new Error("Socket not initialized");
  socket.on("messageSent", cb);
}
export function offMessageSent(cb) {
  if (!socket) return;
  socket.off("messageSent", cb);
}
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
