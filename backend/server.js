import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fs from "fs";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";
import allusersRoutes from "./src/routes/admin.js";
import projectRoutes from "./src/routes/projects.js";
import taskRoutes from "./src/routes/tasks.js";
import userRoutes from "./src/routes/user.js";
import cookieParser from "cookie-parser";
import activityLogs from "./src/routes/activity.js";
import { createServer } from "http";
import { initSocket } from "./src/socket.js";
import {
  client,
  startDefaultMetrics,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpInFlightRequests,
} from "./src/metrics/index.js";
dotenv.config();

const app = express();
const server = createServer(app);
initSocket(server);

// Register default Node.js/process metrics once per process.
startDefaultMetrics();

// Normalize dynamic URL segments to avoid high-cardinality metric labels.
const normalizeRoute = (path) =>
  path
    .replace(/[0-9a-fA-F]{24}/g, ":id")
    .replace(/\/\d+/g, "/:id");

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Global API metrics middleware for all /api/* routes.
app.use((req, res, next) => {
  if (!req.path.startsWith("/api")) return next();

  const start = process.hrtime.bigint();
  const routeForGauge = normalizeRoute(req.path);
  const gaugeLabels = {
    method: req.method,
    route: routeForGauge,
  };
  let settled = false;
  httpInFlightRequests.inc(gaugeLabels);

  // Guard ensures gauge decrement runs only once across finish/close events.
  const stopInFlight = () => {
    if (settled) return;
    settled = true;
    httpInFlightRequests.dec(gaugeLabels);
  };

  // Record total requests and latency when response is completed.
  res.on("finish", () => {
    const routePath =
      req.baseUrl && req.route?.path
        ? `${req.baseUrl}${req.route.path}`
        : req.path;

    const labels = {
      method: req.method,
      route: normalizeRoute(routePath),
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(
      labels,
      Number(process.hrtime.bigint() - start) / 1e9,
    );
    stopInFlight();
  });
  res.on("close", stopInFlight);

  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", allusersRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/user", userRoutes);
app.use("/api/activity", activityLogs);

// Prometheus scrape endpoint.
app.get("/metrics", async (req, res) => {
  res.setHeader("Content-Type", client.register.contentType);

  const metrics = await client.register.metrics();

  res.send(metrics);
});

const PORT = process.env.PORT || 8000;
// Use Docker-specific Mongo URI when running inside a container.
const isDocker = fs.existsSync("/.dockerenv");
const mongoUri =
  (isDocker && process.env.MONGO_URI_DOCKER) || process.env.MONGO_URI;

connectDB(mongoUri)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to connect to the database", error);
  });
