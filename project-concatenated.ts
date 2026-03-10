// FILE: backend\src\app.ts
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

// FILE: backend\src\config\db.ts
import mongoose from "mongoose";

export const connectDB = async () => {

try {

await mongoose.connect(process.env.MONGO_URI as string);

console.log("MongoDB connected");

} catch (error) {

console.error(error);

process.exit(1);

}

};

// FILE: backend\src\controllers\analyticsController.ts
import Feedback from "../models/Feedback";

export const getAnalytics = async(req:any,res:any)=>{

const sentiment = await Feedback.aggregate([
{$group:{_id:"$sentiment",count:{$sum:1}}}
]);

const category = await Feedback.aggregate([
{$group:{_id:"$category",count:{$sum:1}}}
]);

const priority = await Feedback.aggregate([
{$group:{_id:"$priority",count:{$sum:1}}}
]);

res.json({
sentiment,
category,
priority
});

};

// FILE: backend\src\controllers\authController.ts
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hash,
      role: "user",
    });

    // generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err: any) {
    console.error("Registration error:", err);

    // ✅ send back the actual error message for debugging
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role,
      name: user.name,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

//before deploy update

// import User from "../models/User";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// export const register = async(req:any,res:any)=>{

// const {name,email,password} = req.body;

// const hash = await bcrypt.hash(password,10);

// const user = await User.create({
// name,
// email,
// password:hash
// });

// res.json(user);

// };

// export const login = async(req:any,res:any)=>{

// const {email,password} = req.body;

// const user = await User.findOne({email});

// if(!user){
// return res.status(400).json({message:"User not found"});
// }

// const match = await bcrypt.compare(password,user.password);

// if(!match){
// return res.status(400).json({message:"Invalid password"});
// }

// const token = jwt.sign(
// {id:user._id,role:user.role},
// process.env.JWT_SECRET as string
// );

// res.json({
// token,
// role:user.role,
// name:user.name
// });
// };

// FILE: backend\src\controllers\feedbackController.ts
import Feedback from "../models/Feedback";
import { analyzeFeedback, FeedbackCategory } from "../services/llmService";
import { routeFeedbackEmail } from "../services/emailService";

export const createFeedback = async (req: any, res: any) => {
  try {
const { name, email, message } = req.body;
    // ✅ AI classification
    const ai = await analyzeFeedback(message);

    // ✅ Save feedback in MongoDB
    const feedback = await Feedback.create({
      name,
      email,
      message,
      category: ai.category,
      priority: ai.priority,
      sentiment: ai.sentiment,
    });

    // ✅ Route email to correct team
    await routeFeedbackEmail({
      ...feedback.toObject(),
      category: ai.category as FeedbackCategory,
    });

    res.status(201).json(feedback);
  } catch (error) {
    res.status(500).json({ message: "Failed to create feedback" });
  }
};

export const getFeedbacks = async (req: any, res: any) => {
  const { page = 1, limit = 10, search = "", category, priority } = req.query;

  const query: any = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    query.category = category;
  }

  if (priority) {
    query.priority = priority;
  }

  const data = await Feedback.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(data);
};

export const deleteFeedback = async (req: any, res: any) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};

///If rollback needed when gmail routing to differnt mailer or service provider

// import Feedback from "../models/Feedback";
// import { analyzeFeedback } from "../services/llmService";
// import { routeFeedbackEmail } from "../services/emailService"; // ✅ use helper

// export const createFeedback = async (req: any, res: any) => {
//   try {
//     const { name, email, message } = req.body;

//     const ai = await analyzeFeedback(message);

//     const feedback = await Feedback.create({
//       name,
//       email,
//       message,
//       category: ai.category,
//       priority: ai.priority,
//       sentiment: ai.sentiment,
//     });

//     // ✅ Automatically routes to correct team email
//     await routeFeedbackEmail(feedback);

//     res.status(201).json(feedback);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to create feedback" });
//   }
// };


// export const getFeedbacks = async(req:any,res:any)=>{

// const {page=1,limit=10,search="",category,priority} = req.query;

// const query:any = {};

// if(search){
// query.$or = [
// { name: { $regex: search, $options:"i"} },
// { message: { $regex: search, $options:"i"} }
// ];
// }

// if(category){
// query.category = category;
// }

// if(priority){
// query.priority = priority;
// }

// const data = await Feedback.find(query)
// .sort({createdAt:-1})
// .skip((page-1)*limit)
// .limit(Number(limit));

// res.json(data);

// };

// export const deleteFeedback = async(req:any,res:any)=>{

// try{

// await Feedback.findByIdAndDelete(req.params.id);

// res.json({message:"Deleted"});

// }catch{

// res.status(500).json({message:"Delete failed"});

// }

// };



// Rollback if needed, this is the original feedbackController.ts before refactoring to use Prisma instead of Mongoose

// import Feedback from "../models/Feedback";
// import { analyzeFeedback } from "../services/llmService";
// import { sendFeedbackEmail } from "../services/emailService";

// export const createFeedback = async(req:any,res:any)=>{

// try{

// const {name,email,message} = req.body;

// const ai = await analyzeFeedback(message);

// const feedback = await Feedback.create({

// name,
// email,
// message,
// category:ai.category,
// priority:ai.priority,
// sentiment:ai.sentiment

// });

// await sendFeedbackEmail(feedback);

// res.status(201).json(feedback);

// }catch(error){

// res.status(500).json({message:"Failed to create feedback"});

// }

// };

// export const getFeedbacks = async(req:any,res:any)=>{

// const {page=1,limit=10,search="",category,priority} = req.query;

// const query:any = {};

// if(search){
// query.$or = [
// { name: { $regex: search, $options:"i"} },
// { message: { $regex: search, $options:"i"} }
// ];
// }

// if(category){
// query.category = category;
// }

// if(priority){
// query.priority = priority;
// }

// const data = await Feedback.find(query)
// .sort({createdAt:-1})
// .skip((page-1)*limit)
// .limit(Number(limit));

// res.json(data);

// };

// export const deleteFeedback = async(req:any,res:any)=>{

// try{

// await Feedback.findByIdAndDelete(req.params.id);

// res.json({message:"Deleted"});

// }catch{

// res.status(500).json({message:"Delete failed"});

// }

// };

// FILE: backend\src\middleware\authMiddleware.ts
import jwt from "jsonwebtoken";

export const protect = (req:any,res:any,next:any)=>{

const token = req.headers.authorization?.split(" ")[1];

if(!token){
return res.status(401).json({message:"Unauthorized"});
}

const decoded:any = jwt.verify(
token,
process.env.JWT_SECRET as string
);

req.user = decoded;

next();

};

// FILE: backend\src\models\Feedback.ts
import e from "express";
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({

name:String,

email:String,

message:String,

category:String,

priority:String,

sentiment:String,

createdAt:{
type:Date,
default:Date.now
}

});

export default mongoose.model("Feedback",feedbackSchema);

