import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const submit = async () => {
    try {
      const res = await api.post("/auth/register", form);

      // ✅ Save JWT token if backend returns it
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
      }

      // ✅ Redirect straight to dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Registration failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-6 shadow rounded w-80">
        <h2 className="text-xl font-bold mb-4">Register</h2>

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

        <input
          className="border p-2 w-full mb-2"
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="bg-indigo-600 text-white w-full py-2"
          onClick={submit}
        >
          Register
        </button>
      </div>
    </div>
  );
}

//Before deploy update

// import { useState } from "react";
// import api from "../api/api";
// import { useNavigate } from "react-router-dom";

// export default function Register() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const submit = async () => {
//     await api.post("/auth/register", form);
//     localStorage.setItem("token", res.data.token);
//     navigate("/");
//   };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <div className="bg-white p-6 shadow rounded w-80">
//         <h2 className="text-xl font-bold mb-4">Register</h2>

//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Name"
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />

//         <input
//           className="border p-2 w-full mb-2"
//           placeholder="Email"
//           onChange={(e) => setForm({ ...form, email: e.target.value })}
//         />

//         <input
//           className="border p-2 w-full mb-2"
//           type="password"
//           placeholder="Password"
//           onChange={(e) => setForm({ ...form, password: e.target.value })}
//         />

//         <button
//           className="bg-indigo-600 text-white w-full py-2"
//           onClick={submit}
//         >
//           Register
//         </button>
//       </div>
//     </div>
//   );
// }
