import mongoose from "mongoose";

const SharedReservationSchema = new mongoose.Schema({
  reservationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reservation",
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    hasPaid: {
      type: Boolean,
      default: false
    },
    amountToPay: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: Date
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  amountPerUser: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["pending", "partially_paid", "confirmed", "cancelled", "expired"],
    default: "pending"
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) // 24 hours from creation
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a method to check if all participants have paid
SharedReservationSchema.methods.areAllParticipantsPaid = function() {
  return this.participants.every(participant => participant.hasPaid);
};

// Add a method to get total paid amount
SharedReservationSchema.methods.getTotalPaidAmount = function() {
  return this.participants.reduce((total, participant) => {
    return total + (participant.hasPaid ? participant.amountToPay : 0);
  }, 0);
};

export default mongoose.model("SharedReservation", SharedReservationSchema);
