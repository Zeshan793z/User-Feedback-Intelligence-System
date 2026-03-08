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

export const register = async(req:any,res:any)=>{

const {name,email,password} = req.body;

const hash = await bcrypt.hash(password,10);

const user = await User.create({
name,
email,
password:hash
});

res.json(user);

};

export const login = async(req:any,res:any)=>{

const {email,password} = req.body;

const user = await User.findOne({email});

if(!user){
return res.status(400).json({message:"User not found"});
}

const match = await bcrypt.compare(password,user.password);

if(!match){
return res.status(400).json({message:"Invalid password"});
}

const token = jwt.sign(
{id:user._id,role:user.role},
process.env.JWT_SECRET as string
);

res.json({token,role:user.role});

};

// FILE: backend\src\controllers\feedbackController.ts
import Feedback from "../models/Feedback";
import { analyzeFeedback } from "../services/llmService";
import { sendFeedbackEmail } from "../services/emailService";

export const createFeedback = async(req:any,res:any)=>{

try{

const {name,email,message} = req.body;

const ai = await analyzeFeedback(message);

const feedback = await Feedback.create({

name,
email,
message,
category:ai.category,
priority:ai.priority,
sentiment:ai.sentiment

});

await sendFeedbackEmail(feedback);

res.status(201).json(feedback);

}catch(error){

res.status(500).json({message:"Failed to create feedback"});

}

};

export const getFeedbacks = async(req:any,res:any)=>{

const {page=1,limit=10,search="",category,priority} = req.query;

const query:any = {};

if(search){
query.name = {$regex:search,$options:"i"};
}

if(category){
query.category = category;
}

if(priority){
query.priority = priority;
}

const data = await Feedback.find(query)
.sort({createdAt:-1})
.skip((page-1)*limit)
.limit(Number(limit));

res.json(data);

};

export const deleteFeedback = async(req:any,res:any)=>{

try{

await Feedback.findByIdAndDelete(req.params.id);

res.json({message:"Deleted"});

}catch{

res.status(500).json({message:"Delete failed"});

}

};

// FILE: backend\src\controllers\teamController.ts
import Team from "../models/Team";
import { sendEmail } from "../services/emailService";

export const setTeamEmail = async (req: any, res: any) => {
  try {
    const { category, email } = req.body;
    
    let team = await Team.findOne({ category });
    
    if (team) {
      team.email = email;
      await team.save();
    } else {
      team = await Team.create({ category, email });
    }
    
    res.json({ message: "Team email updated", team });
  } catch (error) {
    res.status(500).json({ message: "Failed to set team email" });
  }
};

export const getTeamEmails = async (req: any, res: any) => {
  try {
    const teams = await Team.find();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch teams" });
  }
};

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

// FILE: backend\src\models\Team.ts
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

export const sendFeedbackEmail = async (feedback:any)=>{

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}

});

await transporter.sendMail({

from:process.env.EMAIL_USER,

to:process.env.TEAM_EMAIL,

subject:"New Feedback Received",

text:`
Name: ${feedback.name}

Message:
${feedback.message}

Category: ${feedback.category}
Priority: ${feedback.priority}
Sentiment: ${feedback.sentiment}
`

});

};

// FILE: backend\src\services\llmService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackAnalyzer } from "../utils/fallbackAnalyzer";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeFeedback = async (message:string)=>{

try{

const model = genAI.getGenerativeModel({model:"gemini-pro"});

const prompt = `
Analyze the following feedback.

Return JSON ONLY:

{
"category":"",
"priority":"",
"sentiment":""
}

Feedback:
${message}
`;

const result = await model.generateContent(prompt);

const text = result.response.text();

return JSON.parse(text);

}catch(error){

console.log("LLM failed. Using fallback");

return fallbackAnalyzer(message);

}

};