// FILE: backend\src\models\User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true
},

password:{
type:String,
required:true
},

role:{
type:String,
enum:["user","admin"],
default:"user"
}

});

export default mongoose.model("User",userSchema);

// FILE: backend\src\routes\analyticsRoutes.ts
import express from "express";
import {getAnalytics} from "../controllers/analyticsController";

const router = express.Router();

router.get("/",getAnalytics);

export default router;

// FILE: backend\src\routes\authRoutes.ts
import express from "express";
import {register,login} from "../controllers/authController";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);

export default router;

// FILE: backend\src\routes\feedbackRoutes.ts
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


// FILE: backend\src\server.ts
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/db";

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{

console.log(`Server running on port ${PORT}`);

});

// FILE: backend\src\services\emailService.ts
import nodemailer from "nodemailer";

// ✅ Define feedback categories
export type FeedbackCategory =
  | "billing"
  | "bug"
  | "feature"
  | "performance"
  | "general"
  | "complain"
  | "complements";

// ✅ Category → Team mapping
const TEAM_MAP: Record<FeedbackCategory, string> = {
  billing: "zeshanahmed7793@gmail.com",
  bug: "zeshanahmed7793@gmail.com",
  feature: "zeshanahmed7793@gmail.com",
  performance: "zeshanahmed7793@gmail.com",
  general: "zeshanahmed7793@gmail.com",
  complain: "zeshanahmed7793@gmail.com",
  complements: "zeshanahmed7793@gmail.com",
};

export const sendFeedbackEmail = async (feedback: any, teamEmail: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!, // ✅ non-null assertion
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER!,
    to: teamEmail,
    subject: `[${feedback.priority?.toUpperCase()}] New Feedback Received`,
    text: `
Name: ${feedback.name}

Message:
${feedback.message}

Category: ${feedback.category}
Priority: ${feedback.priority}
Sentiment: ${feedback.sentiment}
    `,
  });
};

// ✅ Helper to route feedback to the right team
export const routeFeedbackEmail = async (feedback: { category: FeedbackCategory }) => {
  const teamEmail = TEAM_MAP[feedback.category] || process.env.TEAM_EMAIL!;
  await sendFeedbackEmail(feedback, teamEmail);
};


///If rollback needed when gmail routing to differnt mailer or service provider

// import nodemailer from "nodemailer";

// // Define feedback categories for gmail routing if using production grade remove this
// type FeedbackCategory = "billing" | "bug" | "feature" | "performance" 
// | "general" | "complain" | "complements";

// // Category → Team mapping
// // const TEAM_MAP: Record<string, string> = {
// //   billing: "billing@company.com",
// //   bug: "engineering@company.com",
// //   feature: "product@company.com",
// //   performance: "engineering@company.com",
// //   general: "support@company.com",
// // };

// const TEAM_MAP = {
//   billing: "zeshanahmed793@gmail.com",
//   bug: "zeshanahmed793@gmail.com",
//   feature: "zeshanahmed793@gmail.com",
//   performance: "zeshanahmed793@gmail.com",
//   general: "zeshanahmed793@gmail.com",
//   complain: "zeshanahmed793@gmail.com",
//   complements: "zeshanahmed793@gmail.com"
// };

// export const sendFeedbackEmail = async (feedback: any, teamEmail: string) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER!, // ✅ non-null assertion
//       pass: process.env.EMAIL_PASS!,
//     },
//   });

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER!,
//     to: teamEmail,
//     subject: `[${feedback.priority.toUpperCase()}] New Feedback Received`,
//     text: `
// Name: ${feedback.name}

// Message:
// ${feedback.message}

// Category: ${feedback.category}
// Priority: ${feedback.priority}
// Sentiment: ${feedback.sentiment}
//     `,
//   });
// };

// // Helper to route feedback to the right team
// export const routeFeedbackEmail = async (feedback: { category: FeedbackCategory }) => {
//   const teamEmail = TEAM_MAP[feedback.category] || process.env.TEAM_EMAIL!;
//   await sendFeedbackEmail(feedback, teamEmail);
// };


///If rollback needed

// import nodemailer from "nodemailer";

// export const sendFeedbackEmail = async (feedback:any)=>{

// const transporter = nodemailer.createTransport({

// service:"gmail",

// auth:{
// user:process.env.EMAIL_USER,
// pass:process.env.EMAIL_PASS
// }

// });

// await transporter.sendMail({

// from:process.env.EMAIL_USER,

// to:process.env.TEAM_EMAIL,

// subject:"New Feedback Received",

// text:`
// Name: ${feedback.name}

// Message:
// ${feedback.message}

// Category: ${feedback.category}
// Priority: ${feedback.priority}
// Sentiment: ${feedback.sentiment}
// `

// });

// };


// FILE: backend\src\services\llmService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

// ✅ Keep category type consistent with emailService.ts
export type FeedbackCategory =
  | "billing"
  | "bug"
  | "feature"
  | "performance"
  | "general"
  | "complain"
  | "complements";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeFeedback = async (
  message: string,
): Promise<{
  category: FeedbackCategory;
  priority: string;
  sentiment: string;
}> => {
  try {
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    // ✅ Rule-based prompt
    const prompt = `
You are an AI that classifies customer feedback.

Return ONLY a JSON object with: category, sentiment, priority.

Rules:

Categories:
- billing → payment, refund, subscription, invoice issues
- bug → crashes, errors, not working, freeze, hang, failure
- feature → feature requests
- performance → slow, lag, delay
- general → everything else
- complain → explicit complaints
- complements → praise or compliments

Sentiment:
- positive → praise or satisfaction
- neutral → informational or unclear
- negative → complaints, failures, problems, crashes, errors

Priority:
- high → crashes, payment failures, major bugs, errors, freezes
- medium → functional issues that affect usage but are not critical
- low → suggestions, minor problems, compliments

Special Rules:
- If feedback contains words like "crash", "error", "freeze", "hang", "not working", "failure" → ALWAYS classify as:
  { "category": "bug", "sentiment": "negative", "priority": "high" }
- If feedback contains "payment failed", "refund issue", "billing error" → ALWAYS classify as:
  { "category": "billing", "sentiment": "negative", "priority": "high" }

Feedback:
"${message}"

Return JSON ONLY, no extra text.
Example:
{
  "category":"bug",
  "sentiment":"negative",
  "priority":"high"
}
`;

const result = await model.generateContent(prompt);
const text = result.response.text();

// 🔎 Log raw AI output before cleaning/validation
console.log("AI raw output:", text);

const jsonMatch = text.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error("Invalid AI output");

const parsed: any = JSON.parse(jsonMatch[0]);

// 🔎 Log parsed JSON before applying allowed values
console.log("AI parsed JSON:", parsed);

    // ✅ Allowed values
    const allowedCategories: FeedbackCategory[] = [
      "billing",
      "bug",
      "feature",
      "performance",
      "general",
      "complain",
      "complements",
    ];
    const allowedPriority = ["low", "medium", "high"];
    const allowedSentiment = ["positive", "neutral", "negative"];

    // ✅ Runtime validation with safe defaults
    let category: FeedbackCategory = allowedCategories.includes(
      parsed.category as FeedbackCategory,
    )
      ? (parsed.category as FeedbackCategory)
      : "general";

    let priority: string = allowedPriority.includes(parsed.priority)
      ? parsed.priority
      : "medium";

    let sentiment: string = allowedSentiment.includes(parsed.sentiment)
      ? parsed.sentiment
      : "neutral";

    // ✅ Keyword override for critical cases
    const lowerMsg = message.toLowerCase();
    if (lowerMsg.includes("payment failed")) {
      category = "billing";
      priority = "high";
      sentiment = "negative";
    }
    if (
      lowerMsg.includes("crash") ||
      lowerMsg.includes("error") ||
      lowerMsg.includes("not working")
    ) {
      return { category: "bug", sentiment: "negative", priority: "high" };
    }

    return { category, priority, sentiment };
  } catch (error) {
    console.error("LLM failed. Using fallback:", error);
    return fallbackAnalyzer(message);
  }
};



