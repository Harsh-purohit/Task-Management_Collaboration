import express, { json } from "express";
import { bothAuth } from "../middleware/checkAuth.js";
import ActivityLog from "../models/ActivityLog.js";
import client from "../config/redisClient.js";

const router = express.Router();

router.get("/:entityId", bothAuth, async (req, res) => {
  try {
    const { entityId } = req.params;
    // console.log(entityId);

    const cacheKey = `activity:${entityId}`;

    const cachedData = await client.get(cacheKey);
    // console.log(cachedData);
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    const logs = await ActivityLog.find({
      entityId: entityId,
    })
      .populate("actor", "name role")
      .sort({ createdAt: -1 });

    await client.set(cacheKey, JSON.stringify(logs), { EX: 120 });
    // console.log("log: ", logs);
    res.json(logs);
  } catch (error) {
    res.json(error);
  }
});

export default router;
