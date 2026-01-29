import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  setTasks,
  removeTask,
  clearTasks,
  startLoading,
} from "../features/taskSlice";
import {
  faComment,
  faTrashCan,
  faPenToSquare,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TaskModal from "../components/Tasks/TaskModal";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { notify } from "../utils/toast";

dayjs.extend(relativeTime);

const ProjectDetails = () => {
  const { id } = useParams();
  // console.log("id: ", id);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const users = useSelector((state) => state.allusers.allusers || []);
  const tasks = useSelector((state) => state.tasks.tasks);
  const loading = useSelector((state) => state.tasks.loading);

  // console.log("task: ", loading);

  const user = useSelector((state) => state.auth);

  const [openComments, setOpenComments] = useState(null);
  const [newComment, setNewComment] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  // -----------------------------
  // Fetch
  // -----------------------------
  useEffect(() => {
    const fetchTasks = async () => {
      dispatch(startLoading());
      const { data } = await axios.get(`${BACKEND_URL}/api/tasks/${id}`, {
        withCredentials: true,
      });

      // console.log(data);

      dispatch(setTasks(data));
    };

    fetchTasks();
    return () => dispatch(clearTasks());
  }, [id]);

  useEffect(() => {
    // console.log(tasks.length);
    if (tasks.length === 0) {
      notify.dismiss();
      notify.success("No tasks yet 🚀");

      const timer = setTimeout(() => navigate("/projects"), 1000);

      return () => clearTimeout(timer);
    }
  }, [loading, tasks.length]);

  // console.log("users:   ", users);
  const getUserName = (id) => {
    // console.log(id);
    let user = users.users.find((u) => u._id === id);
    if (!user) {
      user = users.admin.find((u) => u._id === id);
    }

    // console.log("-------", user);
    return user ? user.name : "Unknown";
  };

  // -----------------------------
  // Delete
  // -----------------------------
  const handleDelete = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    await axios.delete(`${BACKEND_URL}/api/tasks/${taskId}`, {
      withCredentials: true,
    });

    dispatch(removeTask(taskId));
    notify.success("Task Deleted!!");
  };

  // -----------------------------
  // Inline update (status/priority)
  // -----------------------------
  const updateField = async (taskId, field, value) => {
    try {
      const { data } = await axios.put(
        `${BACKEND_URL}/api/tasks/${taskId}`,
        { [field]: value },
        { withCredentials: true },
      );

      dispatch(setTasks(tasks.map((t) => (t._id === taskId ? data : t))));

      notify.success(`${field} updated`);
    } catch {
      notify.error("Unauthorized Access, Only Admin can change!!");
      notify.error("Update failed");
    }
  };

  // -----------------------------
  // Add comment
  // -----------------------------
  const addComment = async (taskId) => {
    if (!newComment.trim()) return;

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}/api/tasks/${taskId}/comment`,
        { comment: newComment },
        { withCredentials: true },
      );

      dispatch(setTasks(tasks.map((t) => (t._id === taskId ? data.task : t))));

      setNewComment("");
      notify.success("Comment added");
    } catch {
      notify.error("Failed to add comment");
    }
  };

  return (
    <div className="py-10 space-y-8 min-h-screen">
      {/* Header */}{" "}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Project Tasks</h1>{" "}
        {user.isAdmin && (
          <button
            onClick={() => {
              (setShowModal(true), setSelectedTask(null));
            }}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform cursor-pointer"
          >
            + Add Task
          </button>
        )}
      </div>
      {tasks.length === 0 ? (
        <div className="text-gray-500 text-center py-20">No tasks yet 🚀</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="group bg-white/90 backdrop-blur rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between border border-gray-100 hover:-translate-y-1"
            >
              {/* ---------------- Header ---------------- */}
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-xl text-gray-800 group-hover:text-blue-600 transition">
                  {task.title}
                </h2>

                {/* <h3>Assigned to: {task.users}</h3> */}

                {user.isAdmin && (
                  <div className="flex items-center justify-between gap-3">
                    <button
                      className="text-blue-400 hover:text-blue-600 text-sm cursor-pointer"
                      onClick={() => {
                        (setShowModal(true), setSelectedTask(task));
                      }}
                    >
                      <FontAwesomeIcon
                        icon={faPenToSquare}
                        // style={{ color: "#0000ff" }}
                        size="lg"
                      />
                    </button>

                    <button
                      onClick={() => handleDelete(task._id)}
                      className="text-red-400 hover:text-red-500 text-sm cursor-pointer"
                    >
                      {/* <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    size="lg"
                    style={{ color: "#63E6BE" }}
                  /> */}

                      <FontAwesomeIcon
                        icon={faTrashCan}
                        // style={{ color: "#ff0000" }}
                        size="lg"
                      />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-gray-500 text-[16px] mt-1 line-clamp-2">
                {task.description}
              </p>

              {/* <p className="text-xs text-gray-500 mt-2">
                Created by:{" "}
                <span className="font-medium text-primary">
                  {getUserName(task.createdBy)}
                </span>
              </p> */}

              <p className="text-xs text-gray-500 mt-2">
                Assigned to:{" "}
                {task.assignedTo?.length
                  ? task.assignedTo
                      .map((u) => u.name || getUserName(u))
                      .join(", ")
                  : "Unassigned"}
              </p>

              {/* ---------------- Controls Row ---------------- */}
              <div className="flex gap-3 mt-4">
                <div className="flex items-center gap-1">
                  {/* STATUS */}
                  <p className="text-sm text-gray-500">Status:</p>
                  {user.isAdmin ? (
                    <select
                      value={task.status}
                      onChange={(e) =>
                        updateField(task._id, "status", e.target.value)
                      }
                      className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none
            ${
              task.status === "Todo"
                ? "bg-gray-100 text-gray-600"
                : task.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
                    >
                      <option>Todo</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  ) : (
                    <p
                      className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none
            ${
              task.status === "Todo"
                ? "bg-gray-100 text-gray-600"
                : task.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
                    >
                      {task.status}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* PRIORITY */}
                  <p className="text-sm text-gray-500">Priority: </p>
                  {user.isAdmin ? (
                    <select
                      value={task.priority}
                      onChange={(e) =>
                        updateField(task._id, "priority", e.target.value)
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none
            ${
              task.priority === "Low"
                ? "bg-green-100 text-green-700"
                : task.priority === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  ) : (
                    <p
                      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none
            ${
              task.priority === "Low"
                ? "bg-green-100 text-green-700"
                : task.priority === "Medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
            }`}
                    >
                      {task.status}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-3">
                Due Date:{" "}
                {new Date(task.endDate).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>

              {/* ---------------- Footer ---------------- */}
              <div className="flex justify-between items-center mt-5 text-sm">
                <button
                  onClick={() =>
                    setOpenComments(openComments === task._id ? null : task._id)
                  }
                  className="flex items-center gap-2 text-primary transition cursor-pointer "
                >
                  <FontAwesomeIcon
                    icon={faComment}
                    size="lg"
                    style={{ color: "#63e6be" }}
                  />{" "}
                  {task.comments?.length} comments
                </button>
              </div>

              {/* ---------------- Comments Drawer ---------------- */}
              {openComments === task._id && (
                <div className="mt-4 border-t pt-3 space-y-3">
                  <div className="max-h-32 overflow-y-auto space-y-2">
                    {task.comments.map((c, i) => (
                      <div
                        key={i}
                        className="bg-gray-50 p-3 rounded-lg text-xs"
                      >
                        <div className="flex justify-between items-center text-gray-500 mb-1">
                          <span className="font-semibold">
                            {c.userRef?.name || getUserName(c.userRef)}
                          </span>

                          <span
                            title={dayjs(c.commentedAt).format(
                              "DD MMM YYYY hh:mm A",
                            )}
                          >
                            {dayjs(c.commentedAt).fromNow()}
                          </span>
                        </div>

                        <p className="text-gray-700">{c.comment}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 border rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => addComment(task._id)}
                      className="bg-blue-600 text-white px-3 rounded-lg text-sm hover:bg-blue-700"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}
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
