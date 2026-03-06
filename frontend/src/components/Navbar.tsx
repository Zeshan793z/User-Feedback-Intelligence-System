import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // Determine correct home path
     const homePath = role === "admin" ? "/dashboard" : "/dashboard";

  return (
    <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <h1
        onClick={() => navigate(homePath)}
        className="text-xl font-semibold cursor-pointer"
      >
        Feedback Intelligence
      </h1>

      {token && (
        <div className="space-x-6 flex items-center">

          <Link to={homePath} className="hover:underline">
            Home
          </Link>

          {role === "admin" && (
            <Link to="/admin" className="hover:underline">
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={logout}
            className="bg-white text-indigo-600 px-3 py-1 rounded-md hover:bg-gray-100 transition"
          >
            Logout
          </button>

        </div>
      )}
    </nav>
  );
}