///If rollback needed when gmail routing to differnt mailer or service provider

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// export const analyzeFeedback = async (message: string) => {
//   try {
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     const prompt = `
// You are a feedback classification AI.

// Classify the feedback using ONLY these categories:

// Categories:
// billing
// bug
// feature
// performance
// general
// complain
// complements

// Priority:
// low
// medium
// high

// Sentiment:
// positive
// neutral
// negative

// Return JSON ONLY:

// {
// "category":"",
// "priority":"",
// "sentiment":""
// }

// Feedback:
// ${message}
// `;

//     const result = await model.generateContent(prompt);

//     const text = result.response.text();

//     const cleaned = text
//       .replace(/```json/g, "")
//       .replace(/```/g, "")
//       .trim();

//     const data = JSON.parse(cleaned);

//     const allowedCategories = [
//       "billing",
//       "bug",
//       "feature",
//       "performance",
//       "general",
//     ];
//     const allowedPriority = ["low", "medium", "high"];
//     const allowedSentiment = ["positive", "neutral", "negative"];

//     if (
//       !allowedCategories.includes(data.category) ||
//       !allowedPriority.includes(data.priority) ||
//       !allowedSentiment.includes(data.sentiment)
//     ) {
//       throw new Error("Invalid AI output");
//     }

//     return data;
//   } catch (error) {
//     console.log("LLM failed. Using fallback");

//     return fallbackAnalyzer(message);
//   }
// };

// Rollback if needed, this is the original llmService.ts before refactoring to use Prisma instead of Mongoose
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// export const analyzeFeedback = async (message:string)=>{

// try{

// const model = genAI.getGenerativeModel({model:"gemini-pro"});

// const prompt = `
// Analyze the following feedback.

// Return JSON ONLY:

// {
// "category":"",
// "priority":"",
// "sentiment":""
// }

// Feedback:
// ${message}
// `;

// const result = await model.generateContent(prompt);

// const text = result.response.text();

// const cleaned = text.replace(/```json|```/g,"").trim();
// return JSON.parse(cleaned);

// }catch(error){

// console.log("LLM failed. Using fallback");

// return fallbackAnalyzer(message);

// }

// };


// FILE: backend\src\utils\fallbackAnalyzer.ts
import { FeedbackCategory } from "../services/llmService";

export const fallbackAnalyzer = (
  message: string
): { category: FeedbackCategory; priority: string; sentiment: string } => {
  const msg = message.toLowerCase();

  let sentiment: "positive" | "neutral" | "negative" = "neutral";
  let priority: "low" | "medium" | "high" = "medium";
  let category: FeedbackCategory = "general";
  // Bug detection
  if (
    msg.includes("crash") ||
    msg.includes("error") ||
    msg.includes("not working") ||
    msg.includes("freeze")
  ) {
    return {
      category: "bug",
      sentiment: "negative",
      priority: "high",
    };
  }

  // Billing detection
  if (
    msg.includes("payment") ||
    msg.includes("refund") ||
    msg.includes("billing")
  ) {
    return {
      category: "billing",
      sentiment: "negative",
      priority: "high",
    };
  }

  // Feature request
  if (msg.includes("feature") || msg.includes("add")) {
    return {
      category: "feature",
      sentiment: "neutral",
      priority: "low",
    };
  }

  return {
    category: "general",
    sentiment: "neutral",
    priority: "medium",
  };
};
///If rollback needed when gmail routing to differnt mailer or service provider

// export const fallbackAnalyzer = (message:string)=>{

// const msg = message.toLowerCase();

// let sentiment="neutral";
// let priority="medium";
// let category="general";

// if(msg.includes("bug") || msg.includes("error")){
// category="bug";
// priority="high";
// sentiment="negative";
// }

// if(msg.includes("feature")){
// category="feature";
// priority="low";
// }

// if(msg.includes("great") || msg.includes("good")){
// sentiment="positive";
// }

// return{
// category,
// priority,
// sentiment
// };

// };

// FILE: frontend\src\api\api.ts
import axios from "axios";

