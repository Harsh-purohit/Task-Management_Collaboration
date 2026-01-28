import express from "express";
import { adminAuth, userAuth, bothAuth } from "../middleware/checkAuth.js";
import Projects from "../models/Projects.js";
import Tasks from "../models/Tasks.js";
import { logActivity } from "../utils/logActivity.js";
import mongoose from "mongoose";

const router = express.Router();

router.post("/", adminAuth, async (req, res) => {
  try {
    // console.log(req.body);
    const { name, description, status, userRef } = req.body;
    const adminRef = req.userId;

    if (!name || !description || !userRef) {
      return res
        .status(400)
        .json({ message: "Name, description, and userRef are required" });
    }

    const projects = await Projects.create({
      name,
      description,
      status,
      userRef,
      adminRef,
    });
    await projects.save();

    await logActivity({
      userId: req.userId,
      role: req.role,
      action: "created",
      entity: "project",
      entityId: projects._id,
      message: `Created project "${projects.name}"`,
    });

    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", bothAuth, async (req, res) => {
  try {
    if (req.role === "admin") {
      const projects = await Projects.find({});
      return res.status(200).json(projects);
    }

    // projects created by user
    const ownedProjects = await Projects.find({ userRef: req.userId });

    // tasks assigned to user
    const tasks = await Tasks.find({ assignedTo: req.userId });

    // extract project ids
    const projectIds = tasks.map((t) => t.projectRef);

    // projects where user has tasks
    const taskProjects = await Projects.find({
      _id: { $in: projectIds },
    });

    // merge unique
    const allProjects = [
      ...ownedProjects,
      ...taskProjects.filter(
        (tp) => !ownedProjects.some((op) => op._id.equals(tp._id)),
      ),
    ];

    return res.status(200).json(allProjects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // 1️⃣ Fetch old project (for comparison)
    const existingProject = await Projects.findById(id);

    if (!existingProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    const oldData = {
      name: existingProject.name,
      description: existingProject.description,
      status: existingProject.status,
    };

    const { name, description, status } = req.body;
    const projects = await Projects.findByIdAndUpdate(
      id,
      { name, description, status },
      {
        new: true,
        runValidators: true,
      },
    );
    if (!projects) {
      return res.status(404).json({ message: "Project not found" });
    }

    // 3️⃣ Detect changes
    const changes = [];
    const metadata = {};

    ["name", "description", "status"].forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== oldData[field]) {
        changes.push(`${field}: ${oldData[field]} → ${projects[field]}`);

        metadata[field] = {
          from: oldData[field],
          to: projects[field],
        };
      }
    });

    // 4️⃣ Activity log
    if (changes.length) {
      await logActivity({
        actorId: req.userId,
        actorModel: "Admin",
        role: "admin",
        action: "project-updated",
        entity: "project",
        entityId: projects._id,
        message: `Updated project "${projects.name}" (${changes.join(", ")})`,
        metadata,
      });
    }

    res.status(200).json(projects);
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // 1️⃣ Get project info BEFORE delete (for logs)
    const project = await Projects.findById(id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const deletedTasks = await Tasks.deleteMany({ projectRef: id });
    // console.log(tasks);
    await Projects.findByIdAndDelete(id);

    // 4️⃣ Activity log
    await logActivity({
      actorId: req.userId,
      actorModel: "Admin",
      role: "admin",
      action: "project-deleted",
      entity: "project",
      entityId: id,
      message: `Deleted project "${project.name}" (${deletedTasks.deletedCount} tasks removed)`,
      metadata: {
        deletedTasks: deletedTasks.deletedCount,
      },
    });

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
