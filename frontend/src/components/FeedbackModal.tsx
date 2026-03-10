import { useState } from "react";
import api from "../api/api";
import toast from "react-hot-toast";
import type { Feedback } from "../types/Feedback";

interface FeedbackModalProps {
  onClose: () => void;
  onCreated: (feedback: Feedback) => void;
}

export default function FeedbackModal({ onClose, onCreated }: FeedbackModalProps) {
  const [form, setForm] = useState({
    name: "",
    message: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);

      const res = await api.post<Feedback>("/feedback", form);

      toast.success("Feedback submitted successfully");

      onCreated(res.data); // ✅ send new feedback

      // onClose();//close modal after success update at 3.39 am
    } catch {
      toast.error("Error submitting feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-1/4 shadow-lg">
        <h2 className="text-lg font-bold mb-6">Submit Feedback</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Your Name</label>
          <input
            className="border border-gray-300 rounded-md p-2 w-full text-gray-600"
            placeholder="Zeshan Ahmed"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Feedback</label>
          <textarea
            className="border border-gray-300 rounded-md p-2 w-full text-gray-600"
            placeholder="Describe your detail feedback here please..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="border p-2 w-full text-gray-600"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 hover:bg-gray-100">
            Cancel
          </button>

          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            onClick={submit}
            disabled={loading}
          >
            {loading ? "Submitting..." : "🚀 Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

//Last Update in the upper one

// import { useState } from "react";
// import api from "../api/api";
// import toast from "react-hot-toast";

// interface FeedbackModalProps {
//   onClose: () => void;
//   onCreated: () => void;
// }

// export default function FeedbackModal({
//   onClose,
//   onCreated,
// }: FeedbackModalProps) {
// const [form, setForm] = useState({
//   name: "",
//   message: "",
//   email: "",
// });

//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     try {
//       setLoading(true);
//       await api.post("/feedback", form);
//       toast.success("Feedback submitted successfully");
//       onCreated();
//       onClose();
//     } catch {
//       toast.error("Error submitting feedback");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg w-1/4 shadow-lg">
//         <h2 className="text-lg font-bold mb-6">Submit Feedback</h2>

//         {/* Name */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Your Name</label>
//           <input
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-600 placeholder-gray-400"
//             placeholder="Zeshan Ahmed"
//             value={form.name}
//             onChange={(e) => setForm({ ...form, name: e.target.value })}
//           />
//         </div>

//         {/* Feedback */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Feedback</label>
//           <textarea
//             className="border border-gray-300 rounded-md p-2 w-full text-gray-600 placeholder-gray-400"
//             placeholder="Describe your detail feedback here please..."
//             value={form.message}
//             onChange={(e) => setForm({ ...form, message: e.target.value })}
//           />
//         </div>

//         {/* Email */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium mb-1">Email</label>
//           <input
//             className="border p-2 w-full mb-3 text-gray-600"
//             placeholder="you@example.com"
//             value={form.email}
//             onChange={(e) => setForm({ ...form, email: e.target.value })}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="flex justify-end gap-2">
//           <button onClick={onClose} className="px-4 py-2  hover:bg-gray-100">
//             Cancel
//           </button>
//           <button
//             className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
//             onClick={submit}
//             disabled={loading}
//           >
//             {loading ? "Submitting..." : "🚀 Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { useState } from "react";
// import api from "../api/api";
// import toast from "react-hot-toast";

// interface FeedbackModalProps {
//   onClose: () => void;
//   onCreated: () => void;
// }

// export default function FeedbackModal({ onClose, onCreated }: FeedbackModalProps) {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     message: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const submit = async () => {
//     try {
//       setLoading(true);
//       await api.post("/feedback", form);
//       toast.success("Feedback submitted successfully");
//       onCreated();
//       onClose();
//     } catch {
//       toast.error("Error submitting feedback");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center">
//       <div className="bg-white p-6 rounded-lg w-1/4 shadow-lg">
//         <h2 className="text-lg font-bold mb-4">Submit Feedback</h2>

//         {/* Name */}
//         <label className="block text-sm font-medium mb-1">Your Name</label>
//         <input
//           className="border p-2 w-full mb-3 text-gray-600"
//           placeholder="Zeshan Ahmed"
//           value={form.name}
//           onChange={(e) => setForm({ ...form, name: e.target.value })}
//         />

//         {/* Feedback */}
//         <label className="block text-sm font-medium mb-1">Feedback</label>
//         <textarea
//           className="border p-2 w-full mb-3 text-gray-600"
//           placeholder="Describe your feedback details here please..."
//           value={form.message}
//           onChange={(e) => setForm({ ...form, message: e.target.value })}
//         />

//         {/* Buttons */}
//         <div className="flex justify-end gap-2 mt-4">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 hover:bg-gray-100"
//           >
//             Cancel
//           </button>
//           <button
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
//             onClick={submit}
//             disabled={loading}
//           >
//             {loading ? "Submitting..." : "🚀 Submit"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
