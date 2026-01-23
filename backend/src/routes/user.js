import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import Admin from "../models/Admin.js";

import { bothAuth } from "../middleware/checkAuth.js";
import validate from "../middleware/validate.js";
import { updateProfileSchema } from "../validations/user.val.js";

const router = express.Router();

router.patch(
  "/updateprofile/:id",
  bothAuth,
  validate(updateProfileSchema),
  async (req, res) => {
    try {
      const userId = req.params.id;

      /* ---------------- VALIDATIONS ---------------- */

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      if (req.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      const { name, email, oldPassword, newPassword } = req.body;

      /* ---------------- FIND ACCOUNT ---------------- */
      // Find in both collections
      let account = await User.findOne({ _id: userId, isDeleted: false });
      let Model = User;

      if (!account) {
        account = await Admin.findById(userId);
        Model = Admin;
      }

      if (!account) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      /* ---------------- BUILD UPDATE OBJECT ---------------- */

      const update = {};

      if (name !== undefined) update.name = name;
      if (email !== undefined) update.email = email;

      /* ---------------- PASSWORD UPDATE ---------------- */

      if (oldPassword || newPassword) {
        if (!oldPassword || !newPassword) {
          return res.status(400).json({
            message: "Both oldPassword and newPassword are required",
          });
        }

        const isMatch = await bcrypt.compare(oldPassword, account.password);

        if (!isMatch) {
          return res.status(401).json({ message: "Old password is incorrect" });
        }

        update.password = await bcrypt.hash(newPassword, 10);
      }

      if (Object.keys(update).length === 0) {
        return res.status(400).json({ message: "No fields to update" });
      }

      /* ---------------- UPDATE DB ---------------- */

      const updatedAccount = await Model.findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true, runValidators: true },
      ).select("-password");

      /* ---------------- RESPONSE ---------------- */

      res.status(200).json({
        message: "Profile updated successfully",
        user: updatedAccount,
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: "Email already exists" });
      }

      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
