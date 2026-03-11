import { useState, useEffect } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import FiltersBar from "../components/FiltersBar";
import FeedbackModal from "../components/FeedbackModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import type { Feedback } from "../types/Feedback";

export default function Dashboard() {
  const [data, setData] = useState<Feedback[]>([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);

  const [newFeedbackId, setNewFeedbackId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/feedback", {
        params: { search: debouncedSearch, category, priority },
      });
      setData(res.data);
    } catch {
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [debouncedSearch, category, priority]);

// const handleCreated = async (feedback: Feedback) => {
//   if (!feedback?._id) {
//     await load(); // fallback if backend doesn't return full object
//     setModal(false);
//     return;
//   }

//   setData((prev) => [feedback, ...prev]);
//   setNewFeedbackId(feedback._id);

//   setTimeout(() => {
//     setNewFeedbackId(null);
//   }, 2000);

//   setModal(false);
// };

//Lower code was updated on 3.41 am

const handleCreated = (feedback: Feedback) => {

  setData(prev => [feedback, ...prev]);

  setNewFeedbackId(feedback._id);

  setModal(false); // ✅ CLOSE MODAL

  setTimeout(() => {
    setNewFeedbackId(null);
  }, 2000);
};

//Lower code was updated on 3.47 am

const handleDelete = (id: string) => {
  setData(prev => prev.filter(f => f._id !== id));
};

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Feedback Dashboard</h2>
          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setModal(true)}
          >
            ✚ Create Feedback
          </button>
        </div>

        <FiltersBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
        />

        {loading ? (
          <LoadingSpinner />
        ) : (
          <FeedbackTable
            data={data}
            highlightId={newFeedbackId} // ✅ now typed
            onDelete={handleDelete} // Updated on 3.47 am
          />
        )}
      </div>

      {modal && (
        <FeedbackModal onClose={() => setModal(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}

//Last Update is Upper one
// import { useState, useEffect } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import FeedbackTable from "../components/FeedbackTable";
// import FiltersBar from "../components/FiltersBar";
// import FeedbackModal from "../components/FeedbackModal"; // ✅ Added
// import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
// import toast from "react-hot-toast"; // ✅ Added

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [priority, setPriority] = useState("");
//   const [loading, setLoading] = useState(false); // ✅ Added
//   const [modal, setModal] = useState(false); // ✅ Added

//   // Load function with spinner + toast
//   const load = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/feedback", {
//         params: { search, category, priority },
//       });

//       setData(res.data);
//     } catch {
//       toast.error("Failed to fetch feedback"); // ✅ Error toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data whenever filters change
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const res = await api.get("/feedback", {
//           params: { search, category, priority },
//         });
//         setData(res.data);
//       } catch {
//         toast.error("Failed to fetch feedback");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, [search, category, priority]);

//   return (
//     <div>
//       <Navbar />

//       <div className="p-6">
//         {/* HEADER */}
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-bold">Feedback Dashboard</h2>

//           <button
//             className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
//             onClick={() => setModal(true)}
//           >
//            ✚ Create Feedback
//           </button>
//         </div>

//         {/* Filters */}
//         <FiltersBar
//           search={search}
//           setSearch={setSearch}
//           category={category}
//           setCategory={setCategory}
//           priority={priority}
//           setPriority={setPriority}
//         />

//         {/* ✅ Show spinner while loading, otherwise show table */}
//         {loading ? (
//           <LoadingSpinner />
//         ) : (
//           <FeedbackTable data={data} reload={load} />
//         )}
//       </div>

//       {/* Feedback Modal */}
//       {modal && (
//         <FeedbackModal
//           onClose={() => setModal(false)}
//           onCreated={load}
//         />
//       )}
//     </div>
//   );
// }


// import { useState, useEffect } from "react";
// import api from "../api/api";
// import Navbar from "../components/Navbar";
// import FeedbackTable from "../components/FeedbackTable";
// import FiltersBar from "../components/FiltersBar";
// import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
// import toast from "react-hot-toast"; // ✅ Added

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("");
//   const [priority, setPriority] = useState("");
//   const [loading, setLoading] = useState(false); // ✅ Added

//   // Load function with spinner + toast
//   const load = async () => {
//     try {
//       setLoading(true);

//       const res = await api.get("/feedback", {
//         params: { search, category, priority },
//       });

//       setData(res.data);
//     } catch {
//       toast.error("Failed to fetch feedback"); // ✅ Error toast
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch data whenever filters change
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await api.get("/feedback", {
  //         params: { search, category, priority },
  //       });
  //       setData(res.data);
  //     } catch {
  //       toast.error("Failed to fetch feedback");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchData();
  // }, [search, category, priority]);

//   return (
//     <div>
//       <Navbar />

//       <div className="p-6">
//         <FiltersBar
//           search={search}
//           setSearch={setSearch}
//           category={category}
//           setCategory={setCategory}
//           priority={priority}
//           setPriority={setPriority}
//         />

//         {/* ✅ Show spinner while loading, otherwise show table */}
//         {loading ? (
//           <LoadingSpinner />
//         ) : (
//           <FeedbackTable data={data} reload={load} />
//         )}
//       </div>
//     </div>
//   );
// }