const api = axios.create({
  baseURL: "https://user-feedback-intelligence-system-2a4j.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

// FILE: frontend\src\App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


// FILE: frontend\src\components\AdminStats.tsx
import type { Feedback } from "../types/Feedback";

export default function AdminStats({ data }: { data: Feedback[] }) {
  const total = data.length;
  const urgent = data.filter((f) => f.priority === "high").length;
  const negative = data.filter((f) => f.sentiment === "negative").length;

  const cardStyle = "bg-white shadow-md rounded-xl p-6 flex flex-col gap-2";

  return (
    <div className="grid grid-cols-3 gap-6 mb-6">
      <div className={cardStyle}>
        <p className="text-sm text-gray-500">Total Feedback</p>
        <h2 className="text-3xl font-bold text-indigo-600">{total}</h2>
      </div>

      <div className={cardStyle}>
        <p className="text-sm text-gray-500">Urgent / High Priority</p>
        <h2 className="text-3xl font-bold text-orange-500">{urgent}</h2>
      </div>

      <div className={cardStyle}>
        <p className="text-sm text-gray-500">Negative Sentiment</p>
        <h2 className="text-3xl font-bold text-red-500">{negative}</h2>
      </div>
    </div>
  );
}

// FILE: frontend\src\components\FeedbackModal.tsx
import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Feedback } from "../types/Feedback";

interface FeedbackModalProps {
  onClose: () => void;
  onCreated: (feedback: Feedback) => void; // use Feedback type
}

export default function FeedbackModal({ onClose, onCreated }: FeedbackModalProps) {
  const [form, setForm] = useState({
    name: "",
    message: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!form.name || !form.message) {
      toast.error("Name and feedback message are required");
      return;
    }

    try {
      setLoading(true);

      // ✅ API call to create feedback
      const res = await api.post("/feedback", form);

      const createdFeedback = res.data;

      toast.success("Feedback submitted!");

      // ✅ send new feedback to dashboard for instant UI update
      onCreated(createdFeedback);

      // ✅ close modal
      onClose();

      // reset form
      setForm({ name: "", message: "", email: "" });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-1/3 shadow-lg">
        <h2 className="text-lg font-bold mb-6">Submit Feedback</h2>

        {/* Name */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            className="border border-gray-300 rounded-md p-2 w-full"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Feedback */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea
            className="border border-gray-300 rounded-md p-2 w-full"
            rows={4}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="border border-gray-300 rounded-md p-2 w-full"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "🚀 Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

//Before Deploy update 2

// import { useState } from "react";
// import api from "../api/api";
// import toast from "react-hot-toast";

// interface FeedbackModalProps {
//   onClose: () => void;
//   onCreated: () => void;
// }

// export default function FeedbackModal({
//   onClose,
//   onCreated,
// }: FeedbackModalProps) {
//   const [form, setForm] = useState({
//     name: "",
//     message: "",
//     email: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     if (!form.name || !form.message) {
//       toast.error("Name and feedback message are required");
//       return;
//     }

//     try {
//       setLoading(true);

//       await api.post("/feedback", form);

//       toast.success("Feedback submitted successfully!");

//       // reset form
//       setForm({
//         name: "",
//         message: "",
//         email: "",
//       });

//       // refresh dashboard
//       onCreated();
//     } catch (error) {
//       console.error(error); // ✅ now it's used
//       toast.error("Error submitting feedback");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg w-1/3 shadow-lg">
//         <h2 className="text-lg font-bold mb-6">Submit Feedback</h2>

//         {/* Name */}
//         <div className="mb-5">
//           <label className="block text-sm font-medium mb-1">Your Name</label>

//           <input
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-700"
//             placeholder="Zeshan Ahmed"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//         </div>

//         {/* Feedback */}
//         <div className="mb-5">
//           <label className="block text-sm font-medium mb-1">Feedback</label>

//           <textarea
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-700"
//             rows={4}
//             placeholder="Describe your feedback..."
//             value={form.message}
//             onChange={(e) => setForm({ ...form, message: e.target.value })}
//           />
//         </div>

//         {/* Email */}
//         <div className="mb-5">
//           <label className="block text-sm font-medium mb-1">Email</label>

//           <input
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-700"
//             placeholder="you@example.com"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-3">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 hover:bg-gray-100 rounded"
//           >
//             Cancel
//           </button>

//           <button
//             onClick={submit}
//             disabled={loading}
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
//           >
//             {loading ? "Submitting..." : "🚀 Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

//Before Deploy update

// import { useState } from "react";
// import api from "../api/api";
// import toast from "react-hot-toast";

// interface FeedbackModalProps {
//   onClose: () => void;
//   onCreated: () => void;
// }

// export default function FeedbackModal({
//   onClose,
//   onCreated,
// }: FeedbackModalProps) {
// const [form, setForm] = useState({
//   name: "",
//   message: "",
//   email: "",
// });

//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     try {
//       setLoading(true);
//       await api.post("/feedback", form);
//       toast.success("Feedback submitted successfully");
//       onCreated();
//       onClose();
//     } catch {
//       toast.error("Error submitting feedback");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg w-1/4 shadow-lg">
//         <h2 className="text-lg font-bold mb-6">Submit Feedback</h2>

//         {/* Name */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Your Name</label>
//           <input
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-600 placeholder-gray-400"
//             placeholder="Zeshan Ahmed"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//         </div>

//         {/* Feedback */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Feedback</label>
//           <textarea
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-600 placeholder-gray-400"
//             placeholder="Describe your detail feedback here please..."
//             value={form.message}
//             onChange={(e) => setForm({ ...form, message: e.target.value })}
//           />
//         </div>

//         {/* Email */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             className="border p-2 w-full mb-3 text-gray-600"
//             placeholder="you@example.com"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-2">
//           <button onClick={onClose} className="px-4 py-2  hover:bg-gray-100">
//             Cancel
//           </button>
//           <button
//             className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
//             onClick={submit}
//             disabled={loading}
//           >
//             {loading ? "Submitting..." : "🚀 Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// import { useState } from "react";
// import api from "../api/api";
// import toast from "react-hot-toast";

// interface FeedbackModalProps {
//   onClose: () => void;
//   onCreated: () => void;
// }

// export default function FeedbackModal({ onClose, onCreated }: FeedbackModalProps) {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     try {
//       setLoading(true);
//       await api.post("/feedback", form);
//       toast.success("Feedback submitted successfully");
//       onCreated();
//       onClose();
//     } catch {
//       toast.error("Error submitting feedback");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg w-1/4 shadow-lg">
//         <h2 className="text-lg font-bold mb-4">Submit Feedback</h2>

//         {/* Name */}
//         <label className="block text-sm font-medium mb-1">Your Name</label>
//         <input
//           className="border p-2 w-full mb-3 text-gray-600"
//           placeholder="Zeshan Ahmed"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />

//         {/* Feedback */}
//         <label className="block text-sm font-medium mb-1">Feedback</label>
//         <textarea
//           className="border p-2 w-full mb-3 text-gray-600"
//           placeholder="Describe your feedback details here please..."
//           value={form.message}
//           onChange={(e) => setForm({ ...form, message: e.target.value })}
//         />

//         {/* Buttons */}
//         <div className="flex justify-end gap-2 mt-4">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
//             onClick={submit}
//             disabled={loading}
//           >
//             {loading ? "Submitting..." : "🚀 Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


// FILE: frontend\src\components\FeedbackTable.tsx
import SentimentBadge from "./SentimentBadge";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Feedback } from "../types/Feedback";

interface FeedbackTableProps {
  data: Feedback[];
  reload: () => Promise<void>;
  searchTerm?: string;
}

export default function FeedbackTable({
  data,
  reload,
  searchTerm,
}: FeedbackTableProps) {
  const role = localStorage.getItem("role");

  // Highlight search matches
  const highlight = (text: string) => {
    if (!searchTerm || searchTerm.trim() === "") return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span
          key={index}
          className="bg-yellow-200 text-black px-1 rounded font-semibold"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const deleteFeedback = async (id: string) => {
    try {
      await api.delete(`/feedback/${id}`);
      toast.success("Feedback deleted");

      await reload();
    } catch {
      toast.error("Failed to delete feedback");
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="w-full text-sm text-center">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="p-3">User</th>
            <th className="p-3">Feedback</th>
            <th className="p-3">Category</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Sentiment</th>
            <th className="p-3">Date</th>
            {role === "admin" && <th className="p-3">Action</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((f) => (
            <tr
              key={f._id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="p-2">{highlight(f.name)}</td>

              <td className="p-2 text-left max-w-lg">
                {highlight(f.message)}
              </td>

              <td className="p-2 capitalize">{f.category}</td>

              <td className="p-2 capitalize">{f.priority}</td>

              <td className="p-2">
                <SentimentBadge
                  sentiment={
                    f.sentiment as "positive" | "neutral" | "negative"
                  }
                />
              </td>

              <td className="p-3">
                {new Date(f.createdAt).toLocaleDateString()}
              </td>

              {role === "admin" && (
                <td className="p-3">
                  <button
                    className="text-red-500 hover:text-red-700 font-semibold"
                    onClick={() => deleteFeedback(f._id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {data.length === 0 && (
        <div className="p-6 text-gray-500 text-center">
          No feedback found.
        </div>
      )}
    </div>
  );
}


//Before deploy update

// import SentimentBadge from "./SentimentBadge";
// import api from "../api/api";
// import toast from "react-hot-toast";
// import type { Feedback } from "../types/Feedback";

// //Before deploy update

// // interface FeedbackTableProps {
// //   data: Feedback[];
// //   reload: () => void;
  
// // }

// interface FeedbackTableProps {
//   data: Feedback[];
//   reload: () => Promise<void>;
//   searchTerm?: string; // optional
// }


// export default function FeedbackTable({ data, reload }: FeedbackTableProps) {
//   const role = localStorage.getItem("role");

//   const deleteFeedback = async (id: string) => {
//     try {
//       await api.delete(`/feedback/${id}`);
//       toast.success("Feedback deleted");
//       reload();
//     } catch {
//       toast.error("Failed to delete feedback");
//     }
//   };

//   return (
//     <div className="bg-white shadow rounded-lg overflow-hidden">
//       <table className="w-full text-sm text-center">
//         <thead className="bg-gray-100 text-gray-700">
//           <tr>
//             <th className="p-3">User</th>
//             <th className="p-3">Feedback</th>
//             <th className="p-3">Category</th>
//             <th className="p-3">Priority</th>
//             <th className="p-3">Sentiment</th>
//             <th className="p-3">Date</th>
//             {role === "admin" && <th className="p-3">Action</th>}
//           </tr>
//         </thead>

//         <tbody>
//           {data.map((f) => (
//             <tr key={f._id} className="border-t">
//               <td className="p-2">{f.name}</td>
//               <td>{f.message}</td>
//               <td>{f.category}</td>
//               <td>{f.priority}</td>
//               <td>
//                 <SentimentBadge
//                   sentiment={f.sentiment as "positive" | "neutral" | "negative"}
//                 />
//               </td>

//               <td className="p-3">
//                 {new Date(f.createdAt).toLocaleDateString()}
//               </td>

//               {role === "admin" && (
//                 <td className="p-3">
//                   <button
//                     className="text-red-500 hover:text-red-700 font-semibold"
//                     onClick={() => deleteFeedback(f._id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               )}
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// FILE: frontend\src\components\FiltersBar.tsx
import { Search, X } from "lucide-react";

interface FiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  searchLoading?: boolean; // optional indicator
}

export default function FiltersBar({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  searchLoading,
}: FiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 mb-6 items-center">

      {/* SEARCH INPUT */}
      <div className="relative flex-1 min-w-[220px]">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          placeholder="Search feedback or user name..."
          className="border p-2 pl-9 pr-8 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Clear button */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <X size={16} />
          </button>
        )}

        {/* Search loading indicator */}
        {searchLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
        )}
      </div>

      {/* CATEGORY FILTER */}
      <select
        className="border p-2 rounded min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature</option>
        <option value="performance">Performance</option>
        <option value="billing">Billing</option>
        <option value="general">General</option>
      </select>

      {/* PRIORITY FILTER */}
      <select
        className="border p-2 rounded min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

    </div>
  );
}

//Before deploy update

// interface FiltersBarProps {
//   search: string;
//   setSearch: (value: string) => void;
//   category: string;
//   setCategory: (value: string) => void;
//   priority: string;
//   setPriority: (value: string) => void;
// }

// export default function FiltersBar({
//   search,
//   setSearch,
//   category,
//   setCategory,
//   priority,
//   setPriority,
// }: FiltersBarProps) {
//   return (
//     <div className="bg-white p-4 rounded shadow flex gap-4 mb-6">
//       <input
//         placeholder="Search feedback or user name..."
//         className="border p-2 flex-1 rounded"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       <select
//         className="border p-2 rounded"
//         value={category}
//         onChange={(e) => setCategory(e.target.value)}
//       >
//         <option value="">All Categories</option>
//         <option value="bug">Bug</option>
//         <option value="feature">Feature</option>
//         <option value="general">General</option>
//       </select>

//       <select
//         className="border p-2 rounded"
//         value={priority}
//         onChange={(e) => setPriority(e.target.value)}
//       >
//         <option value="">All Priorities</option>
//         <option value="high">High</option>
//         <option value="medium">Medium</option>
//         <option value="low">Low</option>
//       </select>
//     </div>
//   );
// }

// FILE: frontend\src\components\LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-10">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );
}

// FILE: frontend\src\components\Navbar.tsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
const role = localStorage.getItem("role");
const username = localStorage.getItem("username");

const navigate = useNavigate();
const location = useLocation();

const logout = () => {
localStorage.clear();
toast.success("You have been logged out");
navigate("/login");
};

const linkStyle = (path: string) =>
location.pathname === path
? "font-semibold border-b-2 border-white pb-1"
: "opacity-80 hover:opacity-100";

return ( <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">

  {/* Logo */}
  <h1 className="font-bold text-xl">Feedback Intelligence</h1>

  <div className="flex items-center gap-6">

    {/* Dashboard */}
    <Link to="/" className={linkStyle("/")}>
      Dashboard
    </Link>

    {/* Admin Analytics */}
    {role === "admin" && (
      <Link to="/admin" className={linkStyle("/admin")}>
        Analytics
      </Link>
    )}

    {/* User icon + username */}
    <div className="flex items-center gap-2">
      <img
        src="/User_Icon.png"
        alt="User Icon"
        className="h-6 w-6 rounded-full"
      />
      <span className="font-semibold">{username}</span>
    </div>

    {/* Logout */}
    <button
      className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
      onClick={logout}
    >
      Logout
    </button>

  </div>
</nav>

);
}

// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast"; // ✅ Import toast

// export default function Navbar() {
//   const role = localStorage.getItem("role");
//   const username = localStorage.getItem("username");

//   const navigate = useNavigate();

//   const logout = () => {
//     localStorage.clear();
//     toast.success("You have been logged out");
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
//       <h1 className="font-bold text-xl">Feedback Intelligence</h1>

//       <div className="flex items-center gap-6">
//         {role === "admin" && <Link to="/admin">Analytics</Link>}

//         {/* User icon (PNG) + username */}
//         <div className="flex items-center gap-2">
//           <img
//             src="public\User_Icon.png" // ✅ Path to your PNG icon
//             alt="User Icon"
//             className="h-6 w-6 rounded-full" // ✅ Tailwind classes for size & shape
//           />
//           <span className="font-semibold">{username}</span>
//         </div>

//         <button
//           className="bg-white text-indigo-600 px-3 py-1 rounded"
//           onClick={logout}
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast"; // ✅ Import toast

// export default function Navbar() {
//   const role = localStorage.getItem("role");
//   const username = localStorage.getItem("username");

//   const navigate = useNavigate();

//   const logout = () => {
//     localStorage.clear();

//     // ✅ Show logout toast
//     toast.success("You have been logged out");

//     navigate("/login");
//   };

//   return (
//     <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
//       <h1 className="font-bold text-xl">Feedback Intelligence</h1>

//       <div className="flex items-center gap-6">

//         {role === "admin" && <Link to="/admin">Analytics</Link>}

//         <span className="font-semibold">{username}</span>

//         <button
//           className="bg-white text-indigo-600 px-3 py-1 rounded"
//           onClick={logout}
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }

// FILE: frontend\src\components\ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}

// FILE: frontend\src\components\SentimentBadge.tsx
type Sentiment = "positive" | "neutral" | "negative";

interface SentimentBadgeProps {
  sentiment: Sentiment;
}

const styles: Record<Sentiment, string> = {
  positive: "bg-green-100 text-green-700",
  neutral: "bg-yellow-100 text-yellow-700",
  negative: "bg-red-100 text-red-700",
};

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
  return (
    <span
      className={`px-2 py-1 rounded text-xs font-semibold ${styles[sentiment]}`}
    >
      {sentiment}
    </span>
  );
}

// FILE: frontend\src\hooks\useDebounce.ts
//After deploy update


import { useEffect, useState } from "react";

export default function useDebounce<T>(value: T, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// FILE: frontend\src\main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />

    <Toaster/>
  </React.StrictMode>,
);


// FILE: frontend\src\pages\AdminDashboard.tsx
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import FeedbackModal from "../components/FeedbackModal";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import toast from "react-hot-toast"; // ✅ Added
import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
import type { Feedback } from "../types/Feedback";

interface ChartItem {
  _id: string;
  count: number;
}

interface AnalyticsData {
  sentiment: ChartItem[];
  priority: ChartItem[];
}

const COLORS = ["#4F46E5", "#F59E0B", "#EF4444", "#10B981"];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [modal, setModal] = useState(false);
  const [showAll, setShowAll] = useState(false); // toggle for "See More"

  const loadFeedback = async () => {
    try {
      const res = await api.get("/feedback");
      setFeedbacks(res.data);
    } catch {
      toast.error("Failed to fetch feedback"); // ✅ Error toast
    }
  };

  const loadAnalytics = async () => {
    try {
      const res = await api.get("/analytics");
      setAnalytics(res.data);
    } catch {
      toast.error("Failed to fetch analytics"); // ✅ Error toast
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([loadFeedback(), loadAnalytics()]);
    };
    fetchData();
  }, []);

  // ✅ Updated: show spinner instead of plain "Loading..."
  if (!analytics) return <LoadingSpinner />;

  const total = feedbacks.length;
  const urgent = feedbacks.filter((f) => f.priority === "high").length;
  const negative = feedbacks.filter((f) => f.sentiment === "negative").length;

  // Show only 5 feedbacks unless "See More" clicked
  const displayedFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 5);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-6">
        {/* HEADER with only Create Button on the right */}
        <div className="flex justify-end mb-6">
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setModal(true)}
          >
            ✚ Create Feedback
          </button>
        </div>

        {/* ANALYTICS CARDS */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Total Feedback */}
          <div className="p-6 rounded-xl text-white shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600">
            <p className="text-sm opacity-80">Total Feedback</p>
            <h2 className="text-3xl font-bold">{total}</h2>
          </div>

          {/* Urgent */}
          <div className="p-6 rounded-xl text-white shadow-lg bg-gradient-to-r from-orange-400 to-red-500">
            <p className="text-sm opacity-80">Urgent / High</p>
            <h2 className="text-3xl font-bold">{urgent}</h2>
          </div>

          {/* Negative */}
          <div className="p-6 rounded-xl text-white shadow-lg bg-gradient-to-r from-red-500 to-pink-600">
            <p className="text-sm opacity-80">Negative Sentiment</p>
            <h2 className="text-3xl font-bold">{negative}</h2>
          </div>
        </div>

        {/* ANALYTICS CHARTS */}
        <div className="bg-white p-6 shadow rounded mb-8">
          <h2 className="text-lg font-bold mb-6">Analytics</h2>

          <div className="flex justify-center gap-12">
            {/* Sentiment Chart */}
            <div className="w-64 h-64">
              <h3 className="text-center font-semibold mb-3">Sentiment</h3>
              <PieChart width={250} height={250}>
                <Pie
                  data={analytics.sentiment}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={90}
                  label
                >
                  {analytics.sentiment.map((_, i) => (
                    <Cell key={`sentiment-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>

            {/* Priority Chart */}
            <div className="w-64 h-64">
              <h3 className="text-center font-semibold mb-3">Priority</h3>
              <PieChart width={250} height={250}>
                <Pie
                  data={analytics.priority}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={90}
                  label
                >
                  {analytics.priority.map((_, i) => (
                    <Cell key={`priority-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </div>

        {/* FEEDBACK TABLE */}
        <FeedbackTable data={displayedFeedbacks} reload={loadFeedback} />

        {/* SEE MORE BUTTON */}
        {!showAll && feedbacks.length > 5 && (
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setShowAll(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              See More
            </button>
          </div>
        )}

        {/* ✅ Render FeedbackModal when modal=true */}
        {modal && (
          <FeedbackModal
            onClose={() => setModal(false)}
            onCreated={loadFeedback}
          />
        )}
      </div>
    </div>
  );
}



//remove entry with _ 

// import { useEffect, useState } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import FeedbackTable from "../components/FeedbackTable";
// import { PieChart, Pie, Cell, Tooltip } from "recharts";
// import type { Feedback } from "../types/Feedback";

// interface ChartItem {
//   _id: string;
//   count: number;
// }

// interface AnalyticsData {
//   sentiment: ChartItem[];
//   priority: ChartItem[];
// }

// const COLORS = ["#4F46E5", "#F59E0B", "#EF4444", "#10B981"];

// export default function AdminDashboard() {
//   const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
//   const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
//   const [showAll, setShowAll] = useState(false); // NEW: toggle for "See More"

//   const loadFeedback = async () => {
//     const res = await api.get("/feedback");
//     setFeedbacks(res.data);
//   };

//   const loadAnalytics = async () => {
//     const res = await api.get("/analytics");
//     setAnalytics(res.data);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       await Promise.all([loadFeedback(), loadAnalytics()]);
//     };
//     fetchData();
//   }, []);

//   if (!analytics) return <div>Loading...</div>;

//   const total = feedbacks.length;
//   const urgent = feedbacks.filter((f) => f.priority === "high").length;
//   const negative = feedbacks.filter((f) => f.sentiment === "negative").length;

//   // Show only 5 feedbacks unless "See More" clicked
//   const displayedFeedbacks = showAll ? feedbacks : feedbacks.slice(0, 5);

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <Navbar />

//       <div className="p-6">
//         {/* ANALYTICS CARDS */}
//         <div className="grid grid-cols-3 gap-6 mb-8">
//           <div className="bg-white p-6 shadow rounded">
//             <p className="text-gray-500">Total Feedback</p>
//             <h2 className="text-3xl font-bold">{total}</h2>
//           </div>

//           <div className="bg-white p-6 shadow rounded">
//             <p className="text-gray-500">Urgent / High</p>
//             <h2 className="text-3xl font-bold text-orange-500">{urgent}</h2>
//           </div>

//           <div className="bg-white p-6 shadow rounded">
//             <p className="text-gray-500">Negative Sentiment</p>
//             <h2 className="text-3xl font-bold text-red-500">{negative}</h2>
//           </div>
//         </div>

//         {/* ANALYTICS CHARTS */}
//         <div className="bg-white p-6 shadow rounded mb-8">
//           <h2 className="text-lg font-bold mb-6">Analytics</h2>

//           <div className="flex justify-center gap-12"> {/* Centered charts */}
//             {/* Sentiment Chart */}
//             <div className="w-64 h-64"> {/* Smaller size */}
//               <h3 className="text-center font-semibold mb-3">Sentiment</h3>
//               <PieChart width={250} height={250}>
//                 <Pie
//                   data={analytics.sentiment}
//                   dataKey="count"
//                   nameKey="_id"
//                   outerRadius={90}
//                   label
//                 >
//                   {analytics.sentiment.map((entry, i) => (
//                     <Cell key={`sentiment-${i}`} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </div>

//             {/* Priority Chart */}
//             <div className="w-64 h-64">
//               <h3 className="text-center font-semibold mb-3">Priority</h3>
//               <PieChart width={250} height={250}>
//                 <Pie
//                   data={analytics.priority}
//                   dataKey="count"
//                   nameKey="_id"
//                   outerRadius={90}
//                   label
//                 >
//                   {analytics.priority.map((entry, i) => (
//                     <Cell key={`priority-${i}`} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </div>
//           </div>
//         </div>

//         {/* FEEDBACK TABLE */}
//         <FeedbackTable data={displayedFeedbacks} reload={loadFeedback} />

//         {/* SEE MORE BUTTON */}
//         {!showAll && feedbacks.length > 3 && (
//           <div className="flex justify-center mt-4">
//             <button
//               onClick={() => setShowAll(true)}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               See More
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// import { useEffect, useState } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import FeedbackTable from "../components/FeedbackTable";
// import { PieChart, Pie, Cell, Tooltip } from "recharts";
// import type { Feedback } from "../types/Feedback";

// interface ChartItem {
//   _id: string;
//   count: number;
// }

// interface AnalyticsData {
//   sentiment: ChartItem[];
//   priority: ChartItem[];
// }

// const COLORS = ["#4F46E5", "#F59E0B", "#EF4444", "#10B981"];

// export default function AdminDashboard() {
//   const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
//   const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

//   const loadFeedback = async () => {
//     const res = await api.get("/feedback");
//     setFeedbacks(res.data);
//   };

//   const loadAnalytics = async () => {
//     const res = await api.get("/analytics");
//     setAnalytics(res.data);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       await Promise.all([loadFeedback(), loadAnalytics()]);
//     };
//     fetchData();
//   }, []);

//   if (!analytics) return <div>Loading...</div>;

//   const total = feedbacks.length;
//   const urgent = feedbacks.filter((f) => f.priority === "high").length;
//   const negative = feedbacks.filter((f) => f.sentiment === "negative").length;

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <Navbar />

//       <div className="p-6">
//         {/* ANALYTICS CARDS */}
//         <div className="grid grid-cols-3 gap-6 mb-8">
//           <div className="bg-white p-6 shadow rounded">
//             <p className="text-gray-500">Total Feedback</p>
//             <h2 className="text-3xl font-bold">{total}</h2>
//           </div>

//           <div className="bg-white p-6 shadow rounded">
//             <p className="text-gray-500">Urgent / High</p>
//             <h2 className="text-3xl font-bold text-orange-500">{urgent}</h2>
//           </div>

//           <div className="bg-white p-6 shadow rounded">
//             <p className="text-gray-500">Negative Sentiment</p>
//             <h2 className="text-3xl font-bold text-red-500">{negative}</h2>
//           </div>
//         </div>

//         {/* ANALYTICS CHARTS */}
//         <div className="bg-white p-6 shadow rounded mb-8">
//           <h2 className="text-lg font-bold mb-6">Analytics</h2>

//           <div className="flex gap-12">
//             {/* Sentiment Chart */}
//             <div>
//               <h3 className="text-center font-semibold mb-3">Sentiment</h3>
//               <PieChart width={300} height={300}>
//                 <Pie
//                   data={analytics.sentiment}
//                   dataKey="count"
//                   nameKey="_id"
//                   outerRadius={110}
//                   label
//                 >
//                   {analytics.sentiment.map((entry, i) => (
//                     <Cell key={`sentiment-${i}`} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </div>

//             {/* Priority Chart */}
//             <div>
//               <h3 className="text-center font-semibold mb-3">Priority</h3>
//               <PieChart width={300} height={300}>
//                 <Pie
//                   data={analytics.priority}
//                   dataKey="count"
//                   nameKey="_id"
//                   outerRadius={110}
//                   label
//                 >
//                   {analytics.priority.map((entry, i) => (
//                     <Cell key={`priority-${i}`} fill={COLORS[i % COLORS.length]} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </div>
//           </div>
//         </div>

//         {/* FEEDBACK TABLE */}
//         <FeedbackTable data={feedbacks} reload={loadFeedback} />
//       </div>
//     </div>
//   );
// }


// FILE: frontend\src\pages\Dashboard.tsx
import { useState, useEffect } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import FiltersBar from "../components/FiltersBar";
import FeedbackModal from "../components/FeedbackModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import useDebounce from "../hooks/useDebounce";
import type { Feedback } from "../types/Feedback";

export default function Dashboard() {

  const [data, setData] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [modal, setModal] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch feedback
  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get("/feedback", {
        params: {
          search: debouncedSearch,
          category,
          priority,
        },
      });

      setData(res.data);

    } catch {
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load();
  }, []);

  // Reload when filters change
  useEffect(() => {

    if (search !== debouncedSearch) {
      setSearchLoading(true);
    }
    load();


  }, [debouncedSearch, category, priority]);

  return (
    <div>

      <Navbar />

      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold">
            Feedback Dashboard
          </h2>

          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setModal(true)}
          >
            ✚ Create Feedback
          </button>

        </div>

        {/* Filters */}
        <FiltersBar
          search={search}
          setSearch={(value: string) => {
            setSearch(value);
            setSearchLoading(true);
          }}
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
        />

        {searchLoading && (
          <p className="text-sm text-gray-500 mb-3">
            Searching feedback...
          </p>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <FeedbackTable
            data={data}
            reload={load}
            searchTerm={debouncedSearch}
          />
        )}

      </div>

      {modal && (
        <FeedbackModal
          onClose={() => setModal(false)}
          onCreated={(newFeedback) => {

            // ⭐ instant UI update
            setData(prev => [newFeedback, ...prev]);

            setModal(false);

            toast.success("Feedback created!");

          }}
        />
      )}

    </div>
  );
}


//Before deploy update 

// import { useState, useEffect } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import FeedbackTable from "../components/FeedbackTable";
// import FiltersBar from "../components/FiltersBar";
// import FeedbackModal from "../components/FeedbackModal"; // ✅ Added
// import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
// import toast from "react-hot-toast"; // ✅ Added

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [priority, setPriority] = useState("");
//   const [loading, setLoading] = useState(false); // ✅ Added
//   const [modal, setModal] = useState(false); // ✅ Added

//   // Load function with spinner + toast
//   const load = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/feedback", {
//         params: { search, category, priority },
//       });

//       setData(res.data);
//     } catch {
//       toast.error("Failed to fetch feedback"); // ✅ Error toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data whenever filters change
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get("/feedback", {
//           params: { search, category, priority },
//         });
//         setData(res.data);
//       } catch {
//         toast.error("Failed to fetch feedback");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [search, category, priority]);

//   return (
//     <div>
//       <Navbar />

//       <div className="p-6">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Feedback Dashboard</h2>

//           <button
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//             onClick={() => setModal(true)}
//           >
//            ✚ Create Feedback
//           </button>
//         </div>

//         {/* Filters */}
//         <FiltersBar
//           search={search}
//           setSearch={setSearch}
//           category={category}
//           setCategory={setCategory}
//           priority={priority}
//           setPriority={setPriority}
//         />

//         {/* ✅ Show spinner while loading, otherwise show table */}
//         {loading ? (
//           <LoadingSpinner />
//         ) : (
//           <FeedbackTable data={data} reload={load} />
//         )}
//       </div>

//       {/* Feedback Modal */}
//       {modal && (
//         <FeedbackModal
//           onClose={() => setModal(false)}
//           onCreated={load}
//         />
//       )}
//     </div>
//   );
// }
// import { useState, useEffect } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import FeedbackTable from "../components/FeedbackTable";
// import FiltersBar from "../components/FiltersBar";
// import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
// import toast from "react-hot-toast"; // ✅ Added

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [priority, setPriority] = useState("");
//   const [loading, setLoading] = useState(false); // ✅ Added

//   // Load function with spinner + toast
//   const load = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/feedback", {
//         params: { search, category, priority },
//       });

//       setData(res.data);
//     } catch {
//       toast.error("Failed to fetch feedback"); // ✅ Error toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data whenever filters change
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await api.get("/feedback", {
  //         params: { search, category, priority },
  //       });
  //       setData(res.data);
  //     } catch {
  //       toast.error("Failed to fetch feedback");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [search, category, priority]);

//   return (
//     <div>
//       <Navbar />

//       <div className="p-6">
//         <FiltersBar
//           search={search}
//           setSearch={setSearch}
//           category={category}
//           setCategory={setCategory}
//           priority={priority}
//           setPriority={setPriority}
//         />

//         {/* ✅ Show spinner while loading, otherwise show table */}
//         {loading ? (
//           <LoadingSpinner />
//         ) : (
//           <FeedbackTable data={data} reload={load} />
//         )}
//       </div>
//     </div>
//   );
// }

// FILE: frontend\src\pages\Login.tsx
import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Add spinner

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ track loading state

  const navigate = useNavigate();

  const submit = async () => {
    try {
      setLoading(true); // show spinner
      const res = await api.post("/auth/login", { email, password });

      toast.success("Login successful!");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.name);

      // ✅ Redirect to home
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false); // hide spinner
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <LoadingSpinner /> // ✅ show spinner while logging in
      ) : (
        <div className="bg-white p-6 shadow rounded w-80">
          <h2 className="text-xl font-bold mb-4">Login</h2>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="bg-indigo-600 text-white w-full py-2"
            onClick={submit}
          >
            Login
          </button>

          <p className="mt-3 text-sm">
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      )}
    </div>
  );
}

//Before deploy update

// import { useState } from "react";
// import api from "../api/api";
// import { useNavigate, Link } from "react-router-dom";
// import toast from "react-hot-toast"; // ✅ Import toast

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const navigate = useNavigate();

//   const submit = async () => {
//   try {
//     const res = await api.post("/auth/login", { email, password });

//     toast.success("Login successful!");

//     localStorage.setItem("token", res.data.token);
//     localStorage.setItem("role", res.data.role);
//     localStorage.setItem("username", res.data.name);

//     navigate("/");
//   } catch (error) {
//     console.error(error); // ✅ now it's used
//     toast.error("Invalid email or password");
//   }
// };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="bg-white p-6 shadow rounded w-80">
//         <h2 className="text-xl font-bold mb-4">Login</h2>

//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Email"
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className="border p-2 w-full mb-2"
//           type="password"
//           placeholder="Password"
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           className="bg-indigo-600 text-white w-full py-2"
//           onClick={submit}
//         >
//           Login
//         </button>

//         <p className="mt-3 text-sm">
//           No account? <Link to="/register">Register</Link>
//         </p>
//       </div>
//     </div>
//   );
// }

// FILE: frontend\src\pages\Register.tsx
import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await api.post("/auth/register", form);

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/"); // Protected dashboard
      } else {
        // If backend doesn't return token, force user to login
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Register</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="bg-indigo-600 text-white w-full py-2"
          onClick={submit}
        >
          Register
        </button>
      </div>
    </div>
  );
}

//Before deploy update

// import { useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const submit = async () => {
//     await api.post("/auth/register", form);
//     localStorage.setItem("token", res.data.token);
//     navigate("/");
//   };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="bg-white p-6 shadow rounded w-80">
//         <h2 className="text-xl font-bold mb-4">Register</h2>

//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Name"
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />

//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Email"
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />

//         <input
//           className="border p-2 w-full mb-2"
//           type="password"
//           placeholder="Password"
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />

//         <button
//           className="bg-indigo-600 text-white w-full py-2"
//           onClick={submit}
//         >
//           Register
//         </button>
//       </div>
//     </div>
//   );
// }


// FILE: frontend\src\types\Feedback.ts
export interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  category: string;
  priority: string;
  sentiment: string; // allow any string
  createdAt: string;
}
