import { useEffect, useState } from "react";
import { api } from "../services/api";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis } from "recharts";

interface AnalyticsData {
  total: number;
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
    <div>
      <h2>Total Feedback: {data.total}</h2>

      <PieChart width={400} height={300}>
        <Pie data={data.sentiment} dataKey="count" nameKey="_id" />
      </PieChart>

      <BarChart width={500} height={300} data={data.priority}>
        <XAxis dataKey="_id" />
        <YAxis />
        <Bar dataKey="count" />
      </BarChart>
    </div>
  );
}