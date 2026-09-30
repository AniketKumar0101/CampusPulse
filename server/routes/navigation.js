import express from "express";
import { navigationNodes, navigationEdges, campusPOIs, buildings } from "../data/campusData.js";
import { initialIncidents } from "../data/incidentsData.js";

const router = express.Router();

// Helper to build adjacency list
function buildGraph({ accessibleOnly = false, blockedNodes = new Set(), hazardPenalty = false }) {
  const adj = new Map();

  for (const node of navigationNodes) {
    adj.set(node.id, []);
  }

  for (const edge of navigationEdges) {
    const nodeA = navigationNodes.find(n => n.id === edge.from);
    const nodeB = navigationNodes.find(n => n.id === edge.to);

    if (!nodeA || !nodeB) continue;

    // Accessibility filter: skip stairs or non-accessible edges if requested
    if (accessibleOnly) {
      if (edge.accessible === false || nodeA.accessible === false || nodeB.accessible === false) {
        continue;
      }
    }

    let weight = edge.distance || 10;

    // Check if either end has a blocked hazard
    if (blockedNodes.has(edge.from) || blockedNodes.has(edge.to)) {
      if (hazardPenalty) {
        weight += 2000; // Heavily penalize but keep graph traversable if only route
      } else {
        continue; // Completely avoid
      }
    }

    adj.get(edge.from).push({ to: edge.to, weight, edgeInfo: edge, targetNode: nodeB });
    adj.get(edge.to).push({ to: edge.from, weight, edgeInfo: edge, targetNode: nodeA });
  }

  return adj;
}

// Dijkstra Algorithm
function dijkstra(startId, targetIds, { accessibleOnly = false, activeIncidents = [], avoidHazards = false }) {
  const targets = new Set(Array.isArray(targetIds) ? targetIds : [targetIds]);
  
  // Find blocked nodes based on active hazards
  const blockedNodes = new Set();
  const avoidedIncidents = [];
  
  if (avoidHazards) {
    for (const inc of activeIncidents) {
      if (inc.status !== "Resolved" && (inc.severity === "critical" || inc.severity === "high")) {
        if (inc.nodeId) {
          blockedNodes.add(inc.nodeId);
          avoidedIncidents.push(inc);
        }
      }
    }
  }

  // First try strict avoidance
  let adj = buildGraph({ accessibleOnly, blockedNodes, hazardPenalty: false });
  let result = executeDijkstra(startId, targets, adj);

  // If no path found and we had blocked nodes, try soft penalty fallback so user isn't stranded
  if (!result && blockedNodes.size > 0) {
    adj = buildGraph({ accessibleOnly, blockedNodes, hazardPenalty: true });
    result = executeDijkstra(startId, targets, adj);
    if (result) {
      result.hadToTraverseHazard = true;
    }
  }

  if (result) {
    result.avoidedIncidents = avoidedIncidents;
  }

  return result;
}

function executeDijkstra(startId, targets, adj) {
  const distances = new Map();
  const previous = new Map();
  const visited = new Set();
  const queue = [{ id: startId, dist: 0 }];

  for (const node of navigationNodes) {
    distances.set(node.id, Infinity);
  }
  distances.set(startId, 0);

  while (queue.length > 0) {
    queue.sort((a, b) => a.dist - b.dist);
    const { id: current, dist } = queue.shift();

    if (visited.has(current)) continue;
    visited.add(current);

    if (targets.has(current)) {
      // Reconstruct path
      const path = [];
      let curr = current;
      while (curr) {
        path.unshift(curr);
        curr = previous.get(curr);
      }
      return { path, distance: dist, destinationId: current };
    }

    const neighbors = adj.get(current) || [];
    for (const neighbor of neighbors) {
      if (visited.has(neighbor.to)) continue;

      const alt = dist + neighbor.weight;
      if (alt < distances.get(neighbor.to)) {
        distances.set(neighbor.to, alt);
        previous.set(neighbor.to, current);
        queue.push({ id: neighbor.to, dist: alt });
      }
    }
  }

  return null;
}

