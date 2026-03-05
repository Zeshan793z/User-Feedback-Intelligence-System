import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const submit = async () => {
    await api.post("/auth/register", form);
    alert("Registered successfully!");
    navigate("/login");
  };

  return (
    <div>
      <h2>Register</h2>
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
      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <br />
      <button onClick={submit}>Register</button>
    </div>
  );
}