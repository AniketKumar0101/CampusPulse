import express from "express";
import http from "http";
import cors from "cors";
import path from "path";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "url";

import campusRouter from "./routes/campus.js";
import navigationRouter from "./routes/navigation.js";
import incidentsRouter from "./routes/incidents.js";
import broadcastRouter from "./routes/broadcast.js";
import { registerClient } from "./realtime.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend and uploads
app.use(express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API routes
app.use("/api/campus", campusRouter);
app.use("/api/navigation", navigationRouter);
app.use("/api/incidents", incidentsRouter);
app.use("/api/broadcast", broadcastRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    app: "CampusPulse Intelligent Navigation & Incident System",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket Server on same HTTP port
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`[WS] Client connected from ${ip}`);
  registerClient(ws);
});

// Start Server
server.listen(PORT, () => {
  console.log("============================================================");
  console.log("   CAMPUSPULSE: INTELLIGENT CAMPUS NAVIGATION & INCIDENTS   ");
  console.log("============================================================");
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
  console.log(`📡 WebSocket server live at: ws://localhost:${PORT}/ws`);
  console.log(`🗺️ Serving UI from: ${path.join(__dirname, "../public")}`);
  console.log("============================================================");
});
