import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

interface AnalyticsItem {
  _id: string;
  count: number;
}

interface AnalyticsData {
  sentiment: AnalyticsItem[];
  priority: AnalyticsItem[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    api.get("/analytics").then((res) => setData(res.data));
  }, []);

  if (!data) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Admin Analytics</h2>

        <div className="flex gap-10">
          <PieChart width={300} height={300}>
            <Pie
              data={data.sentiment}
              dataKey="count"
              nameKey="_id"
              outerRadius={120}
              label
            >
              {data.sentiment.map((item, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>

          <PieChart width={300} height={300}>
            <Pie
              data={data.priority}
              dataKey="count"
              nameKey="_id"
              outerRadius={120}
              label
            >
              {data.priority.map((item, i) => (
                <Cell key={i} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
    </div>
  );
}