import React, { useState, useEffect } from "react";
import axios from "axios";

const ActivityTimeline = ({ id }) => {
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // small helper for better UX
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    const intervals = [
      { label: "y", seconds: 31536000 },
      { label: "mo", seconds: 2592000 },
      { label: "d", seconds: 86400 },
      { label: "h", seconds: 3600 },
      { label: "m", seconds: 60 },
    ];

    for (let i of intervals) {
      const count = Math.floor(seconds / i.seconds);
      if (count > 0) return `${count}${i.label} ago`;
    }

    return "just now";
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${BACKEND_URL}/api/activity/${id}`, {
          withCredentials: true,
        });
        // console.log("activity logs: ", data);
        setLogs(data);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [id]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <h2 className="text-sm font-semibold mb-4 text-gray-700">
        Activity Timeline
      </h2>

      {/* Loading */}
      {loading && (
        <p className="text-sm text-gray-400 animate-pulse">
          Loading activity...
        </p>
      )}

      {/* Empty */}
      {!loading && logs.length === 0 && (
        <p className="text-sm text-gray-400">No activity yet</p>
      )}

      {/* Timeline */}
      <div className="relative max-h-72 overflow-y-auto pr-2 space-y-6">
        {/* vertical line */}
        <div className="absolute left-3 top-0 bottom-0 w-[2px] bg-gray-200" />

        {logs.map((log) => (
          <div key={log._id} className="relative flex gap-4 group">
            {/* Avatar dot */}
            <div className="z-10 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-500 text-white text-xs font-bold shadow">
              {log.actor?.name?.[0] || "?"}
            </div>

            {/* Content */}
            <div className="flex-1 bg-gray-50 group-hover:bg-indigo-50 transition rounded-xl p-3 shadow-sm">
              <p className="text-sm text-gray-800">
                <span className="font-semibold text-indigo-600">
                  {log.actor?.name}
                </span>{" "}
                <br />
                {log.message}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {timeAgo(log.createdAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityTimeline;
