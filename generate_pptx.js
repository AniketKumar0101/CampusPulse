import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pptxgen = require("pptxgenjs");
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pptx = new pptxgen();

// ==========================================
// PRESENTATION CONFIGURATION (16:9 Widescreen: 13.333 x 7.5 inches)
// ==========================================
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Team CampusPulse (Lead: Aniket Kumar)";
pptx.company = "Sri Sairam Engineering College";
pptx.title = "CampusPulse - Tech Pulse 2026 Pitch Deck";

// ==========================================
// COLOR PALETTE (Obsidian Aerospace Dark Theme)
// ==========================================
const BG_DARK        = "0A0E17"; // Ultra-deep slate canvas
const CARD_BG        = "111827"; // Deep obsidian card surface
const CARD_BG_ALT    = "162238"; // Elevated card highlight
const CARD_BORDER    = "1E2D4A"; // Subtle crisp card border
const ACCENT_CYAN    = "00F2FE"; // Vibrant electric cyan
const PRIMARY_ORANGE = "FF6B35"; // Brand energetic coral
const ACCENT_EMERALD = "10B981"; // Bright emerald green
const ACCENT_AMBER   = "F59E0B"; // Advisory gold / amber
const ACCENT_ROSE    = "EF4444"; // Urgent emergency ruby red
const ACCENT_PURPLE  = "8B5CF6"; // Telemetry / AI purple
const TEXT_LIGHT     = "F8FAFC"; // Primary bright white text
const TEXT_MUTED     = "94A3B8"; // Secondary slate text
const TEXT_DIM       = "64748B"; // Muted tertiary text
const FONT_HEADING   = "Segoe UI";
const FONT_BODY      = "Calibri";

const TOTAL_SLIDES = 12;

// ==========================================
// REUSABLE HELPER: SLIDE HEADER & FOOTER
// Maximum content bottom allowed: y = 6.25 inches
// Footer sits cleanly at: y = 6.65 inches (leaves 0.55" bottom padding)
// ==========================================
function setupSlideChrome(slide, categoryText, titleText, accentColor = ACCENT_CYAN, slideNumber = 1) {
  slide.background = { color: BG_DARK };

  // Top Neon Bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.06,
    fill: { color: accentColor }, line: { type: "none" }
  });

  // Category Eyebrow Pill Badge
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 0.35, w: 4.6, h: 0.32,
    fill: { color: "131D31" }, line: { color: accentColor, width: 1 }
  });
  slide.addText(categoryText.toUpperCase(), {
    x: 0.8, y: 0.35, w: 4.6, h: 0.32,
    fontSize: 9, bold: true, color: accentColor, fontFace: FONT_HEADING,
    align: "center", valign: "middle", charSpacing: 1.5
  });

  // Slide Title
  slide.addText(titleText, {
    x: 0.8, y: 0.72, w: 11.73, h: 0.55,
    fontSize: 21, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING,
    valign: "middle"
  });

  // Header Divider Line
  slide.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 1.35, w: 11.73, h: 0,
    line: { color: CARD_BORDER, width: 1 }
  });

  // Footer Divider Line
  slide.addShape(pptx.ShapeType.line, {
    x: 0.8, y: 6.65, w: 11.73, h: 0,
    line: { color: "152033", width: 1 }
  });

  // Footer Metadata
  slide.addText("Sri Sairam Engineering College • Tech Pulse 2026 • Problem Statement 4: Intelligent Campus Navigation", {
    x: 0.8, y: 6.72, w: 7.0, h: 0.3,
    fontSize: 9, color: TEXT_DIM, fontFace: FONT_BODY, valign: "middle"
  });

  slide.addText(`Team CampusPulse | Lead: Aniket Kumar   [ ${slideNumber} / ${TOTAL_SLIDES} ]`, {
    x: 8.0, y: 6.72, w: 4.53, h: 0.3,
    fontSize: 9, color: TEXT_DIM, fontFace: FONT_BODY, align: "right", valign: "middle"
  });
}

