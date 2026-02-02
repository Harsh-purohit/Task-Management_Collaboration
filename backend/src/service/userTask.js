import Projects from "../models/Projects.js";
import Tasks from "../models/Tasks.js";
import mongoose from "mongoose";

export const fetchUserTasks = async (req) => {
  const { users } = req.query;
  const { id } = req.params;

  const projectId = new mongoose.Types.ObjectId(id);

  let filter = {
    projectRef: projectId,
  };

  // =========================
  // USER LOGIC
  // =========================
  if (req.role === "user") {
    // first try: tasks assigned to user
    filter.assignedTo = new mongoose.Types.ObjectId(req.userId);

    let tasks = await Tasks.find(filter).lean();

    // 👇 fallback: if empty, show all project tasks
    if (tasks.length === 0) {
      delete filter.assignedTo;
      tasks = await Tasks.find(filter).lean();
    }

    return tasks;
  }

  // =========================
  // ADMIN LOGIC (unchanged)
  // =========================
  if (users) {
    const userArray = Array.isArray(users) ? users : [users];

    filter.assignedTo = {
      $in: userArray.map((uid) => new mongoose.Types.ObjectId(uid)),
    };
  }

  const tasks = await Tasks.find(filter).lean();

  return tasks;
};
