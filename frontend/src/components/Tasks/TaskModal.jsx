import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addTask, updateTask } from "../../features/taskSlice";
import useAllUsers from "../../hooks/Alluser";
import { notify } from "../../utils/toast";

const TaskModal = ({ projectId, task, onClose }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [status, setStatus] = useState("Todo");
  const [endDate, setEndDate] = useState("");
  const [users, setUsers] = useState([]);

  const isEdit = !!task;

  const allusers = useSelector((state) => state.allusers.allusers.users || []);
  const { fetchAllUsers } = useAllUsers();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task?.title || "");
      setDescription(task?.description || "");
      setPriority(task?.priority || "Low");
      setStatus(task?.status || "Todo");
      setEndDate(task?.endDate?.slice(0, 10) || "");
      setUsers(task?.users || []);
    }
  }, [task]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        `${BACKEND_URL}/api/tasks/${task._id}`,
        { title, description, priority, users, status, endDate },
        { withCredentials: true },
      );

      // dispatch(updateTask(data));
      notify.success("Task updated");
      onClose();
    } catch (err) {
      notify.error(err.response?.data?.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/tasks`,
        { title, users, endDate, priority, description, projectRef: projectId },
        { withCredentials: true },
      );

      // dispatch(addTask(data));
      notify.success("Task created");
      onClose();
    } catch (error) {
      notify.error(error.response?.data?.message || "Error");
    }
  };

  const inputStyle =
    "w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none";

  return (
    /* BACKDROP */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      {/* MODAL */}
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={isEdit ? handleUpdate : handleSubmit}
        className="bg-white w-[95%] md:w-[650px] rounded-2xl shadow-2xl p-6 space-y-5"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Edit Task ✏️" : "Create Task 🚀"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg"
          >
            ✕
          </button>
        </div>

        {/* TITLE */}
        <div>
          <label className="text-sm font-medium text-gray-600">Title</label>
          <input
            className={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium text-gray-600">
            Description
          </label>
          <textarea
            rows={3}
            className={inputStyle}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add task details..."
          />
        </div>

        {/* 2 COLUMN GRID */}
        {!isEdit && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* PRIORITY */}
            <div>
              <label className="text-sm font-medium text-gray-600">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputStyle}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            {/* STATUS */}

            <div>
              <label className="text-sm font-medium text-gray-600">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputStyle}
              >
                <option>Todo</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Assign Users
          </label>

          <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto p-2 space-y-2">
            {allusers.map((user) => {
              const checked = users.includes(user._id);

              return (
                <label
                  key={user._id}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition
            ${checked ? "bg-blue-50 border border-blue-300" : "hover:bg-gray-50"}
          `}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        setUsers(users.filter((u) => u !== user._id));
                      } else {
                        setUsers([...users, user._id]);
                      }
                    }}
                    className="w-4 h-4 accent-blue-500"
                  />

                  <span className="text-sm">{user.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* DATE */}
        <div>
          <label className="text-sm font-medium text-gray-600">Due Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputStyle}
          />
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-blue-500 to-emerald-500 hover:scale-105 transition"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskModal;
