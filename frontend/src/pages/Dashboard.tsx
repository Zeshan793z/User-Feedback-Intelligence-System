import { useState, useEffect, useCallback } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import FiltersBar from "../components/FiltersBar";
import FeedbackModal from "../components/FeedbackModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import useDebounce from "../hooks/useDebounce";

export default function Dashboard() {

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");

  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [modal, setModal] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // Fetch feedback
  const load = useCallback(async () => {
    try {

      setLoading(true);

      const res = await api.get("/feedback", {
        params: {
          search: debouncedSearch,
          category,
          priority,
        },
      });

      setData(res.data);

    } catch {
      toast.error("Failed to fetch feedback");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }

  }, [debouncedSearch, category, priority]);

  // Load when filters change
  useEffect(() => {

    if (search !== debouncedSearch) {
      setSearchLoading(true);
    }

    load();

  }, [debouncedSearch, category, priority, load]);

  // Auto refresh every 10 seconds
  useEffect(() => {

    const interval = setInterval(() => {
      load();
    }, 10000);

    return () => clearInterval(interval);

  }, [load]);

  return (
    <div>

      <Navbar />

      <div className="p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold">
            Feedback Dashboard
          </h2>

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
          setSearch={(value: string) => {
            setSearch(value);
            setSearchLoading(true);
          }}
          category={category}
          setCategory={setCategory}
          priority={priority}
          setPriority={setPriority}
        />

        {/* Search loading */}
        {searchLoading && (
          <p className="text-sm text-gray-500 mb-3">
            Searching feedback...
          </p>
        )}

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FeedbackTable
            data={data}
            reload={load}
            searchTerm={debouncedSearch}
          />
        )}

      </div>

      {/* Modal */}
      {modal && (
        <FeedbackModal
          onClose={() => setModal(false)}
          onCreated={() => {

            setModal(false);

            load(); // refresh instantly

            toast.success("Feedback created!");

          }}
        />
      )}

    </div>
  );
}


//Before deploy update 

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