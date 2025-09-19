import SharedReservation from "../models/SharedReservation.js";
import Reservation from "../models/Reservation.js";
import UserConnection from "../models/UserConnection.js";

export const createSharedReservation = async (req, res) => {
  try {
    const { reservationId, participants } = req.body;
    
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user._id;

    // Check if user owns the reservation
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    
    if (reservation.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to share this reservation" });
    }

    // Check if reservation is already shared
    const existingShared = await SharedReservation.findOne({ reservationId });
    if (existingShared) {
      return res.status(400).json({ message: "This reservation is already shared" });
    }

    // Validate participants (must be connected users)
    const validParticipants = [];
    for (const participantId of participants) {
      const connection = await UserConnection.findOne({
        $or: [
          { user1: userId, user2: participantId, status: "accepted" },
          { user1: participantId, user2: userId, status: "accepted" }
        ]
      });
      
      if (connection) {
        validParticipants.push({
          userId: participantId,
          hasPaid: false,
          amountToPay: 0 // Will be calculated below
        });
      }
    }

    if (validParticipants.length === 0) {
      return res.status(400).json({ message: "No valid participants found" });
    }

    // Calculate amount per user (including the original user)
    const amountPerUser = reservation.totalPrice / (validParticipants.length + 1);

    // Add the original reservation creator as a participant
    validParticipants.push({
      userId: userId,
      hasPaid: false,
      amountToPay: amountPerUser
    });

    // Update amounts for each participant
    validParticipants.forEach(participant => {
      participant.amountToPay = amountPerUser;
    });

    // Create shared reservation
    const sharedReservation = new SharedReservation({
      reservationId,
      createdBy: userId,
      participants: validParticipants,
      totalAmount: reservation.totalPrice,
      amountPerUser,
      status: "pending"
    });

    // Update the original reservation to reflect shared status
    await Reservation.findByIdAndUpdate(reservationId, {
      paymentStatus: "pending",
      status: "Pending"
    });

    await sharedReservation.save();

    // Populate participant information before sending response
    await sharedReservation.populate('participants.userId', 'username email');
    
    res.status(201).json({
      success: true,
      message: "Reservation shared successfully",
      data: sharedReservation
    });
  } catch (error) {
    console.error("Share reservation error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to share reservation" 
    });
  }
};

export const updatePaymentStatus = async (req, res) => {
  try {
    const { sharedReservationId } = req.params;
    
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user._id;

    // Find the shared reservation by its ID (not by reservationId)
    const sharedReservation = await SharedReservation.findById(sharedReservationId);

    if (!sharedReservation) {
      return res.status(404).json({ message: "Shared reservation not found" });
    }

    // Check if user is a participant
    const participant = sharedReservation.participants.find(
      p => p.userId.toString() === userId.toString()
    );

    if (!participant) {
      return res.status(403).json({ message: "Not a participant in this reservation" });
    }

    // Check if already paid
    if (participant.hasPaid) {
      return res.status(400).json({ message: "You have already paid your share" });
    }

    // Update payment status for this user
    participant.hasPaid = true;
    participant.paymentDate = new Date();

    // Check if all participants have paid
    const allPaid = sharedReservation.participants.every(p => p.hasPaid);
    if (allPaid) {
      sharedReservation.status = "confirmed";
      
      // Update the original reservation status
      await Reservation.findByIdAndUpdate(sharedReservation.reservationId, {
        paymentStatus: "paid",
        status: "Confirmed"
      });
    } else {
      sharedReservation.status = "partially_paid";
    }

    await sharedReservation.save();
    
    // Populate participant information before sending response
    await sharedReservation.populate('participants.userId', 'username email');
    await sharedReservation.populate('reservationId');
    await sharedReservation.populate('createdBy', 'username email');

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: sharedReservation
    });
  } catch (error) {
    console.error("Update payment status error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to update payment status" 
    });
  }
};

export const getSharedReservations = async (req, res) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user._id;
    
    // Get reservations where user is a participant
    const sharedReservations = await SharedReservation.find({
      $or: [
        { createdBy: userId },
        { "participants.userId": userId }
      ]
    })
    .populate({
      path: 'reservationId',
      populate: {
        path: 'hotelId',
        select: 'name photos address city'
      }
    })
    .populate('createdBy', 'username email')
    .populate('participants.userId', 'username email');

    res.json({
      success: true,
      data: sharedReservations
    });
  } catch (error) {
    console.error("Get shared reservations error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to fetch shared reservations" 
    });
  }
};

export const getSharedReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Ensure user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const userId = req.user._id;
    
    // Get the shared reservation
    const sharedReservation = await SharedReservation.findById(id)
      .populate('reservationId')
      .populate('createdBy', 'username email')
      .populate('participants.userId', 'username email');

    if (!sharedReservation) {
      return res.status(404).json({ message: "Shared reservation not found" });
    }

    // Check if user is a participant or creator
    const isParticipant = sharedReservation.participants.some(p => p.userId._id.toString() === userId.toString());
    const isCreator = sharedReservation.createdBy._id.toString() === userId.toString();

    if (!isParticipant && !isCreator) {
      return res.status(403).json({ message: "Not authorized to view this shared reservation" });
    }

    res.json({
      success: true,
      data: sharedReservation
    });
  } catch (error) {
    console.error("Get shared reservation error:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Failed to fetch shared reservation" 
    });
  }
};
