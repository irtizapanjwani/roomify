import express from "express";
import { verifyToken } from "../utils/verifyToken.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// Send a message
router.post("/", verifyToken, async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user._id;

    // Create and save the message
    const newMessage = new Message({
      senderId,
      receiverId,
      message
    });

    await newMessage.save();

    // Populate sender info before sending response
    await newMessage.populate('senderId', 'username');

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message
    });
  }
});

// Get conversation between two users
router.get("/conversation/:userId", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user._id }
      ]
    })
    .populate('senderId', 'username')
    .populate('receiverId', 'username')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { 
        senderId: req.params.userId, 
        receiverId: req.user._id,
        isRead: false
      },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: error.message
    });
  }
});

// Get unread message count
router.get("/unread", verifyToken, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiverId: req.user._id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      data: count
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get unread count",
      error: error.message
    });
  }
});

export default router; 