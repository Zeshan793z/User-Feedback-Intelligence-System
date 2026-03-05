import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async () => {
    const res = await api.post("/auth/login", form);

    localStorage.setItem("token", res.data.token);

    // Decode role from token
    const payload = JSON.parse(atob(res.data.token.split(".")[1]));
    localStorage.setItem("role", payload.role);

    navigate("/");
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <br />
      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <br />
      <button onClick={submit}>Login</button>
    </div>
  );
}