import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { removeProject, setProjects } from "../features/projectSlice";
import ProjectModal from "../components/Projects/ProjectModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import ActivityTimeline from "../components/ActivityTimeline";
import toast from "react-hot-toast";
import { notify } from "../utils/toast";

const Projects = () => {
  const dispatch = useDispatch();
  const projects = useSelector((state) => state.projects.projects);
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth);
  // console.log("-----", user);

  // console.log("proj: ", projects);

  const [showModal, setShowModal] = useState(false);
  const [activeLogProject, setActiveLogProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const users = useSelector((state) => state.allusers.allusers || []);

  const url = import.meta.env.VITE_BACKEND_URL;

  const getUserName = (id) => {
    // console.log(id);
    let user = users.users.find((u) => u._id === id);

    if (!user) {
      user = users.admin.find((u) => u._id === id);
    }

    console.log("-------", user);
    return user ? user.name : "Unknown";
  };

  const updateField = async (projectId, field, value) => {
    try {
      const { data } = await axios.put(
        `${url}/api/projects/${projectId}`,
        { [field]: value },
        { withCredentials: true },
      );

      dispatch(
        setProjects(projects.map((p) => (p._id === projectId ? data : p))),
      );

      notify.success(`${field} updated`);
    } catch {
      notify.error("Unauthorized Access, Only Admin can change!!");
      notify.error("Update failed");
    }
  };

  const deleteProject = async (id) => {
    try {
      // const token = localStorage.getItem("token");

      // if (!token) {
      //   alert("Please login again");
      //   return;
      // }
      const confirmDelete = window.confirm("Delete this project?");
      if (!confirmDelete) return;

      const response = await axios.delete(`${url}/api/projects/${id}`, {
        withCredentials: true,
      });

      // console.log(response);
      dispatch(removeProject(id));
      notify.success("Project Deleted!!");
    } catch (error) {
      // console.log(error);
      notify.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="py-10 space-y-8 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Projects</h1>

        {user.isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-500 to-green-500 text-white px-4 py-2 rounded-full hover:scale-105 transition-transform cursor-pointer"
          >
            + Create Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="text-gray-500 text-center py-20">
          No projects yet. Create your first project 🚀
        </div>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start
"
        >
          {projects.map((project) => (
            <div
              key={project._id}
              className={`
    bg-white p-6 rounded-xl shadow-sm cursor-pointer
    transition-all duration-300 ease-in-out
    ${
      activeLogProject === project._id
        ? "min-h-[420px] scale-[1.02] shadow-lg"
        : "min-h-[180px]"
    }
  `}
            >
              <div className="flex justify-between">
                <h3
                  className="text-lg font-medium cursor-pointer"
                  onClick={() => navigate(`/dashboard/projects/${project._id}`)}
                >
                  {project.name || project.title}
                </h3>

                <button
                  onClick={() =>
                    setActiveLogProject(
                      activeLogProject === project._id ? null : project._id,
                    )
                  }
                  className="cursor-pointer "
                >
                  <FontAwesomeIcon
                    icon={faClockRotateLeft}
                    size="lg"
                    style={{ color: "#63E6BE" }}
                  />
                </button>
              </div>

              {activeLogProject === project._id && (
                <div className="mt-4 animate-fadeIn">
                  <ActivityTimeline id={project._id} />
                </div>
              )}

              <p className="text-sm text-gray-500 mt-2">
                {project.description || "No description"}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Assigned to:{" "}
                {project?.userRef ? getUserName(project.userRef) : "Unassigned"}
              </p>

              {/* STATUS */}
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-500 mt-2 ">
                  Status:
                </p>
                {user.isAdmin ? (
                  <select
                    value={project.status}
                    onChange={(e) =>
                      updateField(project._id, "status", e.target.value)
                    }
                    className={`px-2 py-1 mt-3 rounded-full text-xs font-medium border cursor-pointer outline-none
            ${
              project.status === "Todo"
                ? "bg-gray-100 text-gray-600"
                : project.status === "In Progress"
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
                    className={`px-2 py-1 w-20 mt-3 rounded-full text-xs font-medium border cursor-pointer outline-none
            ${
              project.status === "Todo"
                ? "bg-gray-100 text-gray-600"
                : project.status === "In Progress"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
            }`}
                  >
                    {project.status}
                  </p>
                )}
              </div>

              {user.isAdmin && (
                <div className="flex gap-4 mt-4 text-sm">
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      // style={{ color: "#0000ff" }}
                      size="lg"
                    />
                  </button>

                  <button
                    onClick={deleteProject.bind(null, project._id)}
                    className="text-red-500 hover:underline cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      // style={{ color: "#ff0000" }}
                      size="lg"
                    />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showModal || selectedProject) && (
        <ProjectModal
          project={selectedProject}
          onClose={() => {
            setShowModal(false);
            setSelectedProject(null);
          }}
        />
      )}
    </div>
  );
};

export default Projects;
