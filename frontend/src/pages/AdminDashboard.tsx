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
                    <Cell
                      key={`sentiment-${i}`}
                      fill={COLORS[i % COLORS.length]}
                    />
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
                    <Cell
                      key={`priority-${i}`}
                      fill={COLORS[i % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </div>

        {/* FEEDBACK TABLE */}
        {/* <FeedbackTable data={displayedFeedbacks} reload={loadFeedback} /> */}
        {/* <FeedbackTable
          data={displayedFeedbacks}
          onDelete={(id) => {
            setFeedbacks((prev) => prev.filter((f) => f._id !== id));
          }}
        /> */}
        <FeedbackTable
          data={displayedFeedbacks}
          onDelete={(id) => {
            setFeedbacks((prev) => prev.filter((f) => f._id !== id));
            loadAnalytics();
          }}
        />
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
          // <FeedbackModal
          //   onClose={() => setModal(false)}
          //   onCreated={loadFeedback}
          // />
          <FeedbackModal
            onClose={() => setModal(false)}
            onCreated={(newFeedback) => {
              setFeedbacks((prev) => [newFeedback, ...prev]);
              setModal(false);
            }}
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
