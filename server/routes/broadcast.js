import express from "express";
import { broadcast } from "../realtime.js";

const router = express.Router();

let activeBroadcast = null;

// GET current broadcast
router.get("/", (req, res) => {
  return res.json({ success: true, broadcast: activeBroadcast });
});

// POST /api/broadcast - Admin sends campus-wide alert
router.post("/", (req, res) => {
  const { title, message, level = "warning", durationSeconds = 30 } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Broadcast message is required" });
  }

  activeBroadcast = {
    id: `BC-${Date.now()}`,
    title: title || "CAMPUS ADVISORY",
    message,
    level, // info, warning, emergency
    timestamp: new Date().toISOString(),
    expiresAt: new Date(Date.now() + durationSeconds * 1000).toISOString()
  };

  broadcast("CAMPUS_BROADCAST", activeBroadcast);

  return res.json({
    success: true,
    message: "Broadcast transmitted campus-wide.",
    broadcast: activeBroadcast
  });
});

// DELETE /api/broadcast - Dismiss active broadcast
router.delete("/", (req, res) => {
  activeBroadcast = null;
  broadcast("CLEAR_BROADCAST", {});
  return res.json({ success: true, message: "Broadcast cleared." });
});

export default router;
