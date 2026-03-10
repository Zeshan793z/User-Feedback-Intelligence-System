
import { useState, useEffect } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import FiltersBar from "../components/FiltersBar";
import FeedbackModal from "../components/FeedbackModal"; // ✅ Added
import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
import toast from "react-hot-toast"; // ✅ Added

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added
  const [modal, setModal] = useState(false); // ✅ Added

  // Load function with spinner + toast
  const load = async () => {
    try {
      setLoading(true);

      const res = await api.get("/feedback", {
        params: { search, category, priority },
      });

      setData(res.data);
    } catch {
      toast.error("Failed to fetch feedback"); // ✅ Error toast
    } finally {
      setLoading(false);
    }
  };

  // Fetch data whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/feedback", {
          params: { search, category, priority },
        });
        setData(res.data);
      } catch {
        toast.error("Failed to fetch feedback");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, category, priority]);

  return (
    <div>
      <Navbar />

      <div className="p-6">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Feedback Dashboard</h2>

          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            onClick={() => setModal(true)}
          >
           ✚ Create Feedback
          </button>
        </div>

        {/* Filters */}
        <FiltersBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
        />

        {/* ✅ Show spinner while loading, otherwise show table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FeedbackTable data={data} reload={load} />
        )}
      </div>

      {/* Feedback Modal */}
      {modal && (
        <FeedbackModal
          onClose={() => setModal(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}


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