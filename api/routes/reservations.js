import express from "express";
import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";
import { 
  createReservation, 
  getUserReservations, 
  cancelReservation,
  getAllReservations,
  updateReservationStatus
} from "../controllers/reservation.js";
import Reservation from "../models/Reservation.js";

const router = express.Router();

// Create a new reservation
router.post("/", verifyToken, createReservation);

// Get user's reservations
router.get("/user/:userId", verifyToken, getUserReservations);

// Cancel a reservation
router.delete("/:id", verifyToken, cancelReservation);

// Admin Routes
router.get("/admin/all", verifyToken, verifyAdmin, getAllReservations);
router.put("/:id/status", verifyToken, verifyAdmin, updateReservationStatus);

// Update payment status
router.put("/:id/pay", verifyToken, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify that the user owns this reservation
    if (reservation.userId.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to update this reservation" });
    }

    reservation.paymentStatus = "paid";
    // Once payment is made, confirm the reservation
    reservation.status = "Confirmed";
    await reservation.save();

    res.status(200).json({
      message: "Payment processed successfully",
      reservation
    });
  } catch (err) {
    next(err);
  }
});

// Get single reservation
router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("hotelId", "name address city");
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if the user owns this reservation or is an admin
    if (reservation.userId.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to view this reservation" });
    }

    res.status(200).json(reservation);
  } catch (err) {
    next(err);
  }
});

// Update reservation
router.put("/:id", verifyToken, async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Verify that the user owns this reservation
    if (reservation.userId.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ message: "You are not authorized to update this reservation" });
    }

    // Update allowed fields
    if (req.body.paymentStatus) reservation.paymentStatus = req.body.paymentStatus;
    if (req.body.status) reservation.status = req.body.status;
    
    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      data: reservation
    });
  } catch (err) {
    next(err);
  }
});

export default router;
