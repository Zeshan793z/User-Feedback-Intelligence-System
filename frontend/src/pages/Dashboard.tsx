import { useState, useEffect } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackTable from "../components/FeedbackTable";
import FiltersBar from "../components/FiltersBar";
import LoadingSpinner from "../components/LoadingSpinner"; // ✅ Added
import toast from "react-hot-toast"; // ✅ Added

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Added

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
    </div>
  );
}