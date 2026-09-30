import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { initialIncidents } from "../data/incidentsData.js";
import { buildings } from "../data/campusData.js";
import { broadcast } from "../realtime.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer storage for incident photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "incident-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

let incidents = [...initialIncidents];
let incidentCounter = 1005;

// GET /api/incidents - List all incidents with optional filters
router.get("/", (req, res) => {
  const { status, category, severity, buildingId } = req.query;
  let filtered = [...incidents];

  if (status && status !== "all") {
    filtered = filtered.filter(i => i.status.toLowerCase() === status.toLowerCase());
  }
  if (category && category !== "all") {
    filtered = filtered.filter(i => i.category.toLowerCase() === category.toLowerCase());
  }
  if (severity && severity !== "all") {
    filtered = filtered.filter(i => i.severity.toLowerCase() === severity.toLowerCase());
  }
  if (buildingId && buildingId !== "all") {
    filtered = filtered.filter(i => i.buildingId === buildingId);
  }

  // Sort: Critical severity first, then by upvotes (crowdsource urgency), then newest
  filtered.sort((a, b) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    const sevDiff = (severityOrder[b.severity] || 1) - (severityOrder[a.severity] || 1);
    if (sevDiff !== 0) return sevDiff;
    const upDiff = (b.upvotes || 1) - (a.upvotes || 1);
    if (upDiff !== 0) return upDiff;
    return new Date(b.reportedAt) - new Date(a.reportedAt);
  });

  return res.json({
    success: true,
    count: filtered.length,
    incidents: filtered
  });
});

// GET /api/incidents/stats - Operational analytics for Admin Dashboard
router.get("/stats", (req, res) => {
  const total = incidents.length;
  const critical = incidents.filter(i => i.severity === "critical" && i.status !== "Resolved").length;
  const inProgress = incidents.filter(i => i.status === "In Progress").length;
  const reported = incidents.filter(i => i.status === "Reported").length;
  const resolved = incidents.filter(i => i.status === "Resolved").length;

  const categoryCounts = {
    hazard: incidents.filter(i => i.category === "hazard").length,
    maintenance: incidents.filter(i => i.category === "maintenance").length,
    security: incidents.filter(i => i.category === "security").length,
    medical: incidents.filter(i => i.category === "medical").length,
    infrastructure: incidents.filter(i => i.category === "infrastructure").length
  };

  const buildingHotspots = {};
  for (const b of buildings) {
    buildingHotspots[b.name] = incidents.filter(i => i.buildingId === b.id).length;
  }

  return res.json({
    success: true,
    stats: {
      total,
      critical,
      reported,
      inProgress,
      resolved,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      categoryCounts,
      buildingHotspots
    }
  });
});

// GET /api/incidents/:id - Get single incident
router.get("/:id", (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, error: "Incident not found" });
  }
  return res.json({ success: true, incident });
});

// POST /api/incidents - Report a new incident
router.post("/", upload.single("photo"), (req, res) => {
  try {
    const {
      title,
      description,
      category = "maintenance",
      severity = "medium",
      buildingId,
      floor = 0,
      locationName,
      coordinatesX,
      coordinatesY,
      nodeId,
      reportedBy = "Anonymous Student",
      contact = ""
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, error: "Title and description are required" });
    }

    const bldg = buildings.find(b => b.id === buildingId);
    let coords = { x: 495, y: 390 }; // default central quad

    if (coordinatesX && coordinatesY) {
      coords = { x: parseFloat(coordinatesX), y: parseFloat(coordinatesY) };
    } else if (bldg) {
      coords = { x: bldg.x + bldg.width / 2, y: bldg.y + bldg.height / 2 };
    }

    let photoUrl = "/assets/sample_incident_general.svg";
    if (req.file) {
      photoUrl = `/uploads/${req.file.filename}`;
    }

    const newId = `INC-${incidentCounter++}`;
    const newIncident = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      severity: severity.toLowerCase(),
      buildingId: buildingId || "campus_outdoor",
      floor: parseInt(floor) || 0,
      locationName: locationName || (bldg ? `${bldg.name}, Floor ${floor}` : "Campus Quad Walkway"),
      coordinates: coords,
      nodeId: nodeId || null,
      status: "Reported",
      upvotes: 1,
      reportedBy: reportedBy.trim(),
      contact: contact.trim(),
      reportedAt: new Date().toISOString(),
      assignedTo: "Unassigned - Pending Triage",
      photoUrl,
      resolutionNotes: "",
      logs: [
        { time: new Date().toISOString(), action: `Report submitted by ${reportedBy}` }
      ]
    };

    incidents.unshift(newIncident);

    // Real-time broadcast to all connected web clients & admin console
    broadcast("NEW_INCIDENT", newIncident);

    return res.status(201).json({
      success: true,
      message: "Incident successfully reported and dispatched to campus safety.",
      incident: newIncident
    });
  } catch (err) {
    console.error("Error creating incident:", err);
    return res.status(500).json({ success: false, error: "Failed to submit incident" });
  }
});

