import { Search, X } from "lucide-react";

interface FiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
  searchLoading?: boolean; // optional indicator
}

export default function FiltersBar({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
  searchLoading,
}: FiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded shadow flex flex-wrap gap-4 mb-6 items-center">

      {/* SEARCH INPUT */}
      <div className="relative flex-1 min-w-[220px]">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          placeholder="Search feedback or user name..."
          className="border p-2 pl-9 pr-8 w-full rounded focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Clear button */}
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
          >
            <X size={16} />
          </button>
        )}

        {/* Search loading indicator */}
        {searchLoading && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full" />
        )}
      </div>

      {/* CATEGORY FILTER */}
      <select
        className="border p-2 rounded min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature</option>
        <option value="performance">Performance</option>
        <option value="billing">Billing</option>
        <option value="general">General</option>
      </select>

      {/* PRIORITY FILTER */}
      <select
        className="border p-2 rounded min-w-[150px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

    </div>
  );
}

//Before deploy update

// interface FiltersBarProps {
//   search: string;
//   setSearch: (value: string) => void;
//   category: string;
//   setCategory: (value: string) => void;
//   priority: string;
//   setPriority: (value: string) => void;
// }

// export default function FiltersBar({
//   search,
//   setSearch,
//   category,
//   setCategory,
//   priority,
//   setPriority,
// }: FiltersBarProps) {
//   return (
//     <div className="bg-white p-4 rounded shadow flex gap-4 mb-6">
//       <input
//         placeholder="Search feedback or user name..."
//         className="border p-2 flex-1 rounded"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//       />

//       <select
//         className="border p-2 rounded"
//         value={category}
//         onChange={(e) => setCategory(e.target.value)}
//       >
//         <option value="">All Categories</option>
//         <option value="bug">Bug</option>
//         <option value="feature">Feature</option>
//         <option value="general">General</option>
//       </select>

//       <select
//         className="border p-2 rounded"
//         value={priority}
//         onChange={(e) => setPriority(e.target.value)}
//       >
//         <option value="">All Priorities</option>
//         <option value="high">High</option>
//         <option value="medium">Medium</option>
//         <option value="low">Low</option>
//       </select>
//     </div>
//   );
// }