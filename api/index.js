import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http"; // Import http to create server
import { setupSocket } from "./socket/socket.js"; // import your socket setup function

import authRoute from "./routes/auth.js";
import usersRoute from "./routes/users.js";
import hotelsRoute from "./routes/hotels.js";
import roomsRoute from "./routes/rooms.js";
import taxiRoute from "./routes/taxi.js";
import reservationsRoute from "./routes/reservations.js";
import connectionsRoute from "./routes/connections.js";
import sharedReservationsRoute from "./routes/sharedReservations.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import stripeRoutes from "./routes/stripe.js";
import messagesRoute from "./routes/messages.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7000;

const server = http.createServer(app); // Create HTTP server wrapping express app

// Connect Socket.IO
setupSocket(server);

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to mongoDB.");
  } catch (error) {
    throw error;
  }
};

mongoose.connection.on("disconnected", () => {
  console.log("mongoDB disconnected!");
});

mongoose.connection.on("connected", () => {
  console.log("mongoDB connected!");
});

// middlewares
app.use(cors({
  origin: 'https://roomify-theta-sable.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes - all under /api except auth
app.use('/auth', authRoute);
app.use('/api/users', usersRoute);
app.use('/api/hotels', hotelsRoute);
app.use('/api/rooms', roomsRoute);
app.use('/api/taxi', taxiRoute);
app.use('/api/reservations', reservationsRoute);
app.use('/api/connections', connectionsRoute);
app.use('/api/shared-reservations', sharedReservationsRoute);
app.use('/api/stripe', stripeRoutes);
app.use("/api/messages", messagesRoute);

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// error handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: errorMessage,
    stack: err.stack,
  });
});

// Use server.listen, NOT app.listen, to integrate socket.io with express
server.listen(PORT, () => {
  connect();
  console.log(`Connected to backend on port ${PORT}!`);
});
