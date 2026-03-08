import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast"; // ✅ Import toast

export default function Navbar() {
  const role = localStorage.getItem("role");
  const username = localStorage.getItem("username");

  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();

    // ✅ Show logout toast
    toast.success("You have been logged out");

    navigate("/login");
  };

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="font-bold text-xl">Feedback Intelligence</h1>

      <div className="flex items-center gap-6">
        <Link to="/">Dashboard</Link>

        {role === "admin" && <Link to="/admin">Analytics</Link>}

        <span className="font-semibold">{username}</span>

        <button
          className="bg-white text-indigo-600 px-3 py-1 rounded"
          onClick={logout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}