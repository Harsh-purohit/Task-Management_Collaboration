import mongoose from "mongoose";
import {
  dbQueryDurationSeconds,
  dbQueryErrorsTotal,
} from "../metrics/index.js";

// Keep metric labels bounded to a fixed operation list.
const normalizeCommandName = (name = "") => {
  const allowed = new Set([
    "find",
    "insert",
    "update",
    "delete",
    "aggregate",
    "count",
    "distinct",
    "findAndModify",
  ]);
  return allowed.has(name) ? name : "other";
};

// Extract collection name from command payload for labeling.
const extractCollection = (event) => {
  const cmd = event.command || {};
  return (
    cmd.find ||
    cmd.insert ||
    cmd.update ||
    cmd.delete ||
    cmd.aggregate ||
    cmd.count ||
    cmd.distinct ||
    cmd.findAndModify ||
    "unknown"
  );
};

async function connectDB(uri) {
  mongoose.set("strictQuery", false);

  // monitorCommands is required for commandStarted/commandSucceeded events.
  await mongoose.connect(uri, { monitorCommands: true });

  // Track start time by requestId to compute per-command duration.
  const timings = new Map();
  const mongoClient = mongoose.connection.getClient();

  mongoClient.on("commandStarted", (event) => {
    const operation = normalizeCommandName(event.commandName);
    if (operation === "other") return;

    timings.set(event.requestId, {
      start: process.hrtime.bigint(),
      operation,
      collection: extractCollection(event),
    });
  });

  mongoClient.on("commandSucceeded", (event) => {
    const ctx = timings.get(event.requestId);
    if (!ctx) return;
    timings.delete(event.requestId);

    dbQueryDurationSeconds.observe(
      {
        operation: ctx.operation,
        collection: ctx.collection,
        status: "success",
      },
      Number(process.hrtime.bigint() - ctx.start) / 1e9,
    );
  });

  mongoClient.on("commandFailed", (event) => {
    const ctx = timings.get(event.requestId);
    if (!ctx) return;
    timings.delete(event.requestId);

    dbQueryDurationSeconds.observe(
      {
        operation: ctx.operation,
        collection: ctx.collection,
        status: "error",
      },
      Number(process.hrtime.bigint() - ctx.start) / 1e9,
    );
    dbQueryErrorsTotal.inc({
      operation: ctx.operation,
      collection: ctx.collection,
      error_type: event.failure?.codeName || "unknown",
    });
  });

  console.log("MongoDB connected.");
}

export default connectDB;
