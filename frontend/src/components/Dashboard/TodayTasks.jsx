import React from "react";
import { useSelector } from "react-redux";

const TodayTasks = () => {
  const userTasks = useSelector((state) => state.userInfo.userInfo);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-medium mb-4">Today's Tasks</h3>

      <ul className="space-y-3">
        {userTasks?.tasks?.map((task) => (
          <li key={task._id} className="flex justify-between items-center">
            <span>{task.title}</span>
            <span className="text-xs text-gray-500">{task.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodayTasks;
