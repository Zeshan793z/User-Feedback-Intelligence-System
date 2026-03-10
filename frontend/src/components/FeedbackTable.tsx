

import SentimentBadge from "./SentimentBadge";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Feedback } from "../types/Feedback";

//Before deploy update

// interface FeedbackTableProps {
//   data: Feedback[];
//   reload: () => void;
  
// }

interface FeedbackTableProps {
  data: Feedback[];
  reload: () => Promise<void>;
  searchTerm?: string; // optional
}


export default function FeedbackTable({ data, reload }: FeedbackTableProps) {
  const role = localStorage.getItem("role");

  const deleteFeedback = async (id: string) => {
    try {
      await api.delete(`/feedback/${id}`);
      toast.success("Feedback deleted");
      reload();
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
            <tr key={f._id} className="border-t">
              <td className="p-2">{f.name}</td>
              <td>{f.message}</td>
              <td>{f.category}</td>
              <td>{f.priority}</td>
              <td>
                <SentimentBadge
                  sentiment={f.sentiment as "positive" | "neutral" | "negative"}
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
    </div>
  );
}