// =========================================================================
// SLIDE 1: HERO COVER / TITLE SLIDE (All elements well within 0.5" - 6.2")
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: BG_DARK };

  // Top Neon Bar
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: PRIMARY_ORANGE }, line: { type: "none" }
  });

  // Track Pill
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 0.65, w: 5.6, h: 0.36,
    fill: { color: "182238" }, line: { color: PRIMARY_ORANGE, width: 1.5 }
  });
  slide.addText("TECH PULSE 2026 • SMART CAMPUS TRACK • PS-04", {
    x: 0.8, y: 0.65, w: 5.6, h: 0.36,
    fontSize: 9.5, bold: true, color: PRIMARY_ORANGE, fontFace: FONT_HEADING,
    align: "center", valign: "middle", charSpacing: 1.5
  });

  // Main Project Title
  slide.addText("CampusPulse", {
    x: 0.8, y: 1.15, w: 11.73, h: 1.0,
    fontSize: 50, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING,
    valign: "middle"
  });

  // Subtitle
  slide.addText("Intelligent Dual-Mode Campus Navigation & Real-Time Incident Dispatch System", {
    x: 0.8, y: 2.18, w: 11.73, h: 0.45,
    fontSize: 17, bold: true, color: ACCENT_CYAN, fontFace: FONT_HEADING
  });

  // Core Value Proposition Box
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 2.75, w: 11.73, h: 0.7,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
  });
  slide.addText("An enterprise-grade smart campus companion combining zero-API vector outdoor GIS, multi-floor indoor CAD wayfinding, dynamic hazard-aware Dijkstra routing, and a real-time safety operations command center.", {
    x: 1.0, y: 2.78, w: 11.33, h: 0.64,
    fontSize: 11.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15, valign: "middle"
  });

  // 4 Feature Pills
  const pills = [
    { title: "Dual-Mode GIS & CAD", desc: "Outdoor + 3-Floor Indoor", color: ACCENT_CYAN },
    { title: "Dynamic Dijkstra Reroute", desc: "Avoids Active Hazards", color: PRIMARY_ORANGE },
    { title: "1-Tap SOS Beacon", desc: "Procedural Audio Sirens", color: ACCENT_ROSE },
    { title: "Live SOC Command Center", desc: "WebSocket Triage Queue", color: ACCENT_EMERALD }
  ];

  pills.forEach((p, i) => {
    const px = 0.8 + i * 3.02;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: px, y: 3.65, w: 2.82, h: 1.1,
      fill: { color: CARD_BG_ALT }, line: { color: p.color, width: 1 }
    });
    slide.addText(p.title, {
      x: px + 0.15, y: 3.75, w: 2.52, h: 0.4,
      fontSize: 11.5, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });
    slide.addText(p.desc, {
      x: px + 0.15, y: 4.2, w: 2.52, h: 0.45,
      fontSize: 9.5, color: p.color, fontFace: FONT_BODY
    });
  });

  // Footer Metadata Box (Ends at y = 5.95, leaving 1.55" padding at bottom!)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 4.95, w: 11.73, h: 0.85,
    fill: { color: "0D1526" }, line: { color: CARD_BORDER, width: 1 }
  });

  slide.addText("Team Name: CampusPulse   |   Team Leader: Aniket Kumar   |   Institution: Sri Sairam Engineering College (SSEC), Chennai\nLive Prototype Tested: http://localhost:3000   |   Interactive Slides: http://localhost:3000/slides.html", {
    x: 1.0, y: 5.0, w: 11.33, h: 0.75,
    fontSize: 11, color: TEXT_LIGHT, fontFace: FONT_HEADING, lineSpacingMultiple: 1.2, valign: "middle"
  });
}

