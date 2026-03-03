import Feedback from "../models/Feedback";
import { analyzeFeedback } from "../services/llmService";

export const createFeedback = async (req: any, res: any) => {
  try {
    const ai = await analyzeFeedback(req.body.message);

    const feedback = await Feedback.create({
      ...req.body,
      ...ai
    });

    res.status(201).json(feedback);
  } catch {
    res.status(500).json({ message: "Failed" });
  }
};

export const getFeedbacks = async (_: any, res: any) => {
  const data = await Feedback.find().sort({ createdAt: -1 });
  res.json(data);
};