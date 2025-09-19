// routes/taxi.js
import express from "express";
import TaxiReservation from "../models/TaxiReservation.js"; // ✅ import the model
import { verifyToken, verifyAdmin, verifyUser } from "../utils/verifyToken.js";

const router = express.Router();

// Add verifyToken middleware to protect all taxi routes
router.use(verifyToken);

// User Routes
router.post("/reserve", async (req, res, next) => {
  try {
    const { serviceType, pickupTime, pickupDate, pickupAddress } = req.body;

    const newReservation = new TaxiReservation({
      userId: req.user._id, // Changed from req.user.id to req.user._id
      serviceType,
      pickupTime,
      pickupDate,
      pickupAddress,
      paymentStatus: "pending" // Set initial payment status
    });

    const savedReservation = await newReservation.save(); // ✅ save to MongoDB

    res.status(200).json({
      message: "Taxi reserved successfully",
      data: savedReservation,
    });
  } catch (err) {
    console.error("Error saving reservation:", err); // 🔍 log the error
    next(err); // pass error to middleware
  }
});

// Get user's taxi reservations with status information
router.get("/reservations", async (req, res, next) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Get context from query parameter (optional)
    const context = req.query.context || "active";
    
    // Build query based on context
    let query = { userId: req.user._id };
    
    if (context === "active") {
      query = {
        ...query,
        $or: [
          { status: { $in: ["upcoming", "completed"] } },
          { paymentStatus: "paid" }
        ]
      };
    }

    const reservations = await TaxiReservation.find(query)
      .sort({ createdAt: -1 });
    
    // Add status information to each reservation
    const formattedReservations = reservations.map(reservation => ({
      ...reservation.toObject(),
      status: reservation.status || "upcoming", // Default to "upcoming" if not set
      paymentStatus: reservation.paymentStatus || "pending", // Default to "pending" if not set
      statusInfo: {
        type: reservation.status || "upcoming",
        payment: reservation.paymentStatus || "pending",
        description: getStatusDescription(reservation.status || "upcoming", reservation.paymentStatus || "pending")
      }
    }));
    
    res.status(200).json(formattedReservations);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    next(err);
  }
});

// Get single taxi reservation
router.get("/reservations/:id", async (req, res, next) => {
  try {
    const reservation = await TaxiReservation.findById(req.params.id);
    
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

// Helper function to get status description
function getStatusDescription(status, paymentStatus) {
  // Determine the final status based on both status and paymentStatus
  if (status === "cancelled") {
    return "Cancelled";
  } else if (paymentStatus === "refunded") {
    return "Refunded";
  } else if (status === "completed") {
    return "Completed";
  } else {
    return "Upcoming";
  }
}

// Update payment status
router.put("/reservations/:id/pay", async (req, res) => {
  try {
    const reservation = await TaxiReservation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    reservation.paymentStatus = "paid";
    await reservation.save();

    res.status(200).json({
      message: "Payment status updated successfully",
      reservation
    });
  } catch (err) {
    console.error("Error updating payment status:", err);
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

// Cancel and refund reservation
router.post("/reservations/:id/cancel", verifyToken, async (req, res, next) => {
  try {
    const reservation = await TaxiReservation.findById(req.params.id);
    
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // Check if user owns this reservation
    if (reservation.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to cancel this reservation" });
    }

    // Check if reservation is already cancelled
    if (reservation.status === "cancelled") {
      return res.status(400).json({ message: "Reservation is already cancelled" });
    }

    // Update reservation status
    reservation.status = "cancelled";
    reservation.paymentStatus = "refunded";
    await reservation.save();

    res.status(200).json({
      message: "Reservation cancelled successfully",
      data: {
        ...reservation.toObject(),
        statusInfo: {
          type: reservation.status,
          payment: reservation.paymentStatus,
          description: getStatusDescription(reservation.status, reservation.paymentStatus)
        }
      }
    });
  } catch (err) {
    console.error("Error cancelling reservation:", err);
    next(err);
  }
});

// Admin Routes
// Get all taxi reservations (admin only)
router.get("/admin/reservations", verifyAdmin, async (req, res, next) => {
  try {
    const reservations = await TaxiReservation.find()
      .populate('userId', 'username email')
      .sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    next(err);
  }
});

// Update taxi reservation status (admin only)
router.put("/admin/reservations/:id", verifyAdmin, async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const updatedReservation = await TaxiReservation.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    res.status(200).json(updatedReservation);
  } catch (err) {
    next(err);
  }
});

// Delete taxi reservation (admin only)
router.delete("/admin/reservations/:id", verifyAdmin, async (req, res, next) => {
  try {
    await TaxiReservation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Taxi reservation has been deleted." });
  } catch (err) {
    next(err);
  }
});

export default router;
