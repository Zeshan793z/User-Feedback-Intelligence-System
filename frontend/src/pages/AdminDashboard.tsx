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