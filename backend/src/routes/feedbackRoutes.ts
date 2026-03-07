import express from "express";
import {createFeedback,getFeedbacks} from "../controllers/feedbackController";
import {protect} from "../middleware/authMiddleware";

const router = express.Router();

router.post("/",protect,createFeedback);
router.get("/",protect,getFeedbacks);

export default router;