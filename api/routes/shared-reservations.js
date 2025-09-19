// Get unread shared reservations
router.get("/unread", verifyToken, async (req, res) => {
  try {
    const unreadSharedReservations = await SharedReservation.find({
      "participants.userId": req.user._id,
      "participants.hasPaid": false,
      status: { $in: ["pending", "partially_paid"] }
    });

    res.json(unreadSharedReservations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching unread shared reservations" });
  }
}); 