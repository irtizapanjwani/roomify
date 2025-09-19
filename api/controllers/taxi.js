import Taxi from "../models/Taxi.js";
import User from "../models/User.js";
import sendBookingEmail from "../utils/emailSender.js"; // ✅ Add this line

export const reserveTaxi = async (req, res, next) => {
  const { serviceType, pickupDate, pickupTime, pickupAddress } = req.body;
  const userId = req.user.id;

  try {
    // ✅ Find the user's email
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return res.status(400).json({ message: "User email not found" });
    }

    // ✅ Create taxi reservation
    const newTaxi = new Taxi({
      serviceType,
      pickupDate,
      pickupTime,
      pickupAddress,
      user: userId,
    });

    const savedTaxi = await newTaxi.save();

    // ✅ Update user's reservations
    await User.findByIdAndUpdate(userId, {
      $push: { reservations: savedTaxi._id },
    });

    // ✅ Send confirmation email
    await sendBookingEmail(
      user.email,
      serviceType,
      pickupDate,
      pickupTime,
      pickupAddress
    );

    res.status(201).json(savedTaxi);
  } catch (err) {
    console.error("Error during taxi reservation or email:", err);
    next(err);
  }
};
