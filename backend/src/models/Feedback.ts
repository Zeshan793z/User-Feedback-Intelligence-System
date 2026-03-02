import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    message: String,
    category: String,
    priority: String,
    sentiment: String,
    team: String
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);