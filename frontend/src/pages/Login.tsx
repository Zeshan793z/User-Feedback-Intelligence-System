import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Add spinner

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // ✅ track loading state

  const navigate = useNavigate();

  const submit = async () => {
    try {
      setLoading(true); // show spinner
      const res = await api.post("/auth/login", { email, password });

      toast.success("Login successful!");

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("username", res.data.name);

      // ✅ Redirect to home
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false); // hide spinner
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <LoadingSpinner /> // ✅ show spinner while logging in
      ) : (
        <div className="bg-white p-6 shadow rounded w-80">
          <h2 className="text-xl font-bold mb-4">Login</h2>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="bg-indigo-600 text-white w-full py-2"
            onClick={submit}
          >
            Login
          </button>

          <p className="mt-3 text-sm">
            No account? <Link to="/register">Register</Link>
          </p>
        </div>
      )}
    </div>
  );
}

//Before deploy update

// import { useState } from "react";
// import api from "../api/api";
// import { useNavigate, Link } from "react-router-dom";
// import toast from "react-hot-toast"; // ✅ Import toast

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const navigate = useNavigate();

//   const submit = async () => {
//   try {
//     const res = await api.post("/auth/login", { email, password });

//     toast.success("Login successful!");

//     localStorage.setItem("token", res.data.token);
//     localStorage.setItem("role", res.data.role);
//     localStorage.setItem("username", res.data.name);

//     navigate("/");
//   } catch (error) {
//     console.error(error); // ✅ now it's used
//     toast.error("Invalid email or password");
//   }
// };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="bg-white p-6 shadow rounded w-80">
//         <h2 className="text-xl font-bold mb-4">Login</h2>

//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Email"
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <input
//           className="border p-2 w-full mb-2"
//           type="password"
//           placeholder="Password"
//           onChange={(e) => setPassword(e.target.value)}
//         />

//         <button
//           className="bg-indigo-600 text-white w-full py-2"
//           onClick={submit}
//         >
//           Login
//         </button>

//         <p className="mt-3 text-sm">
//           No account? <Link to="/register">Register</Link>
//         </p>
//       </div>
//     </div>
//   );
// }