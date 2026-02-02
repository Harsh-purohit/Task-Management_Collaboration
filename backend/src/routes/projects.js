import express from "express";
import { adminAuth, userAuth, bothAuth } from "../middleware/checkAuth.js";
import {
  createProject,
  deleteProject,
  getProject,
  filterProject,
  updateProject,
} from "../controllers/projectController.js";

const router = express.Router();

router.post("/", adminAuth, createProject);
router.get("/", bothAuth, getProject);
router.get("/filter", bothAuth, filterProject);
router.put("/:id", adminAuth, updateProject);
router.delete("/:id", adminAuth, deleteProject);

export default router;
