import { useState } from "react";
import { api } from "../services/api";

interface FeedbackModalProps {
  onClose: () => void;
}

export default function FeedbackModal({ onClose }: FeedbackModalProps) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });

  const submit = async () => {
    await api.post("/feedbacks", form);
    onClose();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Submit Feedback</h2>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Name"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <textarea
          className="w-full border p-2 rounded mb-4"
          rows={4}
          placeholder="Your feedback..."
          onChange={e => setForm({ ...form, message: e.target.value })}
        />

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}