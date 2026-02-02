import express from "express";
import mongoose from "mongoose";
import { adminAuth, bothAuth } from "../middleware/checkAuth.js";
import Tasks from "../models/Tasks.js";
import {
  createTask,
  deleteTask,
  filterTask,
  getTask,
  postComment,
  updateTask,
} from "../controllers/taskController.js";
import { fetchUserTasks } from "../service/userTask.js";

const router = express.Router();

router.post("/", adminAuth, createTask);
router.post("/:id/comment", bothAuth, postComment);

// all tasks
router.get("/", bothAuth, getTask);
router.put("/:id", adminAuth, updateTask);
router.delete("/:id", adminAuth, deleteTask);

router.get("/:id/filter", bothAuth, filterTask);

// tasks specific to project
router.get("/:id", bothAuth, async (req, res) => {
  try {
    const tasks = await fetchUserTasks(req);

    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id/comment", bothAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const comments = await Tasks.findById(id)
      .select("comments")
      .sort({ commentedAt: -1 })
      .lean();
    // if (!comments) {
    //   return res.status(404).json({ message: "Task not found" });
    // }

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

export default router;
