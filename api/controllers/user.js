import User from "../models/User.js";
import Reservation from "../models/Reservation.js";
import Hotel from "../models/Hotel.js";
import Taxi from "../models/Taxi.js";
import Room from "../models/Room.js";
import { createError } from "../utils/error.js";
import bcrypt from "bcryptjs";

export const updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Verify current password
    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordCorrect) {
      return next(createError(400, "Current password is incorrect"));
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, {
      $set: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(createError(404, "User not found!"));
    }

    // Don't allow deletion of admin users (optional security measure)
    if (user.isAdmin) {
      return next(createError(403, "Admin users cannot be deleted!"));
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // Hotel Reservations with populated data
    const reservations = await Reservation.find({
      _id: { $in: user.reservations || [] },
    })
    .populate("hotelId")
    .lean();

    const formattedReservations = reservations.map((res) => ({
      _id: res._id,
      status: res.status,
      paymentStatus: res.paymentStatus,
      totalPrice: res.totalPrice,
      reservation: {
        hotelName: res.hotelId?.name || "N/A",
        hotelPhoto: res.hotelId?.photos?.[0] || "",
        roomNum: res.roomNumbers || [],
        dateStart: res.dates?.[0] || null,
        dateEnd: res.dates?.[1] || null,
        location: res.hotelId?.address || "",
        city: res.hotelId?.city || "",
        totalPrice: res.totalPrice,
        createdAt: res.createdAt
      },
      desc: "Enjoy your stay!"
    }));

    // Taxi Reservations - Only process if user has taxi reservations
    let formattedTaxiBookings = [];
    if (user.taxiReservations && user.taxiReservations.length > 0) {
      try {
        const taxiBookings = await Taxi.find({
          _id: { $in: user.taxiReservations },
        });

        formattedTaxiBookings = taxiBookings.map((taxi) => ({
          _id: taxi._id,
          reservation: {
            serviceType: taxi.serviceType,
            pickupDate: taxi.pickupDate,
            pickupTime: taxi.pickupTime,
            pickupAddress: taxi.pickupAddress,
          },
          desc: "Enjoy your ride!",
        }));
      } catch (error) {
        console.error("Error fetching taxi reservations:", error);
      }
    }

    // Combine the data
    const userData = {
      ...user,
      reservations: formattedReservations,
      taxiReservations: formattedTaxiBookings
    };

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (err) {
    next(err);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .select("-password") // Exclude password from the response
      .populate({
        path: "reservations",
        select: "hotel room dates status" // Only select necessary fields
      });
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};

export const updateUserReservations = async (req, res, next) => {
  try {
    const { reservationId } = req.body;
    
    if (!reservationId) {
      return res.status(400).json({
        success: false,
        message: "Reservation ID is required"
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $push: { reservations: reservationId }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation added to user successfully",
      data: updatedUser
    });
  } catch (err) {
    next(err);
  }
};

export const cancelReservation = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const reservationId = req.params.reservationId;

    // Remove reservation reference from user
    await User.findByIdAndUpdate(userId, {
      $pull: { reservations: reservationId },
    });

    // Optionally delete the reservation itself from DB
    await Reservation.findByIdAndDelete(reservationId);

    res.status(200).json({ message: "Reservation cancelled successfully." });
  } catch (err) {
    next(err);
  }
};
