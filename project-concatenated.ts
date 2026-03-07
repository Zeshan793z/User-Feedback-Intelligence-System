// FILE: backend\src\config\db.ts
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// FILE: backend\src\controllers\analyticsController.ts
import Feedback from "../models/Feedback";

export const getAnalytics = async (_req:any,res:any)=>{

const total = await Feedback.countDocuments();

const sentiment = await Feedback.aggregate([
{$group:{_id:"$sentiment",count:{$sum:1}}}
]);

const priority = await Feedback.aggregate([
{$group:{_id:"$priority",count:{$sum:1}}}
]);

res.json({
total,
sentiment,
priority
});

};

// FILE: backend\src\controllers\authController.ts
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateToken = (id:string,role:string)=>{
return jwt.sign({id,role},process.env.JWT_SECRET as string,{
expiresIn:"7d"
});
};

export const register = async (req:any,res:any)=>{

const {name,email,password}=req.body;

const exists = await User.findOne({email});

if(exists){
return res.status(400).json({message:"User exists"});
}

const hashed = await bcrypt.hash(password,10);

const user = await User.create({
name,
email,
password:hashed
});

res.json({
token:generateToken(user._id.toString(),user.role)
});

};

export const login = async (req:any,res:any)=>{

const {email,password}=req.body;

const user = await User.findOne({email});

if(!user){
return res.status(400).json({message:"Invalid credentials"});
}

const valid = await bcrypt.compare(password,user.password);

if(!valid){
return res.status(400).json({message:"Invalid credentials"});
}

res.json({
token:generateToken(user._id.toString(),user.role)
});

};

// FILE: backend\src\controllers\feedbackController.ts
import Feedback from "../models/Feedback";
import { analyzeFeedback } from "../services/llmService";

export const createFeedback = async (req:any,res:any)=>{

try{

const {name,message}=req.body;

const ai = await analyzeFeedback(message);

const feedback = await Feedback.create({
  name,
  message,
  category: ai.category,
  priority: ai.priority,
  sentiment: ai.sentiment
});

res.status(201).json(feedback);

}catch(err){

console.error(err);

res.status(500).json({
message:"Feedback creation failed"
});

}

};

export const getFeedbacks = async (req:any,res:any)=>{

const data = await Feedback
.find()
.sort({createdAt:-1});

res.json(data);

};

// FILE: backend\src\middleware\authMiddleware.ts
import jwt from "jsonwebtoken";

export const protect = (req:any,res:any,next:any)=>{
  const token = req.headers.authorization?.split(" ")[1];

  if(!token){
    return res.status(401).json({message:"Unauthorized"});
  }

  try{
    const decoded = jwt.verify(token,process.env.JWT_SECRET as string);
    req.user = decoded;
    next();
  }catch{
    res.status(401).json({message:"Invalid token"});
  }
};

// FILE: backend\src\models\Feedback.ts
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
{
  name: String,
  message: String,

  category: String,

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "low"
  },

  sentiment: {
    type: String,
    enum: ["positive", "neutral", "negative"],
    default: "neutral"
  }
},
{ timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);

// FILE: backend\src\models\User.ts
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
{
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
},
{ timestamps: true }
);

export default mongoose.model("User", userSchema);

// FILE: backend\src\routes\analyticsRoutes.ts
import express from "express";
import { getAnalytics } from "../controllers/analyticsController";

const router = express.Router();

router.get("/",getAnalytics);

export default router;

// FILE: backend\src\routes\authRoutes.ts
import express from "express";
import {
register,
login
} from "../controllers/authController";

const router = express.Router();

router.post("/register",register);
router.post("/login",login);

export default router;

// FILE: backend\src\routes\feedbackRoutes.ts
import express from "express";
import {
createFeedback,
getFeedbacks
} from "../controllers/feedbackController";

const router = express.Router();

router.post("/",createFeedback);
router.get("/",getFeedbacks);

export default router;

// FILE: backend\src\routes\teamRoutes.ts
import express from "express";
import { setTeamEmail } from "../controllers/teamController";
import { protect } from "../middleware/authMiddleware";
import { adminOnly } from "../middleware/roleMiddleware";

const router = express.Router();

router.post("/", protect, adminOnly, setTeamEmail);

export default router;

// FILE: backend\src\server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/db";

import authRoutes from "./routes/authRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/auth",authRoutes);
app.use("/api/feedbacks",feedbackRoutes);
app.use("/api/analytics",analyticsRoutes);

const PORT = 5000;

app.listen(PORT,()=>{
console.log(`Server running on ${PORT}`);
});

// FILE: backend\src\services\emailService.ts
import nodemailer from "nodemailer";

export const sendEmail = async (
to:string,
subject:string,
text:string
)=>{
const transporter = nodemailer.createTransport({
service:"gmail",
auth:{
  user:process.env.EMAIL_USER,
  pass:process.env.EMAIL_PASS
}
});

await transporter.sendMail({
from:process.env.EMAIL_USER,
to,
subject,
text
});
};

