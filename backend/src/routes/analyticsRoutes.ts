import express from "express";
import { getAnalytics } from "../controllers/analyticsController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = express.Router();

/**
 * @route   GET /api/analytics
 * @desc    Get feedback analytics
 * @access  Admin only
 */
router.get("/", protect, adminOnly, getAnalytics);

export default router;