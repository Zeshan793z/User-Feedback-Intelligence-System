import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { FC } from "react";

interface FeedbackModalProps {
  onClose: () => void;       // a function that closes the modal
  onCreated: () => void;     // a function that runs after feedback is created
}

const FeedbackModal: FC<FeedbackModalProps> = ({ onClose, onCreated }) => {
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
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <textarea
          className="border p-2 w-full mb-2"
          placeholder="Message"
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
};

export default FeedbackModal;