// FILE: backend\src\services\llmService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeFeedback = async (message:string)=>{

const model = genAI.getGenerativeModel({
  model:"gemini-1.5-flash"
});

const prompt = `
Analyze this customer feedback and return JSON only.

{
 "category": "billing | support | product | general",
 "priority": "low | medium | high",
 "sentiment": "positive | neutral | negative"
}

Feedback:
${message}
`;

const result = await model.generateContent(prompt);
const text = result.response.text();

return JSON.parse(text);
};

// FILE: backend\src\utils\sendEmail.ts
import nodemailer from "nodemailer";

export const sendEmail = async (
  to: string,
  subject: string,
  text: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Feedback Intelligence" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

// FILE: frontend\src\App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Landing */}
        <Route path="/" element={<Landing />} />

        {/* Public Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Admin-only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

// FILE: frontend\src\components\Card.tsx
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export default function Card({ children }: CardProps) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition">
      {children}
    </div>
  );
}

// FILE: frontend\src\components\CreateFeedbackModal.tsx
import { useState } from "react";
import axios from "axios";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFeedbackModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    category: "",
    priority: "",
    sentiment: "",
    team: "",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/feedbacks",
      form,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          Create Feedback
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">

          <input
            type="text"
            placeholder="Name"
            required
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <textarea
            placeholder="Feedback message"
            required
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />

          <input
            type="text"
            placeholder="Category"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />

          <input
            type="text"
            placeholder="Priority"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          />

          <input
            type="text"
            placeholder="Sentiment"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, sentiment: e.target.value })}
          />

          <input
            type="text"
            placeholder="Team"
            className="w-full border px-3 py-2 rounded"
            onChange={(e) => setForm({ ...form, team: e.target.value })}
          />

          <div className="flex justify-end space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded"
            >
              Submit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

// FILE: frontend\src\components\FeedbackForm.tsx
import { useState } from "react";
import API from "../utils/api";

const FeedbackForm = ({reload}:{reload:()=>void}) => {

const [name,setName] = useState("");
const [message,setMessage] = useState("");

const submit = async (e:unknown) => {

e.preventDefault();

await API.post("/feedbacks",{
  name,
  message
});

setName("");
setMessage("");

reload();

};

return(

<form
onSubmit={submit}
className="bg-white p-4 rounded shadow"
>

<h2 className="font-semibold mb-3">
Submit Feedback
</h2>

<input
placeholder="Name"
className="border p-2 w-full mb-2"
value={name}
onChange={(e)=>setName(e.target.value)}
/>

<textarea
placeholder="Feedback message"
className="border p-2 w-full mb-2"
value={message}
onChange={(e)=>setMessage(e.target.value)}
/>

<button
className="bg-blue-500 text-white px-4 py-2 rounded"
>
Submit
</button>

</form>

);

};

export default FeedbackForm;

// FILE: frontend\src\components\FeedbackTable.tsx
interface Props {
  feedbacks: unknown[];
}

export default function FeedbackTable({ feedbacks }: Props) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Category</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {feedbacks.map((f) => (
            <tr key={f._id} className="border-t">
              <td className="p-3">{f.name}</td>
              <td className="p-3">{f.category}</td>
              <td className="p-3">{f.priority}</td>
              <td className="p-3">{f.sentiment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// FILE: frontend\src\components\Navbar.tsx
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Determine correct home path
     const homePath = role === "admin" ? "/dashboard" : "/dashboard";

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1
        onClick={() => navigate(homePath)}
        className="text-xl font-semibold cursor-pointer"
      >
        Feedback Intelligence
      </h1>

      {token && (
        <div className="space-x-6 flex items-center">

          <Link to={homePath} className="hover:underline">
            Home
          </Link>

          {role === "admin" && (
            <Link to="/admin" className="hover:underline">
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={logout}
            className="bg-white text-indigo-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
          >
            Logout
          </button>

        </div>
      )}
    </nav>
  );
}

// FILE: frontend\src\components\Pagination.tsx
interface Props {
  page: number;
  totalPages: number;
  setPage: any;
}

export default function Pagination({ page, totalPages, setPage }: Props) {
  return (
    <div className="flex justify-center mt-6 space-x-4">
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>

      <span className="px-4 py-2">
        Page {page} of {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => setPage(page + 1)}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}

// FILE: frontend\src\components\ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "user";
}

export default function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 🔐 Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🛡 Role-based protection (if specified)
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white shadow-md rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You do not have permission to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// FILE: frontend\src\components\SearchFilters.tsx
interface Props {
  filters: any;
  setFilters: any;
}

export default function SearchFilters({ filters, setFilters }: Props) {
  return (
    <div className="bg-white p-4 rounded-xl shadow flex flex-wrap gap-4">
      <input
        type="text"
        placeholder="Search by name"
        className="border px-3 py-2 rounded"
        value={filters.name}
        onChange={(e) =>
          setFilters({ ...filters, name: e.target.value })
        }
      />

      <select
        className="border px-3 py-2 rounded"
        value={filters.category}
        onChange={(e) =>
          setFilters({ ...filters, category: e.target.value })
        }
      >
        <option value="">All Categories</option>
        <option value="Billing">Billing</option>
        <option value="Technical">Technical</option>
      </select>

      <select
        className="border px-3 py-2 rounded"
        value={filters.priority}
        onChange={(e) =>
          setFilters({ ...filters, priority: e.target.value })
        }
      >
        <option value="">All Priority</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </div>
  );
}

// FILE: frontend\src\main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <>
      <App />
      <Toaster position="top-right" />
    </>
  </React.StrictMode>
);

// FILE: frontend\src\pages\AdminDashboard.tsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { api } from "../services/api";
import {
  PieChart,
  Pie,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface AnalyticsData {
  sentiment: Array<{ _id: string; count: number }>;
  priority: Array<{ _id: string; count: number }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get("/analytics").then(res => setData(res.data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6">Analytics Dashboard</h2>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="mb-4 font-semibold">Sentiment</h3>
            <PieChart width={300} height={250}>
              <Pie data={data.sentiment} dataKey="count" nameKey="_id" />
              <Tooltip />
            </PieChart>
          </div>

          <div className="bg-white p-4 rounded-xl shadow">
            <h3 className="mb-4 font-semibold">Priority</h3>
            <BarChart width={350} height={250} data={data.priority}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
}

// FILE: frontend\src\pages\Dashboard.tsx
import { useEffect, useState } from "react";
import API from "../utils/api";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import SearchFilters from "../components/SearchFilters";
import FeedbackTable from "../components/FeedbackTable";
import Pagination from "../components/Pagination";
import CreateFeedbackModal from "../components/CreateFeedbackModal";

export default function Dashboard() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    category: "",
    priority: "",
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const res = await API.get("/feedbacks", {
        params: {
          ...filters,
          page,
          limit: 5,
        },
      });

      setFeedbacks(res.data.feedbacks);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error("Failed to load feedbacks");
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [filters, page]);

  return (
    <>
      <Navbar />

      <div className="p-6 space-y-6 bg-gray-100 min-h-screen">

        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            Dashboard
          </h1>

          <button
            onClick={() => setOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded"
          >
            + Create Feedback
          </button>
        </div>

        <SearchFilters filters={filters} setFilters={setFilters} />

        <FeedbackTable feedbacks={feedbacks} />

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
        />

        <CreateFeedbackModal
          isOpen={open}
          onClose={() => setOpen(false)}
          onSuccess={() => {
            fetchFeedbacks();
            toast.success("Feedback created successfully");
          }}
        />
      </div>
    </>
  );
}

// FILE: frontend\src\pages\Home.tsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import FeedbackModal from "../components/FeedbackModal";
import Card from "../components/Card";
import { api } from "../services/api";

interface Feedback {
  _id: string;
  name: string;
  email: string;
  message: string;
  category: string;
  priority: string;
}

export default function Home() {
  const role = localStorage.getItem("role");
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (role === "admin") {
      api.get("/feedbacks").then(res => setFeedbacks(res.data));
    }
  }, [role]);

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold">Feedback Overview</h2>
          <button
            onClick={() => setShow(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            + New Feedback
          </button>
        </div>

        {show && <FeedbackModal onClose={() => setShow(false)} />}

        {role === "admin" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedbacks.map((f: Feedback) => (
              <Card key={f._id}>
                <h3 className="font-semibold">{f.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{f.email}</p>
                <p className="mb-3">{f.message}</p>

                <div className="text-sm flex justify-between">
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {f.category}
                  </span>
                  <span className="bg-red-100 px-2 py-1 rounded">
                    {f.priority}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// FILE: frontend\src\pages\Landing.tsx
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white px-6">
      
      <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
        Feedback Intelligence Platform
      </h1>

      <p className="text-lg text-center max-w-xl mb-8 opacity-90">
        Collect, analyze, and manage customer feedback with AI-powered insights.
      </p>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
        >
          Login
        </Link>

        <Link
          to="/register"
          className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

// FILE: frontend\src\pages\Login.tsx
import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    const res = await api.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);
    const payload = JSON.parse(atob(res.data.token.split(".")[1]));
    localStorage.setItem("role", payload.role);

    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-semibold mb-6 text-center">Login</h2>

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-6"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}

// FILE: frontend\src\pages\Register.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      navigate("/dashboard");
    } catch (err: unknown) {
      const errorMessage = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message
        : "Registration failed";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Create Account
        </h2>
        <p className="text-gray-500 mb-6">
          Join the Feedback Intelligence Platform
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            required
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-6 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

// FILE: frontend\src\services\api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Attach token automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// FILE: frontend\src\utils\api.ts
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((req) => {

  const token = localStorage.getItem("token");

  if(token){
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;