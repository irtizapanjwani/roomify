import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createError } from "../utils/error.js";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const newUser = new User({
      ...req.body,
      password: hash,
    });

    await newUser.save();
    res.status(200).json({
      status: 'success',
      message: "User has been created successfully"
    });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate key error
      return next(createError(400, "Username or email already exists"));
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    // Validate request body
    const { username, password } = req.body;
    if (!username || !password) {
      return next(createError(400, "Username and password are required"));
    }

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return next(createError(400, "Wrong password or username"));
    }

    // Generate token
    const token = jwt.sign(
      { 
        _id: user._id, 
        isAdmin: user.isAdmin 
      },
      process.env.JWT,
      { expiresIn: '24h' }
    );

    // Prepare user data without sensitive information
    const { password: userPassword, ...userDetails } = user._doc;

    // Set cookie and send response
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })
      .status(200)
      .json({
        status: "success",
        data: {
          ...userDetails,
          access_token: token
        }
      });
  } catch (err) {
    next(err);
  }
};