// Generate human-friendly step-by-step turn guidance
function generateTurnByTurn(pathNodeIds, isEvacuation = false) {
  if (!pathNodeIds || pathNodeIds.length === 0) return [];
  
  const steps = [];
  const nodes = pathNodeIds.map(id => navigationNodes.find(n => n.id === id)).filter(Boolean);

  if (isEvacuation) {
    steps.push({
      icon: "alert-triangle",
      type: "emergency",
      text: "EMERGENCY EVACUATION ROUTE ACTIVE: Proceed quickly and calmly to the highlighted exit.",
      distance: 0
    });
  }

  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    const next = nodes[i + 1];

    if (!next) {
      steps.push({
        icon: isEvacuation ? "log-out" : "map-pin",
        type: "destination",
        text: isEvacuation ? `You have reached safety: ${curr.label}` : `Arrived at your destination: ${curr.label}`,
        distance: 0,
        floor: curr.floor ?? 0
      });
      break;
    }

    // Edge connecting curr to next
    const edge = navigationEdges.find(
      e => (e.from === curr.id && e.to === next.id) || (e.from === next.id && e.to === curr.id)
    );
    const dist = edge ? edge.distance : 15;

    // Check vertical transition (Lift or Stairs)
    if (edge?.isVertical) {
      if (edge.lift) {
        steps.push({
          icon: "arrow-up-circle",
          type: "lift",
          text: `Take Elevator from Floor ${curr.floor ?? 0} to Floor ${next.floor ?? 0}`,
          distance: dist,
          floor: next.floor ?? 0
        });
      } else {
        steps.push({
          icon: "footprints",
          type: "stairs",
          text: `Take Staircase from Floor ${curr.floor ?? 0} to Floor ${next.floor ?? 0}`,
          distance: dist,
          floor: next.floor ?? 0
        });
      }
      continue;
    }

    // Entering a building
    if (curr.type === "outdoor" && next.buildingId) {
      const bldg = buildings.find(b => b.id === next.buildingId);
      steps.push({
        icon: "door-open",
        type: "enter_building",
        text: `Enter ${bldg ? bldg.name : "Building"} via ${next.label}`,
        distance: dist,
        floor: next.floor ?? 0
      });
      continue;
    }

    // Exiting to outdoor
    if (curr.buildingId && next.type === "outdoor") {
      steps.push({
        icon: "external-link",
        type: "exit_building",
        text: `Exit building onto ${next.label}`,
        distance: dist,
        floor: 0
      });
      continue;
    }

    // Standard navigation
    steps.push({
      icon: "navigation",
      type: "walk",
      text: `Continue along ${next.label}`,
      distance: dist,
      floor: curr.floor ?? 0
    });
  }

  return steps;
}

// Helper to resolve any ID (nodeId, poiId, buildingId, roomId) to a valid navigation graph nodeId
function resolveToNodeId(id) {
  if (!id) return null;
  const strId = String(id).trim();

  // 1. Exact match in navigationNodes
  if (navigationNodes.some(n => n.id === strId)) return strId;

  // 2. Match in campusPOIs
  const poi = campusPOIs.find(p => p.id === strId || p.nodeId === strId || p.name.toLowerCase().includes(strId.toLowerCase()));
  if (poi && poi.nodeId && navigationNodes.some(n => n.id === poi.nodeId)) return poi.nodeId;

  // 3. Match in buildings
  const bldg = buildings.find(b => b.id === strId || b.code.toLowerCase() === strId.toLowerCase() || b.name.toLowerCase().includes(strId.toLowerCase()));
  if (bldg && bldg.entrances && bldg.entrances.length > 0) {
    const entNode = bldg.entrances[0].id;
    if (navigationNodes.some(n => n.id === entNode)) return entNode;
  }

  // 4. Match room prefix (e.g. alpha_g_*, alpha_1_*, alpha_2_*, beta_*, delta_*, etc.)
  if (strId.startsWith("alpha_g") || strId.includes("alpha_g")) return "node_alpha_f0_corridor";
  if (strId.startsWith("alpha_1") || strId.includes("alpha_1")) return "node_alpha_f1_corridor";
  if (strId.startsWith("alpha_2") || strId.includes("alpha_2")) return "node_alpha_f2_corridor";
  if (strId.startsWith("beta_g") || strId.includes("beta_g")) return "node_beta_f0_corridor";
  if (strId.startsWith("beta_1") || strId.includes("beta_1")) return "node_beta_f1_corridor";
  if (strId.startsWith("beta_2") || strId.includes("beta_2")) return "node_beta_f2_corridor";
  if (strId.startsWith("delta_1") || strId.includes("delta_1")) return "node_delta_f1_corridor";
  if (strId.startsWith("delta_g") || strId.includes("delta") || strId.includes("hack")) return "node_delta_hack_arena";
  if (strId.startsWith("gamma_1") || strId.includes("gamma_1")) return "node_gamma_f1_corridor";
  if (strId.startsWith("gamma_g") || strId.includes("gamma") || strId.includes("lib")) return "node_gamma_f0_corridor";
  if (strId.includes("food") || strId.includes("cafe") || strId.includes("dining")) return "node_food_ent_e";
  if (strId.includes("health") || strId.includes("clinic") || strId.includes("triage")) return "node_health_ent_w";
  if (strId.includes("sport") || strId.includes("gym") || strId.includes("court")) return "node_sports_ent_s";
  if (strId.includes("hostel") || strId.includes("dorm")) return "node_hostel_ent_w";
  if (strId.includes("gate")) return "node_gate";

  return null;
}

