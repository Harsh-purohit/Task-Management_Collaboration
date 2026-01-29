import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  projects: JSON.parse(localStorage.getItem("projects")) || [],
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    setProjects: (state, action) => {
      console.log(action.payload);
      state.projects = action.payload;

      localStorage.setItem("projects", JSON.stringify(action.payload));
    },

    addProject: {
      reducer: (state, action) => {
        state.projects.push(action.payload);
        localStorage.setItem("projects", JSON.stringify(state.projects));
      },
      prepare: (project) => ({
        payload: {
          id: nanoid(),
          createdAt: new Date().toISOString(),
          ...project,
        },
      }),
    },

    updateProject: (state, action) => {
      const { id, name, description, status } = action.payload;

      const project = state.projects.find((p) => p.id === id);

      if (project) {
        project.name = name;
        project.description = description;
        project.status = status;
      }
      localStorage.setItem("projects", JSON.stringify(state.projects));
    },

    removeProject: (state, action) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
      // console.log("deleted project", state.projects);
      localStorage.setItem("projects", JSON.stringify(state.projects));
    },
  },
});

export const { setProjects, addProject, updateProject, removeProject } =
  projectsSlice.actions;

export default projectsSlice.reducer;
