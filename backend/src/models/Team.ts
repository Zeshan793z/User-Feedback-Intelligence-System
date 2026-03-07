import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ["billing", "support", "product", "general"],
      required: true,
      unique: true
    },
    email: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Team", teamSchema);