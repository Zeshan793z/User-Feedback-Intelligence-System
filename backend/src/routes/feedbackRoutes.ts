import express from "express";
import {
  createFeedback,
  getFeedbacks
} from "../controllers/feedbackController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @route   POST /api/feedbacks
 * @desc    Create feedback (AI analyzed)
 * @access  Public (or protect if you want only logged users)
 */
router.post("/", createFeedback);

/**
 * @route   GET /api/feedbacks
 * @desc    Get all feedbacks
 * @access  Admin only
 */
router.get("/", protect, adminOnly, getFeedbacks);

export default router;