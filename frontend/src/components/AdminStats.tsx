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