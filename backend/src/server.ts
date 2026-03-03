import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/feedbacks", feedbackRoutes);
app.use("/api/analytics", analyticsRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));