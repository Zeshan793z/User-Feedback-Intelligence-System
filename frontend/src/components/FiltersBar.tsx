interface FiltersBarProps {
  search: string;
  setSearch: (value: string) => void;
  category: string;
  setCategory: (value: string) => void;
  priority: string;
  setPriority: (value: string) => void;
}

export default function FiltersBar({
  search,
  setSearch,
  category,
  setCategory,
  priority,
  setPriority,
}: FiltersBarProps) {
  return (
    <div className="bg-white p-4 rounded shadow flex gap-4 mb-6">
      <input
        placeholder="Search feedback or user name..."
        className="border p-2 flex-1 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        className="border p-2 rounded"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">All Categories</option>
        <option value="bug">Bug</option>
        <option value="feature">Feature</option>
        <option value="general">General</option>
      </select>

      <select
        className="border p-2 rounded"
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