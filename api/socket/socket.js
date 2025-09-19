import { Server } from "socket.io";

let io;

export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "https://roomify-theta-sable.vercel.app",
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
