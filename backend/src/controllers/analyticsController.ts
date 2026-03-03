import Feedback from "../models/Feedback";

export const getAnalytics = async (_: any, res: any) => {
  const total = await Feedback.countDocuments();

  const sentiment = await Feedback.aggregate([
    { $group: { _id: "$sentiment", count: { $sum: 1 } } }
  ]);

  const priority = await Feedback.aggregate([
    { $group: { _id: "$priority", count: { $sum: 1 } } }
  ]);

  res.json({ total, sentiment, priority });
};