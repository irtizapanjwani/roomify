// controllers/stripe.js
import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';
import TaxiReservation from "../models/TaxiReservation.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body;

    // Ensure amount is a valid integer
    const amountInCents = Math.round(Number(amount));
    
    // Check for minimum amount ($0.50 = 50 cents)
    if (isNaN(amountInCents) || amountInCents < 50) {
      return res.status(400).json({ error: 'Amount must be at least $0.50 usd' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe payment intent error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 👇 Add this function
export const cancelReservationWithRefund = async (req, res) => {
    const { reservationId } = req.params;
  
    try {
      const reservation = await TaxiReservation.findById(reservationId);
  
      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }
  
      const reservationDateTime = new Date(`${reservation.pickupDate}T${reservation.pickupTime}`);
      const currentTime = new Date();
  
      const timeDiffMs = reservationDateTime - currentTime;
      const hoursDiff = timeDiffMs / (1000 * 60 * 60);
  
      // Set refund percentage
      const refundPercentage = hoursDiff >= 24 ? 1.0 : 0.8;
  
      // Simulate refund amount (e.g., assume $100 for testing)
      const totalPaid = 100; // You'd pull this from a real payment in production
      const refundAmount = Math.round(totalPaid * refundPercentage);
  
      // Simulate Stripe refund (replace with real paymentIntentId in real app)
      // await stripe.refunds.create({ payment_intent: reservation.paymentIntentId });
  
      // Delete the reservation
      await TaxiReservation.findByIdAndDelete(reservationId);
  
      res.status(200).json({
        message: `Reservation cancelled. ${refundPercentage * 100}% refunded.`,
        refundAmount,
      });
    } catch (err) {
      console.error("Refund error:", err);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  