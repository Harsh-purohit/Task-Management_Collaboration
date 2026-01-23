import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addProject, updateProject } from "../../features/projectSlice";
import axios from "axios";
import useAllUsers from "../hooks/Alluser";
import { useEffect } from "react";

const ProjectModal = ({ onClose, project }) => {
  const dispatch = useDispatch();
  const isEdit = !!project;
  const allusers = useSelector((state) => state.allusers.allusers || []);

  // console.log("allusers", allusers);

  const { fetchAllUsers } = useAllUsers();

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Todo");
  const [member, setMember] = useState();

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setStatus(project.status);
    }
  }, [project]);

  const url = import.meta.env.VITE_BACKEND_URL;

  // console.log("members", members);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // const token = localStorage.getItem("token");
      // if (!token) {
      //   alert("Please login again");
      //   return;
      // }

      // console.log("Sending project:", {
      //   name,
      //   description,
      //   status,
      //   member,
      // });

      const payload = {
        name,
        description,
        status,
      };

      if (!isEdit) {
        payload.userRef = member;
      }

      // edit for put otherwise post req
      let response;
      if (isEdit) {
        response = await axios.put(
          `${url}/api/projects/${project._id}`,
          payload,
          {
            withCredentials: true,
          },
        );

        dispatch(updateProject(response.data));
      } else {
        response = await axios.post(url + "/api/projects", payload, {
          withCredentials: true,
        });

        dispatch(addProject(response.data));
      }
      // console.log(response.data);

      onClose();
    } catch (error) {
      console.log("STATUS:", error.response?.status);
      console.log("ERROR:", error.response?.data);
      alert(error.response?.data?.message || "Bad request");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-md p-6 rounded-xl"
      >
        <h2 className="text-xl font-semibold mb-4">
          {isEdit ? "Edit Project" : "Create Project"}
        </h2>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="w-full border rounded-md px-3 py-2 mb-3"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Project description"
          className="w-full border rounded-md px-3 py-2 mb-4"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4"
        >
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={member}
          onChange={(e) => setMember(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mb-4"
        >
          <option value="">Assign Member</option>
          {allusers.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md cursor-pointer hover:scale-105 transition-transform"
          >
            Cancel
          </button>

          <button className="bg-gradient-to-r from-blue-500 to-green-500 text-white cursor-pointer hover:scale-105 transition-transform px-4 py-2 rounded-md">
            {isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectModal;
