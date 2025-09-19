import express from "express";
import { register, login } from "../controllers/auth.js";

const router = express.Router();

// Add error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));

export default router;