// POST /api/incidents/sos - Immediate Emergency SOS Panic Trigger
router.post("/sos", (req, res) => {
  try {
    const {
      coordinatesX = 495,
      coordinatesY = 390,
      buildingId = "bldg_delta",
      floor = 0,
      locationName = "Delta Complex Hackathon Arena",
      reportedBy = "Emergency Panic Button",
      details = "Urgent Medical / Security Distress Call Triggered by User"
    } = req.body;

    const newId = `SOS-${Date.now().toString().slice(-4)}`;
    const sosIncident = {
      id: newId,
      title: "🚨 CRITICAL SOS PANIC ALERT",
      description: details,
      category: "medical",
      severity: "critical",
      buildingId,
      floor: parseInt(floor) || 0,
      locationName,
      coordinates: { x: parseFloat(coordinatesX), y: parseFloat(coordinatesY) },
      status: "In Progress",
      reportedBy,
      contact: "CAMPUS EMERGENCY PROTOCOL",
      reportedAt: new Date().toISOString(),
      assignedTo: "FIRST RESPONSE SQUAD & SECURITY CHIEF",
      photoUrl: "/assets/sample_incident_sos.svg",
      resolutionNotes: "",
      logs: [
        { time: new Date().toISOString(), action: "CRITICAL SOS ACTIVATED - Audio alarms triggered across safety stations" }
      ]
    };

    incidents.unshift(sosIncident);

    // High priority emergency broadcast
    broadcast("SOS_ALERT", sosIncident);

    return res.status(201).json({
      success: true,
      message: "Emergency broadcast initiated. Security dispatched.",
      incident: sosIncident
    });
  } catch (err) {
    console.error("Error creating SOS:", err);
    return res.status(500).json({ success: false, error: "Failed to dispatch SOS" });
  }
});

// POST /api/incidents/:id/accelerate - Crowdsourced Issue Escalation ("Impacts Me Too")
router.post("/:id/accelerate", (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, error: "Incident not found" });
  }

  incident.upvotes = (incident.upvotes || 1) + 1;

  let escalated = false;
  const prevSeverity = incident.severity;

  // Auto-escalation thresholds
  if (incident.upvotes >= 8 && incident.severity !== "critical") {
    incident.severity = "critical";
    escalated = true;
  } else if (incident.upvotes >= 4 && (incident.severity === "low" || incident.severity === "medium")) {
    incident.severity = "high";
    escalated = true;
  } else if (incident.upvotes >= 2 && incident.severity === "low") {
    incident.severity = "medium";
    escalated = true;
  }

  const logAction = escalated
    ? `Crowdsource surge: ${incident.upvotes} students reported this issue. Severity auto-escalated from ${prevSeverity.toUpperCase()} to ${incident.severity.toUpperCase()}!`
    : `Issue verified by student ("Impacts Me Too"). Total impacted students: ${incident.upvotes}`;

  incident.logs.unshift({
    time: new Date().toISOString(),
    action: logAction
  });

  // Broadcast update to all client feeds and Command SOC
  broadcast("INCIDENT_UPDATED", incident);

  return res.json({
    success: true,
    message: escalated
      ? `Issue auto-escalated to ${incident.severity.toUpperCase()} due to multiple student reports!`
      : `Report amplified! ${incident.upvotes} students affected.`,
    incident,
    upvotes: incident.upvotes,
    severity: incident.severity,
    escalated
  });
});

// PATCH /api/incidents/:id - Update status / assign staff / add notes
router.patch("/:id", (req, res) => {
  const incident = incidents.find(i => i.id === req.params.id);
  if (!incident) {
    return res.status(404).json({ success: false, error: "Incident not found" });
  }

  const { status, assignedTo, resolutionNotes, severity } = req.body;

  if (status) {
    incident.status = status;
    incident.logs.push({
      time: new Date().toISOString(),
      action: `Status updated to '${status}'`
    });
  }

  if (assignedTo) {
    incident.assignedTo = assignedTo;
    incident.logs.push({
      time: new Date().toISOString(),
      action: `Assigned responder: ${assignedTo}`
    });
  }

  if (resolutionNotes) {
    incident.resolutionNotes = resolutionNotes;
  }

  if (severity) {
    incident.severity = severity.toLowerCase();
  }

  // Broadcast update
  broadcast("INCIDENT_UPDATED", incident);

  return res.json({
    success: true,
    message: "Incident successfully updated.",
    incident
  });
});

export default router;
