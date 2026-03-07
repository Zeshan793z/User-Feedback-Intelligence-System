import { useEffect, useState, useCallback } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import FeedbackModal from "../components/FeedbackModal";
import FeedbackTable from "../components/FeedbackTable";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

const load = useCallback(async () => {
  const res = await api.get("/feedback", { params: { search } });
  setData(res.data);
}, [search]);

useEffect(() => {
  const fetchData = async () => {
    await load();
  };
  fetchData();
}, [load]);

  return (
    <div>
      <Navbar />
      <div className="p-6">
        <div className="flex justify-between mb-4">
          <input
            className="border p-2"
            placeholder="Search name"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="bg-indigo-600 text-white px-4 py-2"
            onClick={() => setModal(true)}
          >
            Create Feedback
          </button>
        </div>

        <button className="mb-4 text-blue-600" onClick={load}>
          Search
        </button>

        <FeedbackTable data={data} />
      </div>

      {modal && (
        <FeedbackModal onClose={() => setModal(false)} onCreated={load} />
      )}
    </div>
  );
}