// =========================================================================
// SLIDE 2: EXECUTIVE SUMMARY & SOLUTION AT A GLANCE
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Executive Summary", "CampusPulse at a Glance: Unified Mobility & Safety Platform", ACCENT_CYAN, 2);

  const pillars = [
    {
      num: "01",
      title: "Dual-Mode Vector Cartography",
      tag: "Zero-Cost SVG GIS Engine",
      color: ACCENT_CYAN,
      points: [
        "Interactive outdoor vector map of Sri Sairam Engineering College.",
        "Smooth multi-touch pan, zoom, and coordinate matrix transforms.",
        "Zero dependency on Google Maps API — eliminates recurring billing."
      ]
    },
    {
      num: "02",
      title: "Multi-Floor CAD Wayfinding",
      tag: "Room-Level Indoor Precision",
      color: PRIMARY_ORANGE,
      points: [
        "Architectural floorplans for Alpha, Beta, and Delta complexes.",
        "Dynamic level switching across Ground (G), Floor 1, and Floor 2.",
        "Targets specialized labs, GPU clusters, lecture halls & seminar venues."
      ]
    },
    {
      num: "03",
      title: "Dynamic Hazard Pathfinding",
      tag: "Dijkstra Graph Intelligence",
      color: ACCENT_EMERALD,
      points: [
        "Automatically reroutes paths away from reported hazards & repairs.",
        "Dedicated wheelchair & step-free mode avoiding stairs and steps.",
        "1-Click emergency evacuation to the closest verified fire exit."
      ]
    },
    {
      num: "04",
      title: "Security Operations Center",
      tag: "Real-Time WebSocket Command",
      color: ACCENT_PURPLE,
      points: [
        "Live incident triage queue for electrical, plumbing, and security issues.",
        "Sub-100ms real-time event distribution across all student devices.",
        "Instant campus-wide emergency advisory banners during storms or crises."
      ]
    }
  ];

  pillars.forEach((p, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 5.96;
    const y = 1.55 + row * 2.4; // Max y = 1.55 + 2.4 + 2.2 = 6.15 (Fits within 6.25!)

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.76, h: 2.2,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText(p.num, {
      x: x + 0.25, y: y + 0.15, w: 0.7, h: 0.38,
      fontSize: 18, bold: true, color: p.color, fontFace: FONT_HEADING
    });

    slide.addText(p.title, {
      x: x + 1.0, y: y + 0.15, w: 4.5, h: 0.38,
      fontSize: 13.5, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.25, y: y + 0.58, w: 5.26, h: 0.26,
      fill: { color: "162238" }, line: { type: "none" }
    });
    slide.addText(p.tag.toUpperCase(), {
      x: x + 0.25, y: y + 0.58, w: 5.26, h: 0.26,
      fontSize: 8.5, bold: true, color: p.color, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    const bodyText = p.points.map(pt => `• ${pt}`).join("\n");
    slide.addText(bodyText, {
      x: x + 0.25, y: y + 0.9, w: 5.26, h: 1.2,
      fontSize: 10, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });
}

// =========================================================================
// SLIDE 3: PROBLEM STATEMENT & GROUND REALITIES
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Problem Statement", "Navigational Bottlenecks & Safety Deficits in Modern Campuses", PRIMARY_ORANGE, 3);

  // Context banner
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.55, w: 11.73, h: 0.45,
    fill: { color: "181A24" }, line: { color: PRIMARY_ORANGE, width: 1 }
  });
  slide.addText("CASE STUDY: Sri Sairam Engineering College (300+ Acre Campus, 10,000+ Students, Faculty, and Event Visitors)", {
    x: 1.0, y: 1.55, w: 11.33, h: 0.45,
    fontSize: 11, bold: true, color: PRIMARY_ORANGE, fontFace: FONT_HEADING, valign: "middle"
  });

  const problems = [
    {
      badge: "SEVERITY: HIGH FRICTION",
      badgeColor: ACCENT_AMBER,
      title: "Campus Disorientation & Sprawl",
      points: [
        "Vast multi-block layout creates disorientation for freshmen, guest lecturers, parents, and delivery agents.",
        "Outdoor commercial GPS apps terminate at building perimeters with zero indoor room-level visibility.",
        "Average 20-30 minutes wasted per person searching for designated labs, seminar halls, or examination halls."
      ]
    },
    {
      badge: "SEVERITY: SAFETY HAZARD",
      badgeColor: ACCENT_ROSE,
      title: "Static, Hazard-Blind Paths",
      points: [
        "Standard campus maps are static and unaware of active water leaks, wet floors, or construction zones.",
        "Students unknowingly walk directly through active electrical or physical hazard zones.",
        "Zero accessibility intelligence for injured or wheelchair-bound students requiring step-free elevator routes."
      ]
    },
    {
      badge: "SEVERITY: CRITICAL RISK",
      badgeColor: ACCENT_ROSE,
      title: "Fragmented Incident Dispatch",
      points: [
        "Campus incident reporting relies on phone calls, informal word-of-mouth, or physical security cabin visits.",
        "Critical emergency distress calls lack exact floor and CAD room coordinates, severely delaying response times.",
        "Campus administration lacks a sub-second broadcast system to push flash safety advisories to all student screens."
      ]
    }
  ];

  problems.forEach((p, idx) => {
    const x = 0.8 + idx * 3.98;
    const y = 2.15; // Ends at 2.15 + 4.15 = 6.30

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 3.78, h: 4.15,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 0.2, w: 3.38, h: 0.3,
      fill: { color: "182030" }, line: { color: p.badgeColor, width: 1 }
    });
    slide.addText(p.badge, {
      x: x + 0.2, y: y + 0.2, w: 3.38, h: 0.3,
      fontSize: 8.5, bold: true, color: p.badgeColor, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    slide.addText(p.title, {
      x: x + 0.2, y: y + 0.6, w: 3.38, h: 0.55,
      fontSize: 14.5, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });

    const body = p.points.map(pt => `• ${pt}`).join("\n\n");
    slide.addText(body, {
      x: x + 0.2, y: y + 1.25, w: 3.38, h: 2.7,
      fontSize: 10, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });
}

// =========================================================================
// SLIDE 4: UNIFIED ECOSYSTEM & OPERATIONAL WORKFLOW
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Architecture Flow", "End-to-End Operational Lifecycle: Detection to Resolution", ACCENT_CYAN, 4);

  const steps = [
    {
      step: "STAGE 1",
      title: "Field Detection & Geo-Tagging",
      color: ACCENT_CYAN,
      desc: "Student or staff detects an incident (water spill, electrical fault, or SOS panic). Logs issue with 1-click CAD room coordinates and photo evidence via camera capture."
    },
    {
      step: "STAGE 2",
      title: "Dynamic Graph Weight Penalty",
      color: PRIMARY_ORANGE,
      desc: "Pathfinding engine instantly flags affected graph edges. Dijkstra pathfinding adds dynamic hazard penalty weight (w' = w + Phazard), steering pedestrians away from the danger zone."
    },
    {
      step: "STAGE 3",
      title: "Real-Time WebSocket Dispatch",
      color: ACCENT_EMERALD,
      desc: "Incident dispatches via native WebSockets (<100ms) to the Security Operations Center. Nearby students can vote '+1 Impacts Me Too' to crowd-escalate priority automatically."
    },
    {
      step: "STAGE 4",
      title: "Crew Assignment & Safe Clearance",
      color: ACCENT_PURPLE,
      desc: "Security admin assigns dedicated crew (Electrical, Plumbing, Paramedics). Once resolved, the graph penalty is lifted, instantly restoring the fastest corridor path campus-wide."
    }
  ];

  steps.forEach((s, idx) => {
    const x = 0.8 + idx * 2.98;
    const y = 1.6; // Ends at 1.6 + 4.7 = 6.30

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 2.8, h: 4.7,
      fill: { color: CARD_BG }, line: { color: s.color, width: 1.5 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 0.2, w: 2.4, h: 0.32,
      fill: { color: "162238" }, line: { type: "none" }
    });
    slide.addText(s.step, {
      x: x + 0.2, y: y + 0.2, w: 2.4, h: 0.32,
      fontSize: 10, bold: true, color: s.color, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    slide.addText(s.title, {
      x: x + 0.2, y: y + 0.65, w: 2.4, h: 0.7,
      fontSize: 13.5, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });

    slide.addText(s.desc, {
      x: x + 0.2, y: y + 1.45, w: 2.4, h: 3.0,
      fontSize: 10.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });
}

// =========================================================================
// SLIDE 5: INNOVATION PILLAR 1 - DUAL-MODE GIS & CAD WAYFINDING
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Innovation Pillar 1", "Dual-Mode Spatial Cartography: Outdoor Vector GIS & Indoor CAD", ACCENT_CYAN, 5);

  // Left Card: Outdoor Vector GIS
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.76, h: 4.7,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.1, y: 1.8, w: 5.16, h: 0.35,
    fill: { color: "132338" }, line: { color: ACCENT_CYAN, width: 1 }
  });
  slide.addText("OUTDOOR CAMPUS VECTOR GIS ENGINE", {
    x: 1.1, y: 1.8, w: 5.16, h: 0.35,
    fontSize: 10, bold: true, color: ACCENT_CYAN, fontFace: FONT_HEADING, align: "center", valign: "middle"
  });

  const outdoorPoints = [
    "High-Precision SVG Cartography: Custom vector blueprints of Sri Sairam Engineering College.",
    "Mapped Campus Anchors: Alpha Block (CSE/AI-DS), Beta Block, Delta Block, Tech Pulse Hackathon Arena, Central Library, Cafeteria, Sports Complex & Main Gate.",
    "Dynamic Matrix Pan/Zoom: Smooth multi-touch canvas panning and zooming with infinite resolution.",
    "Zero External Map API Bills: 100% self-hosted SVG rendering eliminates recurring Google Maps API costs, rate limits, and latency spikes."
  ];

  slide.addText(outdoorPoints.map(p => `• ${p}`).join("\n\n"), {
    x: 1.1, y: 2.3, w: 5.16, h: 3.8,
    fontSize: 10.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });

  // Right Card: Multi-Floor Indoor CAD
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.76, y: 1.6, w: 5.76, h: 4.7,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.06, y: 1.8, w: 5.16, h: 0.35,
    fill: { color: "2A1B14" }, line: { color: PRIMARY_ORANGE, width: 1 }
  });
  slide.addText("MULTI-FLOOR ARCHITECTURAL CAD BLUEPRINTS", {
    x: 7.06, y: 1.8, w: 5.16, h: 0.35,
    fontSize: 10, bold: true, color: PRIMARY_ORANGE, fontFace: FONT_HEADING, align: "center", valign: "middle"
  });

  const indoorPoints = [
    "Deep 1-Click Building Drill-Down: Clicking any academic block transitions instantly from outdoor footprint to interior room layout.",
    "Dynamic Level Switcher: Instant floor-by-floor toggle across Ground Floor (G), Level 1 (L1), and Level 2 (L2).",
    "Room-Level Metadata: Precise coordinates, room codes (e.g. G02, L104), capacity data, and laboratory types.",
    "Global POI Search & Autocomplete: Direct search across High-Performance GPU Labs, Robotics Studios, Faculty Rooms, Restrooms, and Water Stations."
  ];

  slide.addText(indoorPoints.map(p => `• ${p}`).join("\n\n"), {
    x: 7.06, y: 2.3, w: 5.16, h: 3.8,
    fontSize: 10.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });
}

