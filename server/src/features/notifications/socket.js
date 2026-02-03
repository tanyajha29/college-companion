import { Server } from "socket.io";
import { env } from "../../config/env.js";

let io;

export const initSockets = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected", socket.id);
    socket.on("join", (room) => socket.join(room));
  });

  return io;
};

export const emitNotification = ({ room, event, payload }) => {
  if (!io) return;
  if (room) {
    io.to(room).emit(event, payload);
  } else {
    io.emit(event, payload);
  }
};
