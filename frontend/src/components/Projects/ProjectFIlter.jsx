import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export default function ProjectFilter({ filterProjects }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All");
  const ref = useRef();

  const statuses = ["All", "Todo", "In Progress", "Completed"];

  // close when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const handleSelect = (status) => {
    setSelected(status);
    filterProjects(status);
    setOpen(false);
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
        <div className="mt-2 w-56 p-4 bg-white rounded-2xl shadow-xl border z-50">
          <p className="text-sm text-gray-500 mb-2">Filter by status</p>

          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => handleSelect(s)}
                className={`px-3 py-1 rounded-full text-sm transition
                  ${
                    selected === s
                      ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
