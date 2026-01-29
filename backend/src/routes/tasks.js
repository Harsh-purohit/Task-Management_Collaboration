import express from "express";
import mongoose from "mongoose";
import { adminAuth, bothAuth } from "../middleware/checkAuth.js";
import Tasks from "../models/Tasks.js";
import sendEmail from "../utils/sendEmail.js";
import User from "../models/User.js";
import { logActivity } from "../utils/logActivity.js";
import client from "../config/redisClient.js";

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
      assignedTo: users,
      projectRef,
      createdBy: req.userId,
      title,
      description,
      endDate: new Date(endDate),
      priority,
    });

    await logActivity({
      userId: req.userId,
      role: req.role,
      action: "created",
      entity: "task",
      entityId: newTask._id,
      message: `Created task "${newTask.title}"`,
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

    const cacheKey = `tasks:${req.userId}`;

    const cachedData = await client.get(cacheKey);
    // console.log(cachedData);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // console.log("QUERY PARAMS 👉", req.query);

    if (id) {
      filter.projectRef = new mongoose.Types.ObjectId(id);
    }

    if (users) {
      const userArray = Array.isArray(users) ? users : [users];
      filter.assignedTo = {
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

    await client.set(cacheKey, JSON.stringify(tasks), { EX: 180 });
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

    const cacheKey = `${req.userId}_tasks: ${id}`;

    const cachedData = await client.get(cacheKey);
    // console.log(cachedData);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const filter = {
      projectRef: new mongoose.Types.ObjectId(id),
    };

    // 👇 user restriction (strongest rule)
    if (req.role === "user") {
      filter.assignedTo = new mongoose.Types.ObjectId(req.userId);
    }

    // 👇 admin custom filter
    else if (users) {
      const userArray = Array.isArray(users) ? users : [users];

      filter.assignedTo = {
        $in: userArray.map((uid) => new mongoose.Types.ObjectId(uid)),
      };
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const tasks = await Tasks.find(filter);

    // console.log("FILTER USED 👉", filter);
    await client.set(cacheKey, JSON.stringify(tasks), { EX: 180 });

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
      "assignedTo",
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
      "assignedTo",
      "title",
      "description",
      "status",
      "priority",
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

    // console.log(updatedTask);

    // 4️⃣ Detect changes
    const statusChanged = req.body.status && req.body.status !== oldStatus;

    const priorityChanged =
      req.body.priority && req.body.priority !== oldPriority;

    // 5️⃣ 🔥 Activity Logs
    if (statusChanged || priorityChanged) {
      let changes = [];
      let metadata = {};

      if (statusChanged) {
        changes.push(`Status: ${oldStatus} → ${updatedTask.status}`);
        metadata.status = {
          from: oldStatus,
          to: updatedTask.status,
        };
      }

      if (priorityChanged) {
        changes.push(`Priority: ${oldPriority} → ${updatedTask.priority}`);
        metadata.priority = {
          from: oldPriority,
          to: updatedTask.priority,
        };
      }

      await logActivity({
        actorId: req.userId, // admin id
        actorModel: "Admin", // 🔥 important
        role: "admin",
        action: "task-updated",
        entity: "task",
        entityId: updatedTask._id,
        message: `Updated task "${updatedTask.title}" (${changes.join(", ")})`,
        metadata,
      });
    }

    // 6️⃣ Send email ONLY if status or priority changed
    if (statusChanged || priorityChanged) {
      existingTask.assignedTo.forEach((user) => {
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

router.post("/:id/comment", bothAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const task = await Tasks.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🔥 detect who is logged in (from bothAuth)
    const commenterModel = req.role === "admin" ? "Admin" : "User";

    task.comments.push({
      userRef: req.userId,
      comment,
    });

    await task.save();

    // await task.populate("comments.commenter");
    // repopulate before sending
    const populated = await Tasks.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("comments.userRef", "name email");
    // console.log(task);

    res.status(201).json({
      message: "Comment added successfully",
      task: populated,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Fetch task BEFORE delete (important for logs)
    const task = await Tasks.findById(id).populate("projectRef", "name");
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Delete
    await Tasks.findByIdAndDelete(id);

    // Activity Log
    await logActivity({
      actorId: req.userId,
      actorModel: "Admin",
      role: "admin",
      action: "task-deleted",
      entity: "task",
      entityId: id,
      message: `Deleted task "${task.title}"${
        task.projectRef ? ` from project "${task.projectRef.name}"` : ""
      }`,
      metadata: {
        title: task.title,
        project: task.projectRef?._id,
      },
    });

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
