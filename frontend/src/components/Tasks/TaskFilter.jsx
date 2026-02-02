import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export default function TaskFilter({ filterTasks }) {
  const [open, setOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");

  const ref = useRef();

  const statuses = ["All", "Todo", "In Progress", "Completed"];
  const priorities = ["All", "Low", "Medium", "High"];

  // close when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // 🔥 single source of truth
  const applyFilter = (status, priority) => {
    setSelectedStatus(status);
    setSelectedPriority(priority);
    filterTasks(status, priority);
  };

  return (
    <div className="relative" ref={ref}>
      {/* button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-full
        bg-gradient-to-r from-blue-500 to-green-500 text-white
        shadow hover:scale-105 transition"
      >
        <FontAwesomeIcon icon={faFilter} />
        Filter
      </button>

      {/* dropdown */}
      {open && (
        <div
          className={`overflow-hidden transition-all duration-300 ${
            open ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}
        >
          <div className="w-64 p-4 bg-white rounded-2xl shadow-xl border space-y-4">
            {/* Status */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Filter by status</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => applyFilter(s, selectedPriority)}
                    className={`px-3 py-1 rounded-full text-sm transition
                  ${
                    selectedStatus === s
                      ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Filter by priority</p>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => applyFilter(selectedStatus, p)}
                    className={`px-3 py-1 rounded-full text-sm transition
                  ${
                    selectedPriority === p
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