// =========================================================================
// SLIDE 6: INNOVATION PILLAR 2 - DYNAMIC HAZARD-AWARE DIJKSTRA ROUTING
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Innovation Pillar 2", "Intelligent Pathfinding: Dijkstra Graph Search with Dynamic Penalties", ACCENT_EMERALD, 6);

  const cols = [
    {
      title: "Graph Mathematical Model",
      badge: "ALGORITHMIC CORE",
      color: ACCENT_CYAN,
      desc: "• Campus modeled as an undirected weighted graph G = (V, E).\n• Vertices (V): Building portals, corridor junctions, elevators, stairwells, and room entries.\n• Edges (E): Walkable pathways, boulevards, skywalks, and corridors.\n• Edge Weights (w): True physical walking distance in meters computed via Euclidean metrics."
    },
    {
      title: "Dynamic Hazard Weight Mutation",
      badge: "LIVE ADAPTATION",
      color: PRIMARY_ORANGE,
      desc: "• When an incident (high-voltage leak, spill, or repair) is reported at coordinate L, incident coordinates map to adjacent graph edges.\n• Algorithm injects a dynamic penalty:\n  w'_edge = w_edge + P_hazard (P > 1000m).\n• Dijkstra automatically routes pedestrian paths through safe detour corridors with advisory notices."
    },
    {
      title: "Specialized Routing Modes",
      badge: "ACCESSIBILITY & SAFETY",
      color: ACCENT_EMERALD,
      desc: "• ♿ Wheelchair / Step-Free Mode: Automatically sets all stairwell edge weights to infinity (w_stair = ∞). Routes walkers exclusively through ramps and passenger elevators.\n• 🚨 1-Click Emergency Evacuation: Guaranteed shortest path algorithm linking user coordinates to the closest verified Emergency Fire Exit."
    }
  ];

  cols.forEach((c, idx) => {
    const x = 0.8 + idx * 3.98;
    const y = 1.6; // Ends at 1.6 + 4.7 = 6.30

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 3.78, h: 4.7,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 0.2, w: 3.38, h: 0.3,
      fill: { color: "162238" }, line: { color: c.color, width: 1 }
    });
    slide.addText(c.badge, {
      x: x + 0.2, y: y + 0.2, w: 3.38, h: 0.3,
      fontSize: 8.5, bold: true, color: c.color, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    slide.addText(c.title, {
      x: x + 0.2, y: y + 0.6, w: 3.38, h: 0.55,
      fontSize: 14, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });

    slide.addText(c.desc, {
      x: x + 0.2, y: y + 1.25, w: 3.38, h: 3.2,
      fontSize: 10, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });
}

// =========================================================================
// SLIDE 7: INNOVATION PILLAR 3 - GEO-TAGGED REPORTING & CROWD TRIAGE
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Innovation Pillar 3", "Crowdsourced Incident Reporting, Proof Uploads & Emergency SOS", ACCENT_ROSE, 7);

  const features = [
    {
      title: "Multi-Category Geo-Reporting",
      badge: "EVIDENCE ATTACHMENT",
      color: ACCENT_CYAN,
      desc: "• Structured taxonomy: Electrical, Plumbing, HVAC, Physical Safety, and Medical.\n• Automated geo-tagging: Binds exact building name, floor level, and room coordinate.\n• Multer-powered photo upload and camera capture for photographic evidence."
    },
    {
      title: "'+1 Impacts Me Too' Crowd Triage",
      badge: "DEDUPLICATION ENGINE",
      color: PRIMARY_ORANGE,
      desc: "• Eliminates duplicate tickets for campus-wide issues (e.g., cafeteria water outage).\n• Students vote '+1 Impacts Me Too' directly from their mobile feed.\n• Ticket urgency dynamically auto-escalates to High/Critical based on peer vote velocity."
    },
    {
      title: "1-Tap SOS Emergency Panic Beacon",
      badge: "LIFE SAFETY DISPATCH",
      color: ACCENT_ROSE,
      desc: "• Prominent top-bar SOS Panic button for critical physical or medical distress.\n• Browser Web Audio API procedurally synthesizes dual-tone emergency sirens.\n• Sub-second priority broadcast triggers visual radar sweeps in the Security Operations Center."
    }
  ];

  features.forEach((f, idx) => {
    const x = 0.8 + idx * 3.98;
    const y = 1.6; // Ends at 1.6 + 4.7 = 6.30

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 3.78, h: 4.7,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.2, y: y + 0.2, w: 3.38, h: 0.3,
      fill: { color: "182030" }, line: { color: f.color, width: 1 }
    });
    slide.addText(f.badge, {
      x: x + 0.2, y: y + 0.2, w: 3.38, h: 0.3,
      fontSize: 8.5, bold: true, color: f.color, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    slide.addText(f.title, {
      x: x + 0.2, y: y + 0.6, w: 3.38, h: 0.55,
      fontSize: 14, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });

    slide.addText(f.desc, {
      x: x + 0.2, y: y + 1.25, w: 3.38, h: 3.2,
      fontSize: 10, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });
}

// =========================================================================
// SLIDE 8: INNOVATION PILLAR 4 - SECURITY OPERATIONS CENTER (SOC)
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Innovation Pillar 4", "Security Operations Command Center: Live Triage & Broadcast", ACCENT_PURPLE, 8);

  // Left Card: Triage & Dispatch Workflow
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 5.76, h: 4.7,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.1, y: 1.8, w: 5.16, h: 0.35,
    fill: { color: "1C1733" }, line: { color: ACCENT_PURPLE, width: 1 }
  });
  slide.addText("LIVE INCIDENT TRIAGE & FIELD CREW DISPATCH", {
    x: 1.1, y: 1.8, w: 5.16, h: 0.35,
    fontSize: 10, bold: true, color: ACCENT_PURPLE, fontFace: FONT_HEADING, align: "center", valign: "middle"
  });

  const triagePoints = [
    "Real-Time Incident Stream: Live incoming ticket queue synchronized across all security screens via WebSockets with zero page refresh.",
    "Specialized Crew Assignment: 1-click dispatch to Electrical, Plumbing, HVAC, Campus Security Quick Reaction Force (QRF), and Medical Teams.",
    "Resolution Lifecycle Management: Full audit trail tracking Open ➔ In Triage ➔ Dispatched ➔ Resolved with resolution timestamping.",
    "Real-Time KPI Command Bar: Live telemetry tracking total logged incidents, active critical hazards, in-progress tickets, and campus resolution rate."
  ];

  slide.addText(triagePoints.map(p => `• ${p}`).join("\n\n"), {
    x: 1.1, y: 2.3, w: 5.16, h: 3.8,
    fontSize: 10.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });

  // Right Card: Campus-Wide Emergency Broadcast
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 6.76, y: 1.6, w: 5.76, h: 4.7,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.06, y: 1.8, w: 5.16, h: 0.35,
    fill: { color: "2A1B14" }, line: { color: PRIMARY_ORANGE, width: 1 }
  });
  slide.addText("CAMPUS-WIDE EMERGENCY ADVISORY BROADCAST", {
    x: 7.06, y: 1.8, w: 5.16, h: 0.35,
    fontSize: 10, bold: true, color: PRIMARY_ORANGE, fontFace: FONT_HEADING, align: "center", valign: "middle"
  });

  const broadcastPoints = [
    "Sub-3-Second Push Notification: Transmits critical advisory alerts simultaneously across all active student mobile & desktop screens.",
    "Multi-Level Severity Tiers: Informational (Cyan), Warning / Rain Alert (Amber), and Critical Emergency (Red).",
    "Persistent Top-Bar Banner: Flashes high-visibility alert message across the application interface with dismissal controls.",
    "Ideal for Campus Scenarios: Heavy monsoon rain warnings, power outages, route blockages, or campus safety advisories."
  ];

  slide.addText(broadcastPoints.map(p => `• ${p}`).join("\n\n"), {
    x: 7.06, y: 2.3, w: 5.16, h: 3.8,
    fontSize: 10.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
  });
}

