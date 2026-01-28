import express from "express";
import { adminAuth, bothAuth } from "../middleware/checkAuth.js";
import User from "../models/User.js";
import mongoose from "mongoose";
import Admin from "../models/Admin.js";

const router = express.Router();

router.get("/allusers", bothAuth, async (req, res) => {
  try {
    const resultUsers = await User.find({ isDeleted: false });
    const resultAdmin = await Admin.find();

    // console.log("Fetched Users:", resultUsers);

    res.status(200).json({ users: resultUsers, admin: resultAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/deleteuser/:id", adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
