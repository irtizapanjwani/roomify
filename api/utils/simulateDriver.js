import { io } from "socket.io-client";

const socket = io("http://localhost:7000");

const driverId = "driver123";

// Karachi coordinates (near Clifton area)
const HOME_LOCATION = {
  lat: 24.8607, // Karachi's latitude
  lng: 67.0011  // Karachi's longitude
};

let lat = HOME_LOCATION.lat;
let lng = HOME_LOCATION.lng;

// Smaller movement radius to keep driver closer to home location
const MOVEMENT_RADIUS = 0.0005; // Approximately 50 meters

const moveDriver = () => {
  // Move within a smaller radius around home location
  lat += (Math.random() - 0.5) * MOVEMENT_RADIUS;
  lng += (Math.random() - 0.5) * MOVEMENT_RADIUS;

  // Ensure driver stays within reasonable distance of home
  lat = Math.max(HOME_LOCATION.lat - 0.002, Math.min(HOME_LOCATION.lat + 0.002, lat));
  lng = Math.max(HOME_LOCATION.lng - 0.002, Math.min(HOME_LOCATION.lng + 0.002, lng));

  const coords = { lat, lng };

  socket.emit("driverLocation", { driverId, coords });
  console.log("📦 Sent location:", coords);
};

socket.on("connect", () => {
  console.log("✅ Connected as simulated driver");
  // Update location every 2 seconds
  setInterval(moveDriver, 2000);
});
