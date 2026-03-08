import express from "express";
import {
  createFeedback,
  deleteFeedback,
  getFeedbacks,
} from "../controllers/feedbackController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/", protect, createFeedback);
router.get("/", protect, getFeedbacks);
router.delete("/:id", protect, deleteFeedback);
export default router;
