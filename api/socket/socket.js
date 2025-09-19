import { Server } from "socket.io";

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("🚖 Client connected:", socket.id);

    socket.on("driverLocation", ({ driverId, coords }) => {
      console.log(`📍 Location from driver ${driverId}:`, coords);

      // Broadcast to clients tracking this driver
      io.emit(`location-${driverId}`, coords);
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};
