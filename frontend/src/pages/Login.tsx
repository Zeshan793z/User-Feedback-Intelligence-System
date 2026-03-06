import { useState } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    const res = await api.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);
    const payload = JSON.parse(atob(res.data.token.split(".")[1]));
    localStorage.setItem("role", payload.role);

    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-96">
        <h2 className="text-xl font-semibold mb-6 text-center">Login</h2>

        <input
          className="w-full border p-2 rounded mb-4"
          placeholder="Email"
          onChange={e => setForm({ ...form, email: e.target.value })}
        />

        <input
          type="password"
          className="w-full border p-2 rounded mb-6"
          placeholder="Password"
          onChange={e => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}