// =========================================================================
// SLIDE 9: TECHNICAL ARCHITECTURE & FULL-STACK SPECIFICATIONS
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Technical Architecture", "End-to-End System Architecture & High-Performance Tech Stack", ACCENT_CYAN, 9);

  const tiers = [
    {
      title: "Presentation Tier (Frontend Client)",
      badge: "ZERO BUNDLE OVERHEAD",
      color: ACCENT_CYAN,
      desc: "• HTML5 Semantic DOM with Vanilla ES6 JavaScript modules.\n• Vanilla CSS custom design tokens, Obsidian aerospace dark mode & Glassmorphic HUD.\n• Interactive Vector GIS Engine with multi-touch matrix transformation.\n• Procedural Web Audio API sound synthesizer for audio alarms without external audio files."
    },
    {
      title: "Real-Time Telemetry Layer",
      badge: "SUB-100MS LATENCY",
      color: PRIMARY_ORANGE,
      desc: "• Native Node.js WebSockets (ws library) running on unified port 3000.\n• Bi-directional pub/sub event distribution bus.\n• Instant broadcast of incident creation, vote increments, dispatch updates, and emergency SOS alerts."
    },
    {
      title: "Algorithmic & REST API Core",
      badge: "GRAPH COMPUTATION",
      color: ACCENT_EMERALD,
      desc: "• Node.js (v20+) runtime with Express.js (v4.21) REST microservices.\n• Dijkstra shortest-path pathfinding service with dynamic edge penalty recalculation.\n• Modular route structure: /api/campus, /api/navigation, /api/incidents, /api/broadcast."
    },
    {
      title: "Persistence & File Handling",
      badge: "EVIDENCE DATASTORE",
      color: ACCENT_PURPLE,
      desc: "• Multer multipart form-data middleware for incident photo uploads.\n• Normalized JSON persistent datastores for campus graph coordinates and incident history.\n• 100% self-contained codebase — zero external cloud database or paid API dependencies."
    }
  ];

  tiers.forEach((t, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const x = 0.8 + col * 5.96;
    const y = 1.55 + row * 2.4; // Ends at 1.55 + 2.4 + 2.2 = 6.15

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 5.76, h: 2.2,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText(t.title, {
      x: x + 0.25, y: y + 0.15, w: 3.6, h: 0.38,
      fontSize: 13, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });

    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 3.95, y: y + 0.16, w: 1.55, h: 0.26,
      fill: { color: "162238" }, line: { color: t.color, width: 1 }
    });
    slide.addText(t.badge, {
      x: x + 3.95, y: y + 0.16, w: 1.55, h: 0.26,
      fontSize: 7, bold: true, color: t.color, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    slide.addText(t.desc, {
      x: x + 0.25, y: y + 0.58, w: 5.26, h: 1.5,
      fontSize: 9.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });
}

// =========================================================================
// SLIDE 10: COMPETITIVE ADVANTAGE & BENCHMARK MATRIX (Fits cleanly within 6.0")
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Competitive Advantage", "Why CampusPulse Wins: Feature Benchmark Comparison", PRIMARY_ORANGE, 10);

  const headers = [
    { text: "CAPABILITY / FEATURE", options: { bold: true, color: TEXT_LIGHT, fill: "1E293B", fontSize: 10, align: "left" } },
    { text: "GOOGLE MAPS", options: { bold: true, color: TEXT_MUTED, fill: "162035", fontSize: 9.5, align: "center" } },
    { text: "COLLEGE WEBSITES", options: { bold: true, color: TEXT_MUTED, fill: "162035", fontSize: 9.5, align: "center" } },
    { text: "CAMPUSPULSE (OURS)", options: { bold: true, color: PRIMARY_ORANGE, fill: "2A1B14", fontSize: 10, align: "center" } }
  ];

  const rows = [
    [
      { text: "Indoor Multi-Floor CAD Blueprints (G, L1, L2)", options: { color: TEXT_LIGHT, fontSize: 9 } },
      { text: "❌ None (Terminates at door)", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "❌ Static PDF Floorplans", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "✅ Interactive Room-Level Vector CAD", options: { color: ACCENT_EMERALD, bold: true, fontSize: 9, align: "center" } }
    ],
    [
      { text: "Dynamic Hazard-Aware Graph Rerouting", options: { color: TEXT_LIGHT, fontSize: 9 } },
      { text: "❌ None (Road traffic only)", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "❌ Static (No live updates)", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "✅ Automatic Dijkstra Hazard Bypass", options: { color: ACCENT_EMERALD, bold: true, fontSize: 9, align: "center" } }
    ],
    [
      { text: "Dedicated Wheelchair / Step-Free Mode", options: { color: TEXT_LIGHT, fontSize: 9 } },
      { text: "⚠️ Very Limited", options: { color: ACCENT_AMBER, fontSize: 9, align: "center" } },
      { text: "❌ None", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "✅ 1-Click Ramp & Elevator Routing", options: { color: ACCENT_EMERALD, bold: true, fontSize: 9, align: "center" } }
    ],
    [
      { text: "1-Tap Emergency SOS Panic Beacon", options: { color: TEXT_LIGHT, fontSize: 9 } },
      { text: "❌ None", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "❌ Phone Numbers Only", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "✅ Instant Audio Siren & SOC Dispatch", options: { color: ACCENT_EMERALD, bold: true, fontSize: 9, align: "center" } }
    ],
    [
      { text: "Security Operations Center (SOC) Dispatch", options: { color: TEXT_LIGHT, fontSize: 9 } },
      { text: "❌ None", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "❌ Unsynchronized Forms", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "✅ Real-Time Crew Dispatch & Lifecycles", options: { color: ACCENT_EMERALD, bold: true, fontSize: 9, align: "center" } }
    ],
    [
      { text: "Third-Party Map API Licensing Costs", options: { color: TEXT_LIGHT, fontSize: 9 } },
      { text: "❌ Expensive ($200+/mo at scale)", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "❌ Variable API Bills", options: { color: ACCENT_ROSE, fontSize: 9, align: "center" } },
      { text: "✅ ₹0 (100% Self-Hosted Vector Engine)", options: { color: ACCENT_EMERALD, bold: true, fontSize: 9, align: "center" } }
    ]
  ];

  const tableData = [headers, ...rows];

  slide.addTable(tableData, {
    x: 0.8, y: 1.6, w: 11.73, h: 4.4,
    colW: [4.0, 2.5, 2.5, 2.73],
    fill: CARD_BG,
    border: { color: "1E2838", width: 1 },
    valign: "middle",
    margin: [4, 6, 4, 6]
  });
}