// FILE: backend\src\utils\fallbackAnalyzer.ts
export const fallbackAnalyzer = (message:string)=>{

const msg = message.toLowerCase();

let sentiment="neutral";
let priority="medium";
let category="general";

if(msg.includes("bug") || msg.includes("error")){
category="bug";
priority="high";
sentiment="negative";
}

if(msg.includes("feature")){
category="feature";
priority="low";
}

if(msg.includes("great") || msg.includes("good")){
sentiment="positive";
}

return{
category,
priority,
sentiment
};

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

// FILE: frontend\src\api\api.ts
import axios from "axios";

const api = axios.create({
baseURL:"http://localhost:5000/api"
});

api.interceptors.request.use((config)=>{

const token = localStorage.getItem("token");

if(token){
config.headers.Authorization=`Bearer ${token}`;
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

interface FeedbackModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function FeedbackModal({ onClose, onCreated }: FeedbackModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const submit = async () => {
    try {
      await api.post("/feedback", form);
      toast.success("Feedback created");
      onCreated();
      onClose();
    } catch {
      toast.error("Error creating feedback");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-96">
        <h2 className="text-lg font-bold mb-4">Create Feedback</h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>
          <button
            className="bg-indigo-600 text-white px-3 py-1"
            onClick={submit}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// FILE: frontend\src\components\FeedbackTable.tsx
import type { Feedback } from "../types/Feedback";

export default function FeedbackTable({ data }: { data: Feedback[] }) {
  return (
    <table className="w-full bg-white shadow rounded">
      <thead className="bg-gray-200">
        <tr>
          <th>Name</th>
          <th>Category</th>
          <th>Priority</th>
          <th>Sentiment</th>
        </tr>
      </thead>

      <tbody>
        {data.map((f) => (
          <tr key={f._id} className="border-t">
            <td>{f.name}</td>
            <td>{f.category}</td>
            <td>{f.priority}</td>
            <td>{f.sentiment}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}


// FILE: frontend\src\components\FiltersBar.tsx
interface FiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
}

export default function FiltersBar({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
}: FiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded shadow flex gap-4 mb-6">
      <input
        placeholder="Search feedback or user name..."
        className="border p-2 flex-1 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature</option>
        <option value="general">General</option>
      </select>

      <select
        className="border p-2 rounded"
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

// FILE: frontend\src\components\Navbar.tsx
import { Link,useNavigate } from "react-router-dom";

export default function Navbar(){

const role = localStorage.getItem("role");

const navigate = useNavigate();

const logout = ()=>{

localStorage.clear();

navigate("/login");

};

return(

<nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between">

<h1 className="font-bold text-xl">
Feedback Intelligence
</h1>

<div className="space-x-6">

<Link to="/">Dashboard</Link>

{role==="admin" && (
<Link to="/admin">Admin</Link>
)}

<button onClick={logout}>
Logout
</button>

</div>

</nav>

);

}

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

// FILE: frontend\src\main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

import { Toaster } from "react-hot-toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />

    <Toaster />
  </React.StrictMode>,
);


// FILE: frontend\src\pages\AdminDashboard.tsx
import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

import { PieChart, Pie, Cell, Tooltip } from "recharts";

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
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await api.get("/analytics");
      setData(res.data);
    };
    fetchData();
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />

      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Admin Analytics</h2>

        <div className="flex gap-10">
          {/* Sentiment Chart */}
          <PieChart width={300} height={300}>
            <Pie
              data={data.sentiment}
              dataKey="count"
              nameKey="_id"
              outerRadius={120}
              label
            >
              {data.sentiment.map((entry, i) => (
                <Cell key={`sentiment-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>

          {/* Priority Chart */}
          <PieChart width={300} height={300}>
            <Pie
              data={data.priority}
              dataKey="count"
              nameKey="_id"
              outerRadius={120}
              label
            >
              {data.priority.map((entry, i) => (
                <Cell key={`priority-${i}`} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}

// FILE: frontend\src\pages\Dashboard.tsx
import { useEffect,useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackModal from "../components/FeedbackModal";
import FeedbackTable from "../components/FeedbackTable";

export default function Dashboard(){

const [data,setData]=useState([]);
const [modal,setModal]=useState(false);

const [search,setSearch]=useState("");

const load = async ()=>{

const res = await api.get("/feedback",{params:{search}});

setData(res.data);

};

useEffect(()=>{
(async ()=>{
await load();
})();
},[search]);

return(

<div>

<Navbar/>

<div className="p-6">

<div className="flex justify-between mb-4">

<input
className="border p-2"
placeholder="Search name"
onChange={e=>setSearch(e.target.value)}
/>

<button
className="bg-indigo-600 text-white px-4 py-2"
onClick={()=>setModal(true)}
>
Create Feedback
</button>

</div>

<button
className="mb-4 text-blue-600"
onClick={load}
>
Search
</button>

<FeedbackTable data={data}/>

</div>

{modal && (
<FeedbackModal
onClose={()=>setModal(false)}
onCreated={load}
/>
)}

</div>

);

}

// FILE: frontend\src\pages\Login.tsx
import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const submit = async () => {
    const res = await api.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("role", res.data.role);
    localStorage.setItem("username",res.data.name);

    navigate("/");
  };

  return (
    <div className="flex items-center justify-center h-screen">
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
    </div>
  );
}


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
    await api.post("/auth/register", form);

    navigate("/login");
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

// FILE: frontend\src\types\Feedback.ts
export interface Feedback {

_id:string
name:string
email:string
message:string

category:string
priority:string
sentiment:string

createdAt:string

}