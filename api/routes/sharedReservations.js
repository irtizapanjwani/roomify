import express from "express";
import { createSharedReservation, updatePaymentStatus, getSharedReservations, getSharedReservationById } from "../controllers/sharedReservationController.js";
import { verifyToken } from "../utils/verifyToken.js";

const router = express.Router();

// Protect all routes with authentication
router.use(verifyToken);

// Share a reservation with participants
router.post("/share", createSharedReservation);

// Get shared reservations
router.get("/", getSharedReservations);

// Get a single shared reservation
router.get("/:id", getSharedReservationById);

// Update payment status for a participant
router.put("/payment/:sharedReservationId", updatePaymentStatus);

export default router;
