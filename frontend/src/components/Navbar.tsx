import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
      <Link to="/">Home</Link>{" "}
      {role === "admin" && <Link to="/admin">Admin Dashboard</Link>}{" "}
      <button onClick={logout}>Logout</button>
    </nav>
  );
}