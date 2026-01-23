import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { setTasks, removeTask, clearTasks } from "../features/taskSlice";
import TaskModal from "../components/Tasks/TaskModal";

const ProjectDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const tasks = useSelector((state) => state.tasks.tasks);

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  // const token = localStorage.getItem("token");

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Delete this task?");

    if (!confirmDelete) return;

    try {
      await axios.delete(`${BACKEND_URL}/api/tasks/${id}`, {
        withCredentials: true,
      });

      dispatch(removeTask(id));
    } catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const { data } = await axios.get(`${BACKEND_URL}/api/tasks/${id}`, {
          withCredentials: true,
        });
        console.log(data);
        dispatch(setTasks(data));
      } catch (err) {
        console.error(err);
      }
    };

    fetchTasks();

    return () => dispatch(clearTasks());
  }, [id]);

  return (
    <div className="py-10 space-y-8 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Project Tasks</h1>

        <button
          onClick={() => {
            (setShowModal(true), setSelectedTask(null));
          }}
          className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform cursor-pointer"
        >
          + Add Task
        </button>
      </div>

      {/* Task List */}
      {tasks.length === 0 ? (
        <div className="text-gray-500 text-center py-20">
          No tasks yet. Create one 🚀
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-5">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white p-4 rounded-lg shadow-sm flex flex-col justify-between hover:scale-102 transition-transform cursor-pointer"
            >
              <span className="text-lg font-medium">{task.title}</span>
              <span className="text-gray-400 mb-2">{task.description}</span>

              <span className="text">{task.comments}</span>
              <span className="mb-2">
                Status:{" "}
                <span
                  className={`${task.status == "Todo" && "text-gray-500"} ${task.status === "In Progress" ? "text-green-500" : "text-blue-500"}`}
                >
                  {task.status}
                </span>
              </span>

              <span>
                Priority:{" "}
                <span
                  className={`${task.priority == "Low" && "text-green-500"} ${task.priority === "Medium" ? "text-yellow-500" : "text-red-500"}
              >`}
                >
                  {task.priority}
                </span>
              </span>

              <div className="flex justify-end gap-4 mt-4 text-sm items-end">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>

                <button
                  onClick={handleDelete.bind(null, task._id)}
                  className="text-red-500 hover:underline cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <TaskModal
          projectId={id}
          task={selectedTask}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
