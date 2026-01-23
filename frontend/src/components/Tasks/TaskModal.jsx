import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { addTask, updateTask } from "../../features/taskSlice";
import useAllUsers from "../hooks/Alluser";
import { toast } from "react-hot-toast";

const TaskModal = ({ projectId, task, onClose }) => {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [status, setStatus] = useState("Todo");
  const [endDate, setEndDate] = useState("");
  const [users, setUsers] = useState([]);

  const isEdit = !!task;

  const allusers = useSelector((state) => state.allusers.allusers || []);

  // console.log("allusers", allusers);

  const { fetchAllUsers } = useAllUsers();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "Low");
      setStatus(task.status || "Todo");
      setEndDate(task.endDate?.slice(0, 10) || "");
      setUsers(task.users || []);
    }
  }, [task]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // const token = localStorage.getItem("token");

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.put(
        `${BACKEND_URL}/api/tasks/${task._id}`,
        {
          title,
          description,
          priority,
          users,
          status,
          endDate,
        },
        { withCredentials: true },
      );

      dispatch(updateTask(data));
      alert("Updated successfully");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/tasks`,
        {
          title,
          users,
          endDate,
          priority,
          description,
          projectRef: projectId,
        },
        {
          withCredentials: true,
        },
      );

      dispatch(addTask(data));
      onClose();
    } catch (error) {
      // alert(error.response?.data?.message || "Bad request");
      toast.error(error);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={isEdit ? handleUpdate : handleSubmit}
        className="bg-white p-6 rounded-xl w-100"
      >
        <h2 className="mb-4 font-semibold">
          {isEdit ? "Edit Task" : "Add Task"}
        </h2>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full border border-gray-500 p-2 mb-3 rounded-md"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
          className="w-full border border-gray-500 p-2 rounded-md px-3 py-2 mb-3"
        />

        <select
          multiple
          value={users}
          onChange={(e) =>
            setUsers(
              Array.from(e.target.selectedOptions, (option) => option.value),
            )
          }
          className="w-full border border-gray-500 p-2 rounded h-28 outline-none mb-3 overflow-y-scroll"
        >
          {allusers.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full border border-gray-500 outline-none p-2 mb-3 rounded"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-500 p-2 mb-3 rounded outline-none"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="w-full border border-gray-500 p-2 mb-3 rounded outline-none"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <div className="flex justify-end gap-4 mt-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white cursor-pointer px-4 py-2 rounded-md shadow-2xl"
          >
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskModal;
