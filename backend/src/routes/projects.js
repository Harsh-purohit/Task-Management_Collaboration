import express from "express";
import { adminAuth, userAuth, bothAuth } from "../middleware/checkAuth.js";
import Projects from "../models/Projects.js";
import Tasks from "../models/Tasks.js";

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
    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", bothAuth, async (req, res) => {
  try {
    // console.log("User ID:", req.userId);
    const projects = await Projects.find({});
    // console.log("Fetched Projects:", projects);
    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;
    const projects = await Projects.findByIdAndUpdate(
      id,
      { name, description, status },
      {
        new: true,
      },
    );
    if (!projects) {
      return res.status(404).json({ message: "Project not found" });
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
    const tasks = await Tasks.deleteMany({ projectRef: id });
    // console.log(tasks);
    const projects = await Projects.findByIdAndDelete(id);
    // console.log(projects);
    if (!projects) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);

    res.status(500).json({ message: "Server error" });
  }
});

export default router;
