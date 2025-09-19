import Reservation from "../models/Reservation.js";
import Room from "../models/Room.js";
import { createError } from "../utils/error.js"; 
import User from "../models/User.js";
import mongoose from "mongoose";

// export const createReservation = async (req, res, next) => {
//     const { userId, hotelId, roomIds, dates } = req.body;
  
//     try {
//       // 1. Create and save the reservation
//       const newReservation = new Reservation({ userId, hotelId, roomIds, dates });
//       const savedReservation = await newReservation.save();
  
//       // 2. Update room availability
//       await Promise.all(
//         roomIds.map(async (roomId) => {
//           await Room.updateOne(
//             { "roomNumbers._id": roomId },
//             { $push: { "roomNumbers.$.unavailableDates": { $each: dates } } }
//           );
//         })
//       );
  
//       // 3. Push reservation ID into user's reservations array
//       await User.findByIdAndUpdate(userId, {
//         $push: { reservations: savedReservation._id },
//       });
  
//       res.status(200).json(savedReservation);
//     } catch (err) {
//       next(err);
//     }
//   };

export const createReservation = async (req, res, next) => {
    const { userId, hotelId, roomIds, roomNumbers, dates, totalPrice } = req.body;
    try {
      // Validate room IDs
      const invalidIds = roomIds.filter(id => !mongoose.Types.ObjectId.isValid(id));
      if (invalidIds.length > 0) {
        return res.status(400).json({ error: "Invalid Room IDs: " + invalidIds.join(", ") });
      }
  
      const newReservation = new Reservation({ 
        userId, 
        hotelId, 
        roomIds, 
        roomNumbers, 
        dates,
        totalPrice,
        paymentStatus: "pending",
        status: "Pending"  // Always start as Pending until payment is made
      });
      
      const savedReservation = await newReservation.save();
  
      await Promise.all(
        roomIds.map(async (roomId) => {
          await Room.updateOne(
            { "roomNumbers._id": roomId },
            { $push: { "roomNumbers.$.unavailableDates": { $each: dates } } }
          );
        })
      );
  
      await User.findByIdAndUpdate(userId, { $push: { reservations: savedReservation._id } });
      
      res.status(200).json({
        success: true,
        reservationId: savedReservation._id,
        message: "Reservation created successfully. Please proceed to payment.",
        data: savedReservation
      });
    } catch (err) {
      next(err);
    }
};
  


// GET reservations by user ID
export const getUserReservations = async (req, res, next) => {
    try {
      const reservations = await Reservation.find({ userId: req.params.userId });
      res.status(200).json(reservations);
    } catch (err) {
      next(err);
    }
  };
  
  // DELETE reservation
//   export const cancelReservation = async (req, res, next) => {
//     try {
//       const reservationId = req.params.id;
//       const userId = req.body.userId;
  
//       const reservation = await Reservation.findById(reservationId);
//       if (!reservation) return res.status(404).json({ message: "Reservation not found" });
  
//       if (reservation.userId.toString() !== userId) {
//         return res.status(403).json({ message: "Not authorized to cancel this reservation" });
//       }
  
//       // Remove reservation from user's reservation array
//       await User.findByIdAndUpdate(userId, {
//         $pull: { reservations: reservationId },
//       });
  
//       // Delete the reservation itself
//       await Reservation.findByIdAndDelete(reservationId);
  
//       res.status(200).json({ message: "Reservation canceled successfully" });
//     } catch (err) {
//       next(err);
//     }
//   };
  
export const cancelReservation = async (req, res, next) => {
  try {
    const reservationId = req.params.id;
    const userId = req.body.userId;
    
    // Find the reservation
    const reservation = await Reservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify user owns the reservation
    if (reservation.userId.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to cancel this reservation" });
    }

    // Remove dates from room availability using roomIds
    await Promise.all(
      reservation.roomIds.map(async (roomId) => {
        // Find the room and update its availability
        const room = await Room.findOne({ "roomNumbers._id": roomId });
        if (room) {
          // Find the specific room number in the room's roomNumbers array
          const roomNumberIndex = room.roomNumbers.findIndex(
            rn => rn._id.toString() === roomId.toString()
          );

          if (roomNumberIndex !== -1) {
            // Remove the dates from the unavailableDates array
            const updatedUnavailableDates = room.roomNumbers[roomNumberIndex].unavailableDates.filter(
              date => !reservation.dates.some(
                reservationDate => reservationDate.getTime() === new Date(date).getTime()
              )
            );

            // Update the room's unavailableDates
            room.roomNumbers[roomNumberIndex].unavailableDates = updatedUnavailableDates;
            await room.save();
          }
        }
      })
    );

    // Remove reservation from user's reservations array
    await User.findByIdAndUpdate(userId, {
      $pull: { reservations: reservationId }
    });

    // Delete the reservation
    await Reservation.findByIdAndDelete(reservationId);

    res.status(200).json({ 
      success: true,
      message: "Reservation cancelled successfully and room dates freed up" 
    });
  } catch (err) {
    console.error("Error during cancellation:", err);
    next(err);
  }
};

// Admin: Get all reservations with populated data
export const getAllReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId", "username email")
      .populate("hotelId", "name address city")
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
};

// Admin: Update reservation status
export const updateReservationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ["Pending", "Confirmed", "Cancelled", "Completed"];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    // If cancelled, remove the dates from room availability
    if (status === "Cancelled") {
      await Promise.all(
        updatedReservation.roomIds.map(async (roomId) => {
          await Room.updateOne(
            { "roomNumbers._id": roomId },
            { $pull: { "roomNumbers.$.unavailableDates": { $in: updatedReservation.dates } } }
          );
        })
      );
    }

    res.status(200).json({
      success: true,
      data: updatedReservation
    });
  } catch (err) {
    next(err);
  }
};