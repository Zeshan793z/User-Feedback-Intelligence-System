import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",authRoutes);
app.use("/api/feedback",feedbackRoutes);
app.use("/api/analytics",analyticsRoutes);

export default app;