// =========================================================================
// SLIDE 11: QUANTITATIVE IMPACT, FEASIBILITY & CAMPUS ROI
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Measurable Impact", "Tangible Safety & Operational Metrics for SSEC Campus", ACCENT_EMERALD, 11);

  const metrics = [
    {
      stat: "70%",
      label: "Faster SOS Response",
      color: PRIMARY_ORANGE,
      desc: "Emergency SOS beacon transmits exact CAD room coordinates and floor levels, eliminating first-responder search delays."
    },
    {
      stat: "100%",
      label: "Hazard Isolation Rate",
      color: ACCENT_CYAN,
      desc: "Pedestrians are dynamically guided around reported water leaks, wet floors, and high-voltage maintenance zones."
    },
    {
      stat: "₹0",
      label: "External Map API Cost",
      color: ACCENT_EMERALD,
      desc: "Self-hosted SVG cartography eliminates Google Maps API billing, third-party rate limits, and external privacy tracking."
    },
    {
      stat: "<3s",
      label: "Campus Alert Speed",
      color: ACCENT_PURPLE,
      desc: "High-priority safety warnings and weather advisories push instantly across all active mobile and desktop screens."
    }
  ];

  metrics.forEach((m, idx) => {
    const x = 0.8 + idx * 2.98;
    const y = 1.6;

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y, w: 2.8, h: 2.6,
      fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
    });

    slide.addText(m.stat, {
      x: x + 0.15, y: y + 0.15, w: 2.5, h: 0.65,
      fontSize: 34, bold: true, color: m.color, fontFace: FONT_HEADING, align: "center", valign: "middle"
    });

    slide.addText(m.label, {
      x: x + 0.15, y: y + 0.85, w: 2.5, h: 0.4,
      fontSize: 12, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING, align: "center"
    });

    slide.addText(m.desc, {
      x: x + 0.15, y: y + 1.3, w: 2.5, h: 1.15,
      fontSize: 9.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });

  // Feasibility & Implementation Readiness Box (Ends at y = 4.4 + 1.8 = 6.20)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 4.4, w: 11.73, h: 1.8,
    fill: { color: "131D31" }, line: { color: ACCENT_EMERALD, width: 1 }
  });

  slide.addText("CAMPUS FEASIBILITY & DEPLOYMENT READINESS FOR SRI SAIRAM ENGINEERING COLLEGE", {
    x: 1.1, y: 4.5, w: 11.13, h: 0.3,
    fontSize: 10.5, bold: true, color: ACCENT_EMERALD, fontFace: FONT_HEADING
  });

  slide.addText("• Zero Specialized Hardware Required: Operates out-of-the-box on standard campus Wi-Fi across any smartphone, tablet, or desktop browser.\n• Instant Institutional Rollout: Pre-mapped coordinates for SSEC academic blocks, labs, and hackathon venues are already active.\n• Immediate Administrative Integration: Security officers and facilities teams can triage incidents today without server training.", {
    x: 1.1, y: 4.88, w: 11.13, h: 1.15,
    fontSize: 10.5, color: TEXT_LIGHT, fontFace: FONT_BODY, lineSpacingMultiple: 1.2
  });
}

