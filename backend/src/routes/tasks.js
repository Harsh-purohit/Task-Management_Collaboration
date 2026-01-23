import express from "express";
import mongoose from "mongoose";
import { adminAuth, bothAuth } from "../middleware/checkAuth.js";
import Tasks from "../models/Tasks.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/", adminAuth, async (req, res) => {
  try {
    const { users, projectRef, title, description, endDate, priority } =
      req.body;

    if (
      !Array.isArray(users) ||
      users.length === 0 ||
      !projectRef ||
      !title ||
      !description ||
      !endDate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newTask = await Tasks.create({
      users,
      projectRef,
      adminRef: req.userId,
      title,
      description,
      endDate: new Date(endDate),
      priority,
    });

    // Fetch user emails
    const usersList = await User.find({
      _id: { $in: users },
      isDeleted: false,
    }).select("name email");

    // Send email (non-blocking)
    usersList.forEach((user) => {
      sendEmail({
        to: user.email,
        subject: "New Task Assigned",
        html: `
          <div style="font-family: Arial">
            <h2>Hello ${user.name}</h2>
            <p>You have been assigned a new task:</p>
            <h3>${title}</h3>
            <p>${description}</p>
            <p><strong>Priority:</strong> ${priority}</p>
          </div>
        `,
      });
    });

    res.status(201).json({
      message: "Task created successfully",
      task: newTask,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", bothAuth, async (req, res) => {
  try {
    const { id, users, status, priority } = req.query;
    const filter = {};

    // console.log("QUERY PARAMS 👉", req.query);

    if (id) {
      filter.projectRef = new mongoose.Types.ObjectId(id);
    }

    if (users) {
      const userArray = Array.isArray(users) ? users : [users];
      filter.users = {
        $in: userArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Tasks.find(filter);
    // console.log("FILTER USED 👉", filter);
    // console.log("TASKS 👉", tasks);
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:id", bothAuth, async (req, res) => {
  try {
    const { users, status, priority } = req.query;
    const { id } = req.params;
    const filter = {};

    // console.log("QUERY PARAMS 👉", req.query);

    if (id) {
      filter.projectRef = new mongoose.Types.ObjectId(id);
    }

    if (users) {
      const userArray = Array.isArray(users) ? users : [users];
      filter.users = {
        $in: userArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    const tasks = await Tasks.find(filter);
    // console.log("FILTER USED 👉", filter);
    // console.log("TASKS 👉", tasks);
    res.status(200).json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // 1️⃣ Fetch existing task
    const existingTask = await Tasks.findById(id).populate(
      "users",
      "name email",
    );

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    const oldStatus = existingTask.status;
    const oldPriority = existingTask.priority;

    // 2️⃣ Build update object
    const update = {};
    const allowedFields = [
      "users",
      "title",
      "description",
      "status",
      "priority",
      "comments",
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }

    if (req.body.endDate) {
      update.endDate = new Date(req.body.endDate);
    }

    update.updateDate = Date.now();

    // 3️⃣ Update task
    const updatedTask = await Tasks.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    );

    // 4️⃣ Detect changes
    const statusChanged = req.body.status && req.body.status !== oldStatus;

    const priorityChanged =
      req.body.priority && req.body.priority !== oldPriority;

    // 5️⃣ Send email ONLY if status or priority changed
    if (statusChanged || priorityChanged) {
      existingTask.users.forEach((user) => {
        sendEmail({
          to: user.email,
          subject: "Task Updated",
          html: `
            <div style="font-family: Arial">
              <h2>Hello ${user.name}</h2>
              <p>The task <b>${existingTask.title}</b> was updated.</p>
              ${
                statusChanged
                  ? `<p>Status: <b>${oldStatus}</b> → <b>${req.body.status}</b></p>`
                  : ""
              }
              ${
                priorityChanged
                  ? `<p>Priority: <b>${oldPriority}</b> → <b>${req.body.priority}</b></p>`
                  : ""
              }
            </div>
          `,
        });
      });
    }

    res.status(200).json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    const task = await Tasks.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
