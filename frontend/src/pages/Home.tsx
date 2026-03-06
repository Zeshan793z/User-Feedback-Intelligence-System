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