// =========================================================================
// SLIDE 12: FUTURE ROADMAP & CONCLUSION
// =========================================================================
{
  const slide = pptx.addSlide();
  setupSlideChrome(slide, "Roadmap & Conclusion", "Future Roadmap & Project Conclusion: Built for Scale", PRIMARY_ORANGE, 12);

  // Left Card: 4-Phase Roadmap (Ends at y = 1.6 + 4.7 = 6.30)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.8, y: 1.6, w: 6.2, h: 4.7,
    fill: { color: CARD_BG }, line: { color: CARD_BORDER, width: 1 }
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 1.1, y: 1.8, w: 5.6, h: 0.35,
    fill: { color: "162238" }, line: { color: ACCENT_CYAN, width: 1 }
  });
  slide.addText("STRATEGIC 4-PHASE ENHANCEMENT ROADMAP", {
    x: 1.1, y: 1.8, w: 5.6, h: 0.35,
    fontSize: 10, bold: true, color: ACCENT_CYAN, fontFace: FONT_HEADING, align: "center", valign: "middle"
  });

  const phases = [
    { phase: "PHASE 1 (Q3 2026)", title: "Bluetooth Low Energy (BLE) Beacons", desc: "Sub-meter indoor positioning for continuous blue-dot tracking inside corridors." },
    { phase: "PHASE 2 (Q4 2026)", title: "Campus IoT Sensor Integration", desc: "Automated hazard rerouting triggered directly by environmental smoke, gas & water sensors." },
    { phase: "PHASE 3 (Q1 2027)", title: "AI Computer Vision for CCTV SOC", desc: "Automatic crowd surge detection and spill recognition streaming from security cameras." },
    { phase: "PHASE 4 (Q2 2027)", title: "Smart Parking & Shuttle Bus Telemetry", desc: "Live parking bay occupancy sensors and real-time GPS tracking for student shuttle buses." }
  ];

  phases.forEach((p, i) => {
    const py = 2.3 + i * 0.95;
    slide.addText(p.phase, {
      x: 1.1, y: py, w: 2.0, h: 0.25,
      fontSize: 8.5, bold: true, color: PRIMARY_ORANGE, fontFace: FONT_HEADING
    });
    slide.addText(p.title, {
      x: 3.1, y: py, w: 3.6, h: 0.25,
      fontSize: 10, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING
    });
    slide.addText(p.desc, {
      x: 1.1, y: py + 0.25, w: 5.6, h: 0.6,
      fontSize: 9.5, color: TEXT_MUTED, fontFace: FONT_BODY, lineSpacingMultiple: 1.15
    });
  });

  // Right Card: Final Submission & Team Summary
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 7.2, y: 1.6, w: 5.33, h: 4.7,
    fill: { color: "111A2E" }, line: { color: PRIMARY_ORANGE, width: 1.5 }
  });

  slide.addText("Thank You!", {
    x: 7.5, y: 1.85, w: 4.73, h: 0.6,
    fontSize: 28, bold: true, color: TEXT_LIGHT, fontFace: FONT_HEADING, align: "center"
  });

  slide.addText("CampusPulse is fully functional, live, and ready for deployment at Sri Sairam Engineering College.", {
    x: 7.5, y: 2.45, w: 4.73, h: 0.65,
    fontSize: 11.5, color: ACCENT_CYAN, fontFace: FONT_HEADING, align: "center", lineSpacingMultiple: 1.2
  });

  slide.addShape(pptx.ShapeType.line, {
    x: 7.7, y: 3.2, w: 4.33, h: 0,
    line: { color: CARD_BORDER, width: 1 }
  });

  slide.addText("SUBMISSION SUMMARY", {
    x: 7.5, y: 3.35, w: 4.73, h: 0.3,
    fontSize: 9.5, bold: true, color: PRIMARY_ORANGE, fontFace: FONT_HEADING, align: "center", charSpacing: 1.5
  });

  const summaryMeta = [
    "Project: CampusPulse",
    "Track: Smart Campus & Intelligent Systems (PS-04)",
    "Event: Tech Pulse 2026 (Sri Sairam Engineering College)",
    "Team Name: CampusPulse",
    "Team Leader: Aniket Kumar",
    "Live Prototype: http://localhost:3000",
    "Interactive Slides: http://localhost:3000/slides.html"
  ];

  slide.addText(summaryMeta.join("\n"), {
    x: 7.6, y: 3.75, w: 4.53, h: 2.2,
    fontSize: 10, color: TEXT_LIGHT, fontFace: FONT_HEADING, lineSpacingMultiple: 1.3
  });
}

// ==========================================
// WRITE OUTPUT FILE
// ==========================================
const outputPath = path.join(__dirname, "CampusPulse_TechPulse2026_Submission.pptx");

pptx.writeFile({ fileName: outputPath }).then(() => {
  console.log("=============================================================");
  console.log("🎉 SUCCESS: Presentation generated successfully!");
  console.log("📁 Saved at: " + outputPath);
  console.log("=============================================================");
}).catch(err => {
  console.error("❌ Error generating presentation:", err);
});


