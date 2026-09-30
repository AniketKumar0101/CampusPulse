import express from "express";
import { campusInfo, buildings, indoorFloorPlans } from "../data/campusData.js";
import { campusEvents } from "../data/eventsData.js";

const router = express.Router();

router.get("/info", (req, res) => {
  return res.json({ success: true, campus: campusInfo });
});

router.get("/buildings", (req, res) => {
  return res.json({ success: true, count: buildings.length, buildings });
});

router.get("/buildings/:id", (req, res) => {
  const building = buildings.find(b => b.id === req.params.id);
  if (!building) {
    return res.status(404).json({ success: false, error: "Building not found" });
  }

  const floorPlans = indoorFloorPlans[building.id] || null;
  return res.json({ success: true, building, floorPlans });
});

router.get("/buildings/:id/floor/:floor", (req, res) => {
  const building = buildings.find(b => b.id === req.params.id);
  if (!building) {
    return res.status(404).json({ success: false, error: "Building not found" });
  }

  const buildingPlan = indoorFloorPlans[building.id];
  if (!buildingPlan || !buildingPlan.floors[req.params.floor]) {
    return res.status(404).json({ success: false, error: "Floor plan not found for this level" });
  }

  return res.json({
    success: true,
    building: { id: building.id, name: building.name },
    floorPlan: buildingPlan.floors[req.params.floor]
  });
});

router.get("/events", (req, res) => {
  return res.json({ success: true, count: campusEvents.length, events: campusEvents });
});

export default router;
