import mongoose from "mongoose";
import dotenv from "dotenv";
import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";

dotenv.config();

const migrateRoomNumbers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB for migration...");

    // Get all reservations
    const reservations = await Reservation.find({
      $or: [
        { roomNumbers: { $exists: false } },
        { roomNumbers: { $size: 0 } }
      ]
    });

    console.log(`Found ${reservations.length} reservations to update`);

    // Update each reservation
    for (const reservation of reservations) {
      try {
        const roomNumbers = [];
        
        // For each roomId, find the room and get its number
        for (const roomId of reservation.roomIds) {
          const room = await Room.findOne({
            "roomNumbers._id": roomId
          });

          if (room) {
            const matchingRoomNumber = room.roomNumbers.find(
              r => r._id.toString() === roomId.toString()
            );
            if (matchingRoomNumber) {
              roomNumbers.push(matchingRoomNumber.number);
            }
          } else {
            // Try finding the room directly
            const directRoom = await Room.findById(roomId);
            if (directRoom && directRoom.roomNumbers && directRoom.roomNumbers.length > 0) {
              roomNumbers.push(directRoom.roomNumbers[0].number);
            }
          }
        }

        if (roomNumbers.length > 0) {
          // Update the reservation with room numbers
          const updatedReservation = await Reservation.findByIdAndUpdate(
            reservation._id,
            {
              $set: { roomNumbers: roomNumbers }
            },
            { new: true }
          );

          console.log(`Updated reservation ${reservation._id} with room numbers: ${roomNumbers.join(", ")}`);
        } else {
          console.log(`No room numbers found for reservation ${reservation._id}`);
          // Log the room IDs for debugging
          console.log("Room IDs:", reservation.roomIds);
        }
      } catch (err) {
        console.error(`Error updating reservation ${reservation._id}:`, err);
      }
    }

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
};

migrateRoomNumbers(); 