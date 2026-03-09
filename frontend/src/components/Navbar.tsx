import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";

export default function Navbar() {
const role = localStorage.getItem("role");
const username = localStorage.getItem("username");

const navigate = useNavigate();
const location = useLocation();

const logout = () => {
localStorage.clear();
toast.success("You have been logged out");
navigate("/login");
};

const linkStyle = (path: string) =>
location.pathname === path
? "font-semibold border-b-2 border-white pb-1"
: "opacity-80 hover:opacity-100";

return ( <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">

  {/* Logo */}
  <h1 className="font-bold text-xl">Feedback Intelligence</h1>

  <div className="flex items-center gap-6">

    {/* Dashboard */}
    <Link to="/" className={linkStyle("/")}>
      Dashboard
    </Link>

    {/* Admin Analytics */}
    {role === "admin" && (
      <Link to="/admin" className={linkStyle("/admin")}>
        Analytics
      </Link>
    )}

    {/* User icon + username */}
    <div className="flex items-center gap-2">
      <img
        src="/User_Icon.png"
        alt="User Icon"
        className="h-6 w-6 rounded-full"
      />
      <span className="font-semibold">{username}</span>
    </div>

    {/* Logout */}
    <button
      className="bg-white text-indigo-600 px-3 py-1 rounded hover:bg-gray-100"
      onClick={logout}
    >
      Logout
    </button>

  </div>
</nav>

);
}

// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast"; // ✅ Import toast

// export default function Navbar() {
//   const role = localStorage.getItem("role");
//   const username = localStorage.getItem("username");

//   const navigate = useNavigate();

//   const logout = () => {
//     localStorage.clear();
//     toast.success("You have been logged out");
//     navigate("/login");
//   };

//   return (
//     <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
//       <h1 className="font-bold text-xl">Feedback Intelligence</h1>

//       <div className="flex items-center gap-6">
//         {role === "admin" && <Link to="/admin">Analytics</Link>}

//         {/* User icon (PNG) + username */}
//         <div className="flex items-center gap-2">
//           <img
//             src="public\User_Icon.png" // ✅ Path to your PNG icon
//             alt="User Icon"
//             className="h-6 w-6 rounded-full" // ✅ Tailwind classes for size & shape
//           />
//           <span className="font-semibold">{username}</span>
//         </div>

//         <button
//           className="bg-white text-indigo-600 px-3 py-1 rounded"
//           onClick={logout}
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }
// import { Link, useNavigate } from "react-router-dom";
// import toast from "react-hot-toast"; // ✅ Import toast

// export default function Navbar() {
//   const role = localStorage.getItem("role");
//   const username = localStorage.getItem("username");

//   const navigate = useNavigate();

//   const logout = () => {
//     localStorage.clear();

//     // ✅ Show logout toast
//     toast.success("You have been logged out");

//     navigate("/login");
//   };

//   return (
//     <nav className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
//       <h1 className="font-bold text-xl">Feedback Intelligence</h1>

//       <div className="flex items-center gap-6">

//         {role === "admin" && <Link to="/admin">Analytics</Link>}

//         <span className="font-semibold">{username}</span>

//         <button
//           className="bg-white text-indigo-600 px-3 py-1 rounded"
//           onClick={logout}
//         >
//           Logout
//         </button>
//       </div>
//     </nav>
//   );
// }