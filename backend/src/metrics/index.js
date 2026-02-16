import client from "prom-client";

let defaultsStarted = false;

// Prevent duplicate default metrics registration during hot reloads.
const startDefaultMetrics = () => {
  if (defaultsStarted) return;
  client.collectDefaultMetrics({ register: client.register });
  defaultsStarted = true;
};

// API request counters grouped by method/route/status.
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP API requests",
  labelNames: ["method", "route", "status_code"],
});

// API latency histogram used for p50/p95/p99 dashboards.
const httpRequestDurationSeconds = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP API request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

// Current in-flight API requests. (The number of HTTP requests currently being processed at a given moment.)
const httpInFlightRequests = new client.Gauge({
  name: "http_in_flight_requests",
  help: "Current number of in-flight HTTP API requests",
  labelNames: ["method", "route"],
});

// App-level DB query latency from Mongo driver command events.
const dbQueryDurationSeconds = new client.Histogram({
  name: "db_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["operation", "collection", "status"],
  buckets: [0.001, 0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 1, 3, 5],
});

// App-level DB query error counter.
const dbQueryErrorsTotal = new client.Counter({
  name: "db_query_errors_total",
  help: "Total number of database query errors",
  labelNames: ["operation", "collection", "error_type"],
});

// Socket.IO connection lifecycle metrics.
const socketConnectionsTotal = new client.Counter({
  name: "socket_connections_total",
  help: "Total number of Socket.IO client connections",
});

const socketConnectedClients = new client.Gauge({
  name: "socket_connected_clients",
  help: "Current number of connected Socket.IO clients",
});

// Auth business/security counters.
const authLoginsTotal = new client.Counter({
  name: "auth_logins_total",
  help: "Total login attempts",
  labelNames: ["role", "status"],
});

const authRegistersTotal = new client.Counter({
  name: "auth_registers_total",
  help: "Total register attempts",
  labelNames: ["role", "status"],
});

export {
  client,
  startDefaultMetrics,
  httpRequestsTotal,
  httpRequestDurationSeconds,
  httpInFlightRequests,
  dbQueryDurationSeconds,
  dbQueryErrorsTotal,
  socketConnectionsTotal,
  socketConnectedClients,
  authLoginsTotal,
  authRegistersTotal,
};
