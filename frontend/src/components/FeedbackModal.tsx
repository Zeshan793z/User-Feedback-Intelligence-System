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
    alert("Feedback submitted!");
    onClose();
  };

  return (
    <div style={{ background: "#eee", padding: 20 }}>
      <h3>Create Feedback</h3>
      <input
        placeholder="Name"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <br />
      <input
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <br />
      <textarea
        placeholder="Message"
        onChange={e => setForm({ ...form, message: e.target.value })}
      />
      <br />
      <button onClick={submit}>Submit</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
}