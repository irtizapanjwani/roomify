//i changed it ctr z back to original
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

// CREATE HOTEL
export const createHotel = async (req, res, next) => {
  const newHotel = new Hotel(req.body);
  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};

// UPDATE HOTEL
export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};

// DELETE HOTEL
export const deleteHotel = async (req, res, next) => {
  try {
    await Hotel.findByIdAndDelete(req.params.id);
    res.status(200).json("Hotel has been deleted.");
  } catch (err) {
    next(err);
  }
};

// GET A SINGLE HOTEL
export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};

// GET ALL HOTELS
export const getHotels = async (req, res, next) => {
  const { min = 1, max = 999, limit, featured, ...others } = req.query;
  try {
    const hotels = await Hotel.find({
      ...others,
      ...(featured && { featured: featured === "true" }),
      cheapestPrice: {
        $gte: parseInt(min),
        $lte: parseInt(max),
      },
    }).limit(parseInt(limit) || 100);
    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};

// COUNT BY CITY
export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => Hotel.countDocuments({ city }))
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

// COUNT BY TYPE
export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotel.countDocuments({ type: "hotel" });
    const apartmentCount = await Hotel.countDocuments({ type: "apartment" });
    const resortCount = await Hotel.countDocuments({ type: "resort" });
    const villaCount = await Hotel.countDocuments({ type: "villa" });
    const cabinCount = await Hotel.countDocuments({ type: "cabin" });

    res.status(200).json([
      { type: "hotel", count: hotelCount },
      { type: "apartment", count: apartmentCount },
      { type: "resort", count: resortCount },
      { type: "villa", count: villaCount },
      { type: "cabin", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

// GET HOTEL ROOMS
export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('rooms');

    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found" });
    }

    if (!hotel.rooms || hotel.rooms.length === 0) {
      return res.status(404).json({ success: false, message: "No rooms found for this hotel" });
    }

    res.status(200).json({ success: true, data: hotel.rooms });
  } catch (err) {
    next(err);
  }
};

