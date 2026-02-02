import Projects from "../models/Projects.js";
import Tasks from "../models/Tasks.js";
import { fetchUserProjects } from "../service/userProject.js";
import { getIO } from "../socket.js";
import { logActivity } from "../utils/logActivity.js";
import mongoose from "mongoose";
// import client from "../config/redisClient.js";

const createProject = async (req, res) => {
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

    await logActivity({
      actorId: req.userId,
      actorModel: req.role,
      action: "created",
      entity: "project",
      entityId: projects._id,
      message: `Created project "${projects.name}"`,
    });

    // console.log(projects);
    const io = getIO();
    io.emit("projectCreated", { projects });

    // await client.RPUSH(`projects:`, JSON.stringify(projects));

    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getProject = async (req, res) => {
  try {
    const projects = await fetchUserProjects(req);

    // await client.set(cacheKey, JSON.stringify(allProjects), { EX: 180 });

    return res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const filterProject = async (req, res) => {
  try {
    const { status } = req.query;
    const project = await fetchUserProjects(req);

    let filter = project;

    if (status && status !== "All") {
      filter = project.filter((p) => p.status === status);
    }

    res.status(200).json(filter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    // Fetch old project (for comparison)
    const existingProject = await Projects.findById(id)
      .select("name description status")
      .lean();

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
        lean: true,
      },
    );
    if (!projects) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Detect changes
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

    const io = getIO();
    io.emit("projectUpdated", { projects });

    res.status(200).json(projects);
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Server error" });
  }
};

const deleteProject = async (req, res) => {
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

    // await client.del(`projects:`, JSON.stringify(projects));

    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
export {
  createProject,
  getProject,
  filterProject,
  updateProject,
  deleteProject,
};