// Route Calculation API
router.post("/route", (req, res) => {
  try {
    const {
      startId = "node_gate",
      destinationId,
      accessibleOnly = false,
      avoidHazards = true,
      isEvacuation = false
    } = req.body;

    const resolvedStart = resolveToNodeId(startId) || "node_gate";
    let targetIds = [];

    if (isEvacuation) {
      // Find all exit nodes
      const exitNodes = navigationNodes.filter(n => n.isExit || n.id === "node_gate");
      targetIds = exitNodes.map(n => n.id);
    } else {
      const resolvedDest = resolveToNodeId(destinationId) || "node_delta_hack_arena";
      targetIds = [resolvedDest];
    }

    // Run Dijkstra
    const routeResult = dijkstra(resolvedStart, targetIds, {
      accessibleOnly,
      activeIncidents: initialIncidents,
      avoidHazards
    });

    if (!routeResult) {
      return res.status(404).json({
        success: false,
        error: "No accessible route found between the selected locations.",
        suggestion: accessibleOnly ? "Try disabling Wheelchair Accessibility if stairs are required." : null
      });
    }

    const { path, destinationId: finalDestId, avoidedIncidents, hadToTraverseHazard } = routeResult;
    const fullNodes = path.map(id => navigationNodes.find(n => n.id === id)).filter(Boolean);
    const steps = generateTurnByTurn(path, isEvacuation);

    // Compute actual physical distance without graph penalties
    let realDistanceMeters = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const edge = navigationEdges.find(
        e => (e.from === path[i] && e.to === path[i+1]) || (e.from === path[i+1] && e.to === path[i])
      );
      realDistanceMeters += edge ? (edge.distance || 15) : 15;
    }

    // Calculate estimated walking time (average walking speed ~75 m/min)
    const walkTimeMinutes = Math.max(1, Math.round(realDistanceMeters / 75));

    return res.json({
      success: true,
      route: {
        pathNodeIds: path,
        nodes: fullNodes,
        totalDistanceMeters: realDistanceMeters,
        estimatedWalkTimeMinutes: walkTimeMinutes,
        startId,
        destinationId: finalDestId,
        steps,
        accessibleOnly,
        isEvacuation,
        avoidedIncidentsCount: avoidedIncidents?.length || 0,
        avoidedIncidents: avoidedIncidents || [],
        hadToTraverseHazard: !!hadToTraverseHazard
      }
    });
  } catch (err) {
    console.error("Pathfinding error:", err);
    return res.status(500).json({ success: false, error: "Internal error calculating route" });
  }
});

// Search POIs & destinations
router.get("/pois", (req, res) => {
  const query = (req.query.q || "").toLowerCase().trim();
  if (!query) {
    return res.json({ success: true, count: campusPOIs.length, pois: campusPOIs });
  }

  const matches = campusPOIs.filter(poi => {
    return (
      poi.name.toLowerCase().includes(query) ||
      poi.building.toLowerCase().includes(query) ||
      poi.category.toLowerCase().includes(query) ||
      poi.keywords.some(k => k.toLowerCase().includes(query))
    );
  });

  return res.json({ success: true, count: matches.length, pois: matches });
});

// Get all navigation graph nodes & edges
router.get("/graph", (req, res) => {
  return res.json({
    success: true,
    nodes: navigationNodes,
    edges: navigationEdges
  });
});

export default router;
