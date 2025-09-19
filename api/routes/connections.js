import express from "express";
import mongoose from "mongoose";
import UserConnection from "../models/UserConnection.js";
import { verifyToken, verifyUser } from "../utils/verifyToken.js";
import User from "../models/User.js";

const router = express.Router();
router.use(verifyToken);

// Search users
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const users = await User.find({
      username: { $regex: query, $options: "i" },
      _id: { $ne: req.user._id }
    }).select("username email");

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Send connection request
router.post("/request", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ 
      message: "User ID is required",
      success: false
    });

    // Validate user ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ 
        message: "Invalid user ID format",
        error: "Invalid ObjectId format",
        success: false
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ 
        message: "Target user not found",
        error: "User does not exist",
        success: false
      });
    }

    // Check if connection already exists
    const existingConnection = await UserConnection.findOne({
      $or: [
        { user1: req.user._id, user2: userId },
        { user1: userId, user2: req.user._id }
      ]
    });

    if (existingConnection) {
      if (existingConnection.status === "pending") {
        return res.status(400).json({ 
          message: "Connection request already sent",
          error: "Request already pending",
          status: "pending",
          success: false
        });
      } else if (existingConnection.status === "accepted") {
        return res.status(400).json({ 
          message: "Users are already connected",
          error: "Already connected",
          status: "accepted",
          success: false
        });
      }
    }

    const newConnection = new UserConnection({
      user1: mongoose.Types.ObjectId(req.user._id),
      user2: mongoose.Types.ObjectId(userId),
      requestSentBy: mongoose.Types.ObjectId(req.user._id)
    });

    await newConnection.save();
    
    res.status(200).json({
      success: true,
      message: "Connection request sent successfully",
      connection: newConnection
    });
  } catch (err) {
    console.error("Error creating connection:", err);
    res.status(500).json({ 
      message: "Internal server error",
      error: err.message,
      success: false
    });
  }
});

// Get user's connections
router.get("/my-connections", async (req, res) => {
  try {
    const connections = await UserConnection.find({
      $or: [
        { user1: req.user._id },
        { user2: req.user._id }
      ]
    }).populate(["user1", "user2"]);

    res.status(200).json(connections);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Accept connection request
router.put("/accept/:connectionId", async (req, res) => {
  try {
    const connection = await UserConnection.findById(req.params.connectionId);
    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // Verify user is one of the users in the connection
    if (!connection.user1.equals(req.user._id) && !connection.user2.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    // Only user2 can accept the request
    if (!connection.user2.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the requested user can accept this request" });
    }

    connection.status = "accepted";
    await connection.save();

    res.status(200).json(connection);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Reject connection request
router.put("/reject/:connectionId", async (req, res) => {
  try {
    const connection = await UserConnection.findById(req.params.connectionId);
    if (!connection) return res.status(404).json({ message: "Connection not found" });

    // Verify user is one of the users in the connection
    if (!connection.user1.equals(req.user._id) && !connection.user2.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    // Only user2 can reject the request
    if (!connection.user2.equals(req.user._id)) {
      return res.status(403).json({ message: "Only the requested user can reject this request" });
    }

    connection.status = "rejected";
    await connection.save();

    res.status(200).json(connection);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get pending connections
router.get("/pending", verifyToken, async (req, res) => {
  try {
    const pendingConnections = await UserConnection.find({
      $or: [
        { user2: req.user._id, status: "pending" }
      ]
    }).populate("user1", "username email");

    res.json(pendingConnections);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending connections" });
  }
});

export default router;
