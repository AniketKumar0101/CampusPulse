// Enterprise Campus GIS Map Engine: Precision Cartography, Multi-Floor CAD Plans & Vector Routing
import { API } from "./api.js";

export class CampusMapEngine {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.svg = document.getElementById("campus-svg-canvas");
    this.options = options;

    // View State
    this.viewMode = "OUTDOOR"; // "OUTDOOR" | "INDOOR"
    this.currentBuildingId = null;
    this.currentFloor = 0;

    // Pan & Zoom State
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isDragging = false;
    this.startX = 0;
    this.startY = 0;

    // Data Cache
    this.campusInfo = null;
    this.buildings = [];
    this.events = [];
    this.incidents = [];
    this.currentRoute = null;
    this.floorPlansCache = new Map();

    // Layer Visibilities
    this.layers = {
      incidents: true,
      events: true,
      accessibility: true
    };

    // Callback handlers
    this.onSelectDestination = options.onSelectDestination || (() => {});
    this.onSelectStart = options.onSelectStart || (() => {});
    this.onReportAtLocation = options.onReportAtLocation || (() => {});
    this.onBuildingClick = options.onBuildingClick || (() => {});
    this.onIncidentClick = options.onIncidentClick || (() => {});

    this.initPanZoom();
    this.initTooltipDismiss();
  }

  hideTooltip() {
    const tooltip = document.getElementById("map-tooltip");
    if (tooltip && tooltip.classList.contains("active")) {
      tooltip.classList.remove("active");
      tooltip.innerHTML = "";
    }
    if (this.svg) {
      this.svg.querySelectorAll(".svg-cad-room.active").forEach(el => el.classList.remove("active"));
    }
  }

  initTooltipDismiss() {
    // Dismiss when clicking anywhere on the document outside the tooltip, room nodes, or incident pins
    document.addEventListener("click", (e) => {
      const tooltip = document.getElementById("map-tooltip");
      if (!tooltip || !tooltip.classList.contains("active")) return;
      if (!e.target.closest("#map-tooltip") && !e.target.closest(".svg-room-group") && !e.target.closest(".svg-pin-incident")) {
        this.hideTooltip();
      }
    });

    // Dismiss when pressing Escape key
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.hideTooltip();
      }
    });
  }

  initPanZoom() {
    this.container.addEventListener("mousedown", (e) => {
      if (e.target.closest("#map-tooltip")) return;
      if (e.target.closest(".svg-pin-incident")) return;
      this.hideTooltip();
      if (e.target.closest(".map-control-btn") || e.target.closest(".floor-switcher-bar") || e.target.closest(".gis-hud-bar")) return;
      this.isDragging = true;
      this.startX = e.clientX - this.panX;
      this.startY = e.clientY - this.panY;
      this.container.classList.add("grabbing");
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.panX = e.clientX - this.startX;
      this.panY = e.clientY - this.startY;
      this.updateTransform();
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
      this.container.classList.remove("grabbing");
    });

    this.container.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.hideTooltip();
      const factor = e.deltaY < 0 ? 1.15 : 0.88;
      this.zoomAtPoint(factor, e.clientX, e.clientY);
    }, { passive: false });

    // Touch
    let initialTouchDist = 0;
    this.container.addEventListener("touchstart", (e) => {
      if (e.target.closest("#map-tooltip")) return;
      this.hideTooltip();
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.panX;
        this.startY = e.touches[0].clientY - this.panY;
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        initialTouchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    });

    this.container.addEventListener("touchmove", (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        this.panX = e.touches[0].clientX - this.startX;
        this.panY = e.touches[0].clientY - this.startY;
        this.updateTransform();
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = dist / initialTouchDist;
        initialTouchDist = dist;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        this.zoomAtPoint(factor, midX, midY);
      }
    }, { passive: false });

    this.container.addEventListener("touchend", () => {
      this.isDragging = false;
    });
  }

  zoomAtPoint(factor, clientX, clientY) {
    const rect = this.container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const newScale = Math.min(Math.max(0.6, this.scale * factor), 4.0);
    const scaleRatio = newScale / this.scale;

    this.panX = x - (x - this.panX) * scaleRatio;
    this.panY = y - (y - this.panY) * scaleRatio;
    this.scale = newScale;

    this.updateTransform();
  }

  zoomIn() {
    const rect = this.container.getBoundingClientRect();
    this.zoomAtPoint(1.25, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  zoomOut() {
    const rect = this.container.getBoundingClientRect();
    this.zoomAtPoint(0.8, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  flyTo(targetX = 0, targetY = 0, targetScale = 1, durationMs = 450) {
    if (!this.svg) return;
    this.panX = targetX;
    this.panY = targetY;
    this.scale = targetScale;

    this.svg.style.transition = `transform ${durationMs}ms cubic-bezier(0.16, 1, 0.3, 1)`;
    this.updateTransform();

    clearTimeout(this._flyTimeout);
    this._flyTimeout = setTimeout(() => {
      if (this.svg) {
        this.svg.style.transition = "";
      }
    }, durationMs + 50);
  }

  resetView(smooth = false) {
    this.hideTooltip();
    if (smooth) {
      this.flyTo(0, 0, 1, 450);
    } else {
      this.scale = 1;
      this.panX = 0;
      this.panY = 0;
      if (this.svg) this.svg.style.transition = "";
      this.updateTransform();
    }
  }

  updateTransform() {
    this.svg.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.scale})`;
    this.updateScaleBar();
  }

  updateScaleBar() {
    const scaleLabel = document.querySelector(".scale-bar-ruler span");
    const scaleLine = document.querySelector(".scale-line");
    if (!scaleLabel || !scaleLine) return;

    // Outdoor base scale: ~50m across a 60px line segment at scale 1.0
    // Indoor CAD base scale: ~10m across a 60px line segment at scale 1.0
    const baseMeters = (this.viewMode === "INDOOR") ? 10 : 50;
    const rawMeters = baseMeters / this.scale;

    // Cartographic standard thresholds
    let displayMeters = 50;
    if (rawMeters <= 3.5) displayMeters = 2;
    else if (rawMeters <= 7) displayMeters = 5;
    else if (rawMeters <= 14) displayMeters = 10;
    else if (rawMeters <= 22) displayMeters = 20;
    else if (rawMeters <= 35) displayMeters = 25;
    else if (rawMeters <= 75) displayMeters = 50;
    else if (rawMeters <= 140) displayMeters = 100;
    else displayMeters = 200;

    // Adjust ruler line width in pixels to precisely match distance
    const targetPx = Math.round((displayMeters / rawMeters) * 60);
    const clampedPx = Math.max(34, Math.min(95, targetPx));

    scaleLabel.textContent = `${displayMeters}m`;
    scaleLine.style.width = `${clampedPx}px`;
  }

  setLayerVisibility(layerName, visible) {
    this.layers[layerName] = visible;
    this.render();
  }

  setData({ campusInfo, buildings, events, incidents }) {
    if (campusInfo) this.campusInfo = campusInfo;
    if (buildings) this.buildings = buildings;
    if (events) this.events = events;
    if (incidents) this.incidents = incidents;
    this.render();
  }

  setRoute(routeData) {
    this.hideTooltip();
    this.currentRoute = routeData;
    if (this.viewMode === "INDOOR") {
      this.showOutdoorView();
    } else {
      this.renderRoute();
    }
  }

  clearRoute() {
    this.hideTooltip();
    this.currentRoute = null;
    const routeLayer = document.getElementById("svg-route-layer");
    if (routeLayer) routeLayer.innerHTML = "";
  }

  showOutdoorView(smooth = false) {
    this.hideTooltip();
    this.viewMode = "OUTDOOR";
    this.currentBuildingId = null;

    const switcher = document.getElementById("floor-switcher-bar");
    if (switcher) switcher.classList.add("hidden");
    this.render();

    this.resetView(smooth);
  }

  async showIndoorView(buildingId, floor = 0) {
    this.hideTooltip();
    this.viewMode = "INDOOR";
    this.currentBuildingId = buildingId;
    this.currentFloor = parseInt(floor) || 0;

    // Reset camera transform for crystal-clear CAD view
    this.resetView();

    const bldg = (this.buildings && this.buildings.find(b => b.id === buildingId)) || {
      id: buildingId,
      name: buildingId === "bldg_alpha" ? "Alpha Block (CSE & AI-DS)" :
            buildingId === "bldg_beta" ? "Beta Block (ECE & Mechanical)" :
            buildingId === "bldg_gamma" ? "Gamma Block (Admin & Library)" :
            buildingId === "bldg_delta" ? "Delta Complex (Auditorium & Innovation)" :
            buildingId === "bldg_food" ? "Campus Food Court" :
            buildingId === "bldg_sports" ? "Sports Arena & Gym" :
            buildingId === "bldg_health" ? "Campus Health Center" :
            buildingId === "bldg_hostels" ? "Student Hostels" :
            buildingId === "bldg_gate" ? "Main Campus Gate" : "Campus Facility",
      floors: (buildingId === "bldg_alpha" || buildingId === "bldg_beta" || buildingId === "bldg_hostels") ? [0, 1, 2] :
              (buildingId === "bldg_gamma" || buildingId === "bldg_delta") ? [0, 1] : [0]
    };

    // Update floor switcher UI buttons
    const switcher = document.getElementById("floor-switcher-bar");
    if (switcher) {
      switcher.classList.remove("hidden");
      const titleEl = document.getElementById("indoor-building-title");
      if (titleEl) {
        titleEl.textContent = `${bldg.name} • Level ${this.currentFloor}`;
      }

      const floorContainer = document.getElementById("floor-buttons-container");
      if (floorContainer) {
        floorContainer.innerHTML = "";
        const availableFloors = (bldg.floors && bldg.floors.length > 0) ? bldg.floors : [0];
        availableFloors.forEach(lvl => {
          const btn = document.createElement("button");
          btn.className = `floor-btn ${lvl === this.currentFloor ? "active" : ""}`;
          btn.textContent = lvl === 0 ? "L0 Ground" : `L${lvl} Floor`;
          btn.onclick = (e) => {
            e.stopPropagation();
            this.showIndoorView(buildingId, lvl);
          };
          floorContainer.appendChild(btn);
        });
      }
    }

    // Pre-fetch floor details from API cache if available
    try {
      const cacheKey = `${buildingId}_${this.currentFloor}`;
      if (!this.floorPlansCache.has(cacheKey)) {
        const res = await API.getIndoorFloor(buildingId, this.currentFloor);
        if (res && res.success && res.floorPlan) {
          this.floorPlansCache.set(cacheKey, res.floorPlan);
        }
      }
    } catch (e) {
      console.warn("Using offline CAD floor plan fallback:", e);
    }

    this.render();
  }

  render() {
    if (this.viewMode === "OUTDOOR") {
      this.renderOutdoorCampus();
    } else {
      this.renderIndoorFloor();
    }

    this.renderIncidents();
    this.renderEvents();
    if (this.currentRoute) {
      this.renderRoute();
    }
  }

  renderOutdoorCampus() {
    this.svg.setAttribute("viewBox", "0 0 1000 700");

    let html = `
      <defs>
        <pattern id="cadGrid" width="50" height="50" patternUnits="userSpaceOnUse">
          <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
          <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.08)"/>
        </pattern>
        <filter id="cadShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/>
        </filter>
      </defs>

      <rect width="1000" height="700" fill="url(#cadGrid)" />

      <!-- Campus Terrain -->
      <g id="svg-terrain-layer">
        <rect x="50" y="50" width="900" height="600" rx="16" class="svg-lawn" />
        <circle cx="495" cy="390" r="80" class="svg-lawn" fill="#065f46" fill-opacity="0.1" />
        <!-- Sports Stadium Complex -->
        <rect x="390" y="70" width="160" height="60" rx="8" fill="#064e3b" fill-opacity="0.25" stroke="#059669" stroke-width="1" stroke-dasharray="4,4"/>
        <line x1="470" y1="70" x2="470" y2="130" stroke="#059669" stroke-width="1" stroke-dasharray="3,3" />
        <circle cx="470" cy="100" r="15" fill="none" stroke="#059669" stroke-width="1" />
        <text x="470" y="103" fill="#6ee7b7" font-family="var(--font-mono)" font-size="8" font-weight="600" text-anchor="middle">ATHLETIC TRACK</text>
      </g>

      <!-- Road Infrastructure & Boulevards -->
      <g id="svg-road-layer">
        <path d="M 495 650 L 495 130" class="svg-curb"/>
        <path d="M 495 650 L 495 130" class="svg-road-asphalt"/>
        <path d="M 495 650 L 495 130" class="svg-road-stripes"/>

        <path d="M 120 390 L 870 390" class="svg-curb"/>
        <path d="M 120 390 L 870 390" class="svg-road-asphalt"/>
        <path d="M 120 390 L 870 390" class="svg-road-stripes"/>

        <path d="M 265 390 L 265 240 Q 265 220 285 220 L 495 220" class="svg-walkway"/>
        <path d="M 495 530 L 710 530 L 710 400" class="svg-walkway"/>

        <!-- Pedestrian Crossings -->
        <g stroke="#475569" stroke-width="2">
          <line x1="488" y1="375" x2="502" y2="375"/>
          <line x1="488" y1="379" x2="502" y2="379"/>
          <line x1="488" y1="383" x2="502" y2="383"/>
          <line x1="488" y1="397" x2="502" y2="397"/>
          <line x1="488" y1="401" x2="502" y2="401"/>
          <line x1="488" y1="405" x2="502" y2="405"/>
        </g>

        <!-- Oriented Road Wayfinding Labels -->
        <g fill="#475569" font-family="var(--font-mono)" font-size="7.5" font-weight="600" letter-spacing="1">
          <text x="210" y="386" text-anchor="middle">◄ WEST CAMPUS COMMONS</text>
          <text x="760" y="386" text-anchor="middle">EAST PLAZA BOULEVARD ►</text>
          <text x="502" y="270" text-anchor="start">▲ NORTH CAMPUS DRIVE</text>
          <text x="502" y="580" text-anchor="start">▼ SOUTH PORTAL AVENUE</text>
        </g>
      </g>

      <!-- Oriented GIS True North Compass Rose -->
      <g transform="translate(930, 85)" class="svg-compass-rose">
        <circle cx="0" cy="0" r="16" fill="#0c111a" stroke="#242e42" stroke-width="1.2"/>
        <line x1="0" y1="-16" x2="0" y2="16" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <line x1="-16" y1="0" x2="16" y2="0" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <!-- North Needle -->
        <polygon points="0,-12 3.5,0 -3.5,0" fill="#ff7a45"/>
        <!-- South Needle -->
        <polygon points="0,12 3.5,0 -3.5,0" fill="#475569"/>
        <!-- Cardinal Labels -->
        <text x="0" y="-14" fill="#ff7a45" font-family="var(--font-mono)" font-size="8" font-weight="700" text-anchor="middle">N</text>
        <text x="0" y="19" fill="#64748b" font-family="var(--font-mono)" font-size="6" font-weight="600" text-anchor="middle">S</text>
        <text x="17" y="2" fill="#64748b" font-family="var(--font-mono)" font-size="6" font-weight="600" text-anchor="start">E</text>
        <text x="-17" y="2" fill="#64748b" font-family="var(--font-mono)" font-size="6" font-weight="600" text-anchor="end">W</text>
      </g>

      <!-- Building Footprints -->
      <g id="svg-buildings-layer">
    `;

    for (const b of this.buildings) {
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const isCompactBldg = b.height < 75;

      // Ensure building labels fit cleanly within structural bounds with zero overlap
      const cleanBldgName = b.name.split("(")[0].trim();
      const maxSubChars = Math.max(10, Math.floor((b.width - 24) / 5.2));
      let rawSub = b.subname || (b.name.includes("(") ? b.name.split("(")[1].replace(")", "") : "");
      const cleanSub = rawSub.length > maxSubChars ? rawSub.slice(0, maxSubChars - 1) + "…" : rawSub;

      const titleY = isCompactBldg ? cy - 4 : cy - 12;
      const subY = isCompactBldg ? cy + 10 : cy + 3;

      html += `
        <g class="svg-building-group" data-bldg-id="${b.id}" data-full-name="${b.name}" data-bldg-code="${b.code}" style="cursor: pointer;">
          <defs>
            <clipPath id="clip-bldg-${b.id}">
              <rect x="${b.x + 4}" y="${b.y + 4}" width="${b.width - 8}" height="${b.height - 8}" rx="4"/>
            </clipPath>
          </defs>

          <rect x="${b.x}" y="${b.y}" width="${b.width}" height="${b.height}" 
                class="svg-building-shell" filter="url(#cadShadow)"/>
          
          <rect x="${b.x + 8}" y="${b.y + 8}" width="${b.width - 16}" height="${b.height - 16}" 
                class="svg-roof-cutout"/>

          <g clip-path="url(#clip-bldg-${b.id})">
            <text x="${cx}" y="${cy + 10}" class="svg-building-code-watermark">${b.code}</text>

            <line x1="${b.x + 8}" y1="${b.y + 8}" x2="${b.x + b.width - 8}" y2="${b.y + 8}" 
                  stroke="${b.color}" stroke-width="2.5" stroke-linecap="round"/>

            <text x="${cx}" y="${titleY}" class="svg-building-label">${cleanBldgName}</text>
            <text x="${cx}" y="${subY}" class="svg-building-sublabel">${cleanSub}</text>

            ${!isCompactBldg ? `
              <g transform="translate(${cx - 38}, ${b.y + b.height - 24})">
                <rect width="76" height="15" rx="3" fill="#0b1120" stroke="var(--border-subtle)"/>
                <text x="38" y="11" fill="#94a3b8" font-family="var(--font-mono)" font-size="8" font-weight="600" text-anchor="middle">
                  ${b.floors.length > 1 ? `${b.floors.length} LEVELS` : `SINGLE LVL`}
                </text>
              </g>
            ` : ""}
          </g>

          ${(b.entrances || []).map(ent => `
            <circle cx="${ent.x}" cy="${ent.y}" r="3.5" fill="#10b981" stroke="#090b10" stroke-width="1.5"/>
          `).join("")}
        </g>
      `;
    }

    html += `
      </g>
      <g id="svg-route-layer"></g>
      <g id="svg-events-layer"></g>
      <g id="svg-incidents-layer"></g>
      <g id="svg-user-layer"></g>
    `;

    this.svg.innerHTML = html;
    this.bindBuildingClicks();
  }

  // Precise SVG Box Fitting & Architectural Text Layout Engine
  calculateRoomLayout(r) {
    const { id, code, name, type, w, h, cap } = r;
    const isExit = type === "emergency_exit" || r.isExit || id.includes("exit");
    const isCompact = w < 85;
    const isMedium = w >= 85 && w < 135;

    // 1. Concise, high-density titles for narrow utility and service spaces
    let displayTitle = name;
    if (isCompact) {
      if (type === "elevator" || id.includes("lift")) displayTitle = "Elevator";
      else if (type === "stairs" || id.includes("stairs")) displayTitle = "Stairs";
      else if (id.includes("restroom_m") || id.includes("wc_m")) displayTitle = "Men's WC";
      else if (id.includes("restroom_f") || id.includes("wc_f")) displayTitle = "Women's WC";
      else if (type === "restroom" || id.includes("wc") || id.includes("wash")) displayTitle = "Restroom";
      else if (id.includes("water") || id.includes("h2o")) displayTitle = "Water / RO";
      else if (id.includes("store") || id.includes("parcel")) displayTitle = "Store";
      else if (isExit) displayTitle = "Fire Exit";
      else if (id.includes("solar")) displayTitle = "Solar Plant";
      else if (id.includes("shuttle")) displayTitle = "Shuttle";
      else if (id.includes("lost")) displayTitle = "Lost & Found";
      else if (id.includes("permit")) displayTitle = "Permits";
      else if (id.includes("patrol")) displayTitle = "Patrol";
    } else {
      displayTitle = displayTitle
        .replace(" (ADA Accessible)", "")
        .replace(" (Rooms 101-104)", "")
        .replace(" (Rooms 105-108)", "")
        .replace(" (Rooms 109-112)", "")
        .replace(" (Rooms 201-204)", "")
        .replace(" (Rooms 205-208)", "")
        .replace(" (Rooms 209-212)", "")
        .replace(" (Tech Pulse 2026)", "")
        .replace(" (500 Seats)", "")
        .replace(" (120 Seats)", "")
        .replace(" (800 Seats)", "");
    }

    // 2. Dynamic font sizing based on box width
    let titleFontSize = isCompact ? 7.8 : (isMedium ? 8.8 : 9.8);
    let charWidth = titleFontSize * 0.58;
    let maxChars = Math.max(7, Math.floor((w - 14) / charWidth));

    // 3. Word wrapping into max 2 lines
    const words = displayTitle.split(" ");
    let lines = [];
    let curLine = "";

    for (const word of words) {
      const candidate = curLine ? `${curLine} ${word}` : word;
      if (candidate.length <= maxChars) {
        curLine = candidate;
      } else {
        if (curLine) lines.push(curLine);
        curLine = word;
        if (lines.length >= 2) break;
      }
    }
    if (curLine && lines.length < 2) {
      lines.push(curLine);
    }

    lines = lines.map(line => {
      if (line.length > maxChars + 1) {
        return line.slice(0, Math.max(4, maxChars - 1)) + "…";
      }
      return line;
    });

    // 4. Subtitle / Capacity handling
    let showSub = true;
    let subText = cap || type.toUpperCase();
    if (isExit) {
      showSub = false; // Emergency exit has dedicated exit badge
    } else if (isCompact) {
      if (lines.length > 1 || h < 70) {
        showSub = false;
      } else {
        subText = (type === "elevator") ? "1000 KG" :
                  (type === "stairs") ? "STAIRS" :
                  (type === "restroom") ? "SANITIZED" : "";
        if (!subText) showSub = false;
      }
    } else {
      let maxSubChars = Math.floor((w - 14) / 4.8);
      if (subText.length > maxSubChars) {
        subText = subText.slice(0, maxSubChars - 1) + "…";
      }
      if (h < 70 && lines.length > 1) {
        showSub = false;
      }
    }

    // 5. Vertical offsets relative to room center cy
    const codePillWidth = Math.min(w - 12, isCompact ? 36 : 46);
    const codePillY = (lines.length === 1 && !showSub) ? -16 : (lines.length === 2 && showSub ? -23 : -20);
    const titleStartY = lines.length === 1 ? (showSub ? 1 : 5) : (showSub ? -6 : -2);
    const subY = 16;

    return {
      lines,
      showSub,
      subText,
      titleFontSize,
      codePillWidth,
      codePillY,
      codeFontSize: isCompact ? 7.2 : 8.2,
      titleStartY,
      subY,
      isExit
    };
  }

  // Master Indoor Multi-Floor CAD Architectural Renderer
  renderIndoorFloor() {
    this.svg.setAttribute("viewBox", "0 0 760 410");

    const bldg = (this.buildings && this.buildings.find(b => b.id === this.currentBuildingId)) || {
      id: this.currentBuildingId || "bldg_alpha",
      name: "Alpha Block (CSE & AI-DS)",
      code: "CSE-AI",
      floors: [0, 1, 2]
    };

    // Full 9-Building Architectural CAD Dataset
    const multiFloorData = {
      bldg_alpha: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "alpha_g_01", code: "G01", name: "Programming Fundamentals Lab", type: "lab", x: 40, y: 75, w: 165, h: 85, cap: "60 Workstations" },
            { id: "alpha_g_02", code: "G02", name: "High-Performance GPU Cluster Lab", type: "lab", x: 220, y: 75, w: 175, h: 85, cap: "A100 Tensor Pods" },
            { id: "alpha_g_hall", code: "G03", name: "Department Seminar Hall 1", type: "auditorium", x: 410, y: 75, w: 180, h: 125, cap: "180 Tiered Seats" },
            { id: "alpha_g_lift", code: "LIFT-A", name: "Elevator Core A (ADA Accessible)", type: "elevator", x: 605, y: 75, w: 65, h: 60, cap: "13 Persons / 1000kg" },
            { id: "alpha_g_stairs", code: "STAIRS-1", name: "Central Stairwell", type: "stairs", x: 605, y: 145, w: 65, h: 55, cap: "Fire Resistant Core" },
            { id: "alpha_g_restroom_m", code: "G-WC-M", name: "Men's Restroom", type: "restroom", x: 40, y: 225, w: 75, h: 65, cap: "Sanitized Facility" },
            { id: "alpha_g_restroom_f", code: "G-WC-F", name: "Women's Restroom", type: "restroom", x: 125, y: 225, w: 75, h: 65, cap: "Sanitized Facility" },
            { id: "alpha_g_water", code: "G-H2O", name: "Filtered Water & Amenities", type: "amenity", x: 210, y: 225, w: 65, h: 65, cap: "UV / RO Purifier" },
            { id: "alpha_g_server", code: "G-SRV", name: "Server Infrastructure Core", type: "lab", x: 285, y: 225, w: 100, h: 65, cap: "Dedicated Power & UPS" },
            { id: "alpha_g_exit", code: "FIRE-EXIT", name: "Emergency Fire Exit South", type: "emergency_exit", x: 400, y: 235, w: 130, h: 55, cap: "Direct Campus Egress", isExit: true },
            { id: "alpha_g_recept", code: "G-DESK", name: "CSE Department Help Desk", type: "office", x: 545, y: 225, w: 125, h: 65, cap: "Student Enquiries" }
          ]
        },
        1: {
          name: "First Floor (Level 1)",
          rooms: [
            { id: "alpha_1_01", code: "101", name: "AI & Neural Networks Lab", type: "lab", x: 40, y: 75, w: 165, h: 85, cap: "Deep Learning Workstations" },
            { id: "alpha_1_02", code: "102", name: "Big Data Analytics & Cloud Suite", type: "lab", x: 220, y: 75, w: 175, h: 85, cap: "Spark & Hadoop Pods" },
            { id: "alpha_1_hod", code: "103", name: "HOD Office & Conference Suite", type: "office", x: 410, y: 75, w: 180, h: 70, cap: "Executive Secretariat" },
            { id: "alpha_1_fac", code: "104", name: "Faculty Research Pods & Cabins", type: "office", x: 410, y: 155, w: 180, h: 65, cap: "24 Faculty Stations" },
            { id: "alpha_1_lift", code: "LIFT-A", name: "Elevator Core A (ADA Accessible)", type: "elevator", x: 605, y: 75, w: 65, h: 60, cap: "13 Persons / 1000kg" },
            { id: "alpha_1_stairs", code: "STAIRS-1", name: "Central Stairwell", type: "stairs", x: 605, y: 145, w: 65, h: 55, cap: "Fire Resistant Core" },
            { id: "alpha_1_restroom", code: "1-WC", name: "Restroom Suite Level 1", type: "restroom", x: 40, y: 225, w: 90, h: 65, cap: "Sanitized Facility" },
            { id: "alpha_1_meet", code: "105", name: "Student Discussion Cell", type: "classroom", x: 140, y: 225, w: 110, h: 65, cap: "Presentation Display" },
            { id: "alpha_1_robotics", code: "106", name: "Autonomous Systems Workcell", type: "lab", x: 260, y: 225, w: 125, h: 65, cap: "RoboCup Test Grid" },
            { id: "alpha_1_exit", code: "FIRE-EXIT", name: "Emergency Exit Fire Chute", type: "emergency_exit", x: 400, y: 235, w: 130, h: 55, cap: "Rapid Evac Tube", isExit: true },
            { id: "alpha_1_study", code: "107", name: "Digital Library Extension", type: "library", x: 545, y: 225, w: 125, h: 65, cap: "IEEE Electronic Terminals" }
          ]
        },
        2: {
          name: "Second Floor (Level 2)",
          rooms: [
            { id: "alpha_2_01", code: "201", name: "Cybersecurity & Forensic Lab", type: "lab", x: 40, y: 75, w: 165, h: 85, cap: "Isolated Red/Blue Net" },
            { id: "alpha_2_02", code: "202", name: "IoT & Smart Systems Suite", type: "lab", x: 220, y: 75, w: 175, h: 85, cap: "Embedded Sensor Testbed" },
            { id: "alpha_2_lecture", code: "203", name: "Smart Lecture Theatre Alpha", type: "classroom", x: 410, y: 75, w: 180, h: 125, cap: "120 Tiered Seats" },
            { id: "alpha_2_lift", code: "LIFT-A", name: "Elevator Core A (ADA Accessible)", type: "elevator", x: 605, y: 75, w: 65, h: 60, cap: "13 Persons / 1000kg" },
            { id: "alpha_2_stairs", code: "STAIRS-1", name: "Central Stairwell", type: "stairs", x: 605, y: 145, w: 65, h: 55, cap: "Fire Resistant Core" },
            { id: "alpha_2_project", code: "204", name: "Final Year Capstone Project Space", type: "lab", x: 40, y: 225, w: 150, h: 65, cap: "Prototyping Pods" },
            { id: "alpha_2_foss", code: "205", name: "Open Source Developers Pod", type: "lab", x: 200, y: 225, w: 120, h: 65, cap: "Linux Kernel Sprint" },
            { id: "alpha_2_restroom", code: "2-WC", name: "Restroom Suite Level 2", type: "restroom", x: 330, y: 225, w: 80, h: 65, cap: "Sanitized Facility" },
            { id: "alpha_2_exit", code: "FIRE-EXIT", name: "Roof Fire Escape Staging", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, cap: "Rooftop Staging Area", isExit: true },
            { id: "alpha_2_ieee", code: "206", name: "IEEE Student Branch HQ", type: "office", x: 555, y: 225, w: 115, h: 65, cap: "Conference Terminals" }
          ]
        }
      },
      bldg_beta: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "beta_g_01", code: "B-G01", name: "Microprocessor & Embedded Lab", type: "lab", x: 40, y: 75, w: 175, h: 85, cap: "ARM Cortex & FPGA Racks" },
            { id: "beta_g_02", code: "B-G02", name: "Robotics Arena & Testing Cell", type: "lab", x: 230, y: 75, w: 175, h: 85, cap: "Industrial Robotic Arms" },
            { id: "beta_g_seminar", code: "B-G03", name: "Beta Seminar Hall (120 Seats)", type: "auditorium", x: 420, y: 75, w: 175, h: 125, cap: "Acoustically Treated" },
            { id: "beta_g_lift", code: "LIFT-B", name: "Elevator Beta Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "ADA Accessible" },
            { id: "beta_g_stairs", code: "STAIRS-B", name: "North Stairwell", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Emergency Stair Core" },
            { id: "beta_g_wc", code: "B-G-WC", name: "Ground Restroom Complex", type: "restroom", x: 40, y: 225, w: 85, h: 65, cap: "Sanitized Facility" },
            { id: "beta_g_workshop", code: "B-G04", name: "Heavy Machine Tools Studio", type: "lab", x: 135, y: 225, w: 140, h: 65, cap: "Lathes, Milling & CNC" },
            { id: "beta_g_instr", code: "B-G05", name: "Electronic Instrumentation Bay", type: "lab", x: 285, y: 225, w: 125, h: 65, cap: "Digital Oscilloscopes" },
            { id: "beta_g_exit", code: "FIRE-EXIT", name: "Emergency Exit Beta South", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, cap: "South Plaza Egress", isExit: true },
            { id: "beta_g_store", code: "B-G06", name: "Component & Hardware Store", type: "amenity", x: 555, y: 225, w: 115, h: 65, cap: "Sensors & IC Inventory" }
          ]
        },
        1: {
          name: "First Floor (Level 1)",
          rooms: [
            { id: "beta_1_vlsi", code: "B-101", name: "Cadence & VLSI Design Center", type: "lab", x: 40, y: 75, w: 175, h: 85, cap: "Silicon EDA Software" },
            { id: "beta_1_comm", code: "B-102", name: "RF & Satellite Communication Lab", type: "lab", x: 230, y: 75, w: 175, h: 85, cap: "Microwave Anechoic Dish" },
            { id: "beta_1_faculty", code: "B-103", name: "ECE Faculty Chambers & Directorate", type: "office", x: 420, y: 75, w: 175, h: 70, cap: "HOD & Professors" },
            { id: "beta_1_research", code: "B-104", name: "Research Scholars Work Pods", type: "office", x: 420, y: 155, w: 175, h: 65, cap: "Doctoral Scholars" },
            { id: "beta_1_lift", code: "LIFT-B", name: "Elevator Beta Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "ADA Accessible" },
            { id: "beta_1_stairs", code: "STAIRS-B", name: "North Stairwell", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Emergency Stair Core" },
            { id: "beta_1_restroom", code: "B-1-WC", name: "Restroom Suite Level 1", type: "restroom", x: 40, y: 225, w: 85, h: 65, cap: "Sanitized Facility" },
            { id: "beta_1_pcb", code: "B-105", name: "PCB Prototyping Station", type: "lab", x: 135, y: 225, w: 140, h: 65, cap: "SMD Soldering & Milling" },
            { id: "beta_1_dsp", code: "B-106", name: "DSP & Signal Processing Lab", type: "lab", x: 285, y: 225, w: 125, h: 65, cap: "TI C6000 DSP Kits" },
            { id: "beta_1_exit", code: "FIRE-EXIT", name: "Fire Chute North Port", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, cap: "North Egress Route", isExit: true },
            { id: "beta_1_conf", code: "B-107", name: "Smart Conference Room", type: "classroom", x: 555, y: 225, w: 115, h: 65, cap: "Interactive Smart Board" }
          ]
        },
        2: {
          name: "Second Floor (Level 2)",
          rooms: [
            { id: "beta_2_auto", code: "B-201", name: "Embedded Automotive Systems Lab", type: "lab", x: 40, y: 75, w: 175, h: 85, cap: "CAN Bus & EV Powertrains" },
            { id: "beta_2_3d", code: "B-202", name: "3D Printing & Additive Mfg Studio", type: "lab", x: 230, y: 75, w: 175, h: 85, cap: "Industrial SLS & FDM" },
            { id: "beta_2_mecha", code: "B-203", name: "Mechatronics Testing Cell", type: "lab", x: 420, y: 75, w: 175, h: 125, cap: "Electro-Pneumatics Testbed" },
            { id: "beta_2_lift", code: "LIFT-B", name: "Elevator Beta Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "ADA Accessible" },
            { id: "beta_2_stairs", code: "STAIRS-B", name: "North Stairwell", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Emergency Stair Core" },
            { id: "beta_2_restroom", code: "B-2-WC", name: "Restroom Suite Level 2", type: "restroom", x: 40, y: 225, w: 85, h: 65, cap: "Sanitized Facility" },
            { id: "beta_2_cad", code: "B-204", name: "CAD/CAM Workstation Suite", type: "lab", x: 135, y: 225, w: 140, h: 65, cap: "SolidWorks & ANSYS Suite" },
            { id: "beta_2_thermal", code: "B-205", name: "Thermal Engineering Simulation Pod", type: "lab", x: 285, y: 225, w: 125, h: 65, cap: "CFD Workstations" },
            { id: "beta_2_exit", code: "FIRE-EXIT", name: "Roof Fire Escape Staging", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, cap: "Roof Evac Access", isExit: true },
            { id: "beta_2_lecture", code: "B-206", name: "Smart Lecture Theatre Beta", type: "classroom", x: 555, y: 225, w: 115, h: 65, cap: "120 Seats Tiered" }
          ]
        }
      },
      bldg_gamma: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "gamma_g_admin", code: "ADMIN-01", name: "Dean Academics & Directorate", type: "office", x: 40, y: 75, w: 175, h: 85, cap: "Dean Secretariat" },
            { id: "gamma_g_accounts", code: "ACCOUNTS", name: "Student Accounts & Scholarships", type: "office", x: 230, y: 75, w: 175, h: 85, cap: "Fee Counters" },
            { id: "gamma_g_lib1", code: "LIB-CIRC", name: "Central Library Circulation & Catalog", type: "library", x: 420, y: 75, w: 175, h: 125, cap: "Book Issue & RFID Return" },
            { id: "gamma_g_lift", code: "LIFT-G", name: "Elevator Gamma Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "ADA Compliant" },
            { id: "gamma_g_stairs", code: "STAIRS-G", name: "Grand Central Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Marble Broad Staircase" },
            { id: "gamma_g_wc", code: "G-WC", name: "Executive Restrooms", type: "restroom", x: 40, y: 225, w: 85, h: 65, cap: "Sanitized Facility" },
            { id: "gamma_g_admission", code: "ADMIT", name: "Admissions & Verification Desk", type: "office", x: 135, y: 225, w: 140, h: 65, cap: "Counseling & Helpdesk" },
            { id: "gamma_g_registrar", code: "REGISTRAR", name: "Registrar Secretariat", type: "office", x: 285, y: 225, w: 125, h: 65, cap: "Certificates & Archives" },
            { id: "gamma_g_exit", code: "FIRE-EXIT", name: "Emergency Exit West Portico", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, cap: "West Avenue Egress", isExit: true },
            { id: "gamma_g_board", code: "BOARD", name: "Governing Council Boardroom", type: "classroom", x: 555, y: 225, w: 115, h: 65, cap: "Executive Video Link" }
          ]
        },
        1: {
          name: "First Floor (Level 1)",
          rooms: [
            { id: "gamma_1_lib_e", code: "LIB-EPOD", name: "Digital Library & E-Learning Pods", type: "library", x: 40, y: 75, w: 175, h: 85, cap: "60 High-Speed PC Terminals" },
            { id: "gamma_1_lib_ref", code: "LIB-REF", name: "Research Reference & IEEE Archives", type: "library", x: 230, y: 75, w: 175, h: 85, cap: "15,000 Bound Volumes" },
            { id: "gamma_1_study", code: "LIB-STUDY", name: "Silent Research Carrels (100 Pods)", type: "library", x: 420, y: 75, w: 175, h: 125, cap: "Individual Quiet Pods" },
            { id: "gamma_1_lift", code: "LIFT-G", name: "Elevator Gamma Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "ADA Compliant" },
            { id: "gamma_1_stairs", code: "STAIRS-G", name: "Grand Central Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Marble Broad Staircase" },
            { id: "gamma_1_wc", code: "LIB-WC", name: "Upper Restroom Suite", type: "restroom", x: 40, y: 225, w: 85, h: 65, cap: "Sanitized Facility" },
            { id: "gamma_1_exam", code: "EXAM-CELL", name: "Controller of Examinations Cell", type: "office", x: 135, y: 225, w: 140, h: 65, cap: "Confidential Exam Branch" },
            { id: "gamma_1_iqac", code: "IQAC", name: "Internal Quality Assurance Cell", type: "office", x: 285, y: 225, w: 125, h: 65, cap: "NAAC / NBA Directorate" },
            { id: "gamma_1_exit", code: "FIRE-EXIT", name: "Terrace Fire Chute Exit", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, cap: "Direct Evacuation Tube", isExit: true },
            { id: "gamma_1_av", code: "LIB-AV", name: "Media Archival & Screening Room", type: "classroom", x: 555, y: 225, w: 115, h: 65, cap: "Audio-Visual Archive" }
          ]
        }
      },
      bldg_delta: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "delta_g_audi", code: "MAIN-AUDI", name: "Grand Auditorium (Tech Pulse 2026)", type: "auditorium", x: 40, y: 75, w: 300, h: 125, cap: "2,000 Seater Central Hall" },
            { id: "delta_g_hack", code: "HACK-ARENA", name: "Tech Pulse Hackathon Arena", type: "lab", x: 355, y: 75, w: 190, h: 125, cap: "80 Team Sprint Pods" },
            { id: "delta_g_stairs", code: "STAIRS-D", name: "Balcony Access Stairs", type: "stairs", x: 560, y: 75, w: 60, h: 55, cap: "Wide Public Stairs" },
            { id: "delta_g_lift", code: "LIFT-D", name: "ADA Freight Elevator", type: "elevator", x: 560, y: 145, w: 60, h: 55, cap: "Stage Equipment & ADA" },
            { id: "delta_g_greenroom", code: "VIP-GREEN", name: "VIP Lounge & Judges Panel", type: "office", x: 40, y: 225, w: 165, h: 65, cap: "Tech Pulse Judges Desk" },
            { id: "delta_g_av", code: "AV-CTRL", name: "Live Broadcast & Streaming Core", type: "lab", x: 215, y: 225, w: 125, h: 65, cap: "4K Broadcast Suite" },
            { id: "delta_g_exit_n", code: "EXIT-AUDI-N", name: "Emergency Exit North Port", type: "emergency_exit", x: 355, y: 235, w: 100, h: 55, cap: "Direct Double Doors", isExit: true },
            { id: "delta_g_exit_s", code: "EXIT-AUDI-S", name: "Emergency Exit South Port", type: "emergency_exit", x: 465, y: 235, w: 100, h: 55, cap: "Direct Plaza Egress", isExit: true },
            { id: "delta_g_wc", code: "AUDI-WC", name: "Grand Restroom Suite", type: "restroom", x: 575, y: 225, w: 95, h: 65, cap: "High Capacity Restroom" }
          ]
        },
        1: {
          name: "First Floor (Level 1)",
          rooms: [
            { id: "delta_1_balcony", code: "BALCONY", name: "Auditorium Upper Balcony (800 Seats)", type: "auditorium", x: 40, y: 75, w: 300, h: 125, cap: "Tiered Upper Tier" },
            { id: "delta_1_incubator", code: "INCUBATOR", name: "Startup Incubation & Mentorship Pods", type: "lab", x: 355, y: 75, w: 190, h: 125, cap: "Co-Working Workspaces" },
            { id: "delta_1_stairs", code: "STAIRS-D", name: "Balcony Access Stairs", type: "stairs", x: 560, y: 75, w: 60, h: 55, cap: "Wide Public Stairs" },
            { id: "delta_1_lift", code: "LIFT-D", name: "ADA Freight Elevator", type: "elevator", x: 560, y: 145, w: 60, h: 55, cap: "Stage Equipment & ADA" },
            { id: "delta_1_pitch", code: "PITCH", name: "Investor Pitch Theatre", type: "classroom", x: 40, y: 225, w: 165, h: 65, cap: "Presentation Room" },
            { id: "delta_1_ipr", code: "IPR-CELL", name: "Patent & Innovation Advisory", type: "office", x: 215, y: 225, w: 125, h: 65, cap: "Legal & IP Advisory" },
            { id: "delta_1_exit", code: "FIRE-EXIT", name: "Upper Balcony Fire Chute", type: "emergency_exit", x: 355, y: 235, w: 100, h: 55, cap: "External Steel Escape", isExit: true },
            { id: "delta_1_lounge", code: "VIP-LOUNGE", name: "Mentors & Speakers Lounge", type: "amenity", x: 465, y: 225, w: 100, h: 65, cap: "Refreshment Station" },
            { id: "delta_1_wc", code: "1-WC", name: "Upper Restroom Suite", type: "restroom", x: 575, y: 225, w: 95, h: 65, cap: "Sanitized Facility" }
          ]
        }
      },
      bldg_food: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "food_g_dining", code: "DINING", name: "Central Dining Hall (500 Seats)", type: "amenity", x: 40, y: 75, w: 300, h: 125, cap: "Air Conditioned Dining" },
            { id: "food_g_stalls", code: "STALLS", name: "Multi-Cuisine Food Stations", type: "amenity", x: 355, y: 75, w: 190, h: 125, cap: "North/South/Continental" },
            { id: "food_g_kitchen", code: "KITCHEN", name: "Commercial Prep Kitchen & Pantry", type: "amenity", x: 560, y: 75, w: 110, h: 125, cap: "FSSAI Grade A" },
            { id: "food_g_coffee", code: "COFFEE", name: "Barista Coffee Bar & Bakery", type: "amenity", x: 40, y: 225, w: 140, h: 65, cap: "Espresso & Bakery" },
            { id: "food_g_juice", code: "JUICE", name: "Fresh Juice & Mocktail Counter", type: "amenity", x: 190, y: 225, w: 120, h: 65, cap: "Organic Juices" },
            { id: "food_g_wash", code: "WASH", name: "Filtered Handwash Station", type: "amenity", x: 320, y: 225, w: 110, h: 65, cap: "Automatic Sensor Taps" },
            { id: "food_g_exit", code: "FIRE-EXIT", name: "Food Court Emergency Exit East", type: "emergency_exit", x: 440, y: 235, w: 110, h: 55, cap: "East Boulevard Egress", isExit: true },
            { id: "food_g_wc", code: "CAFE-WC", name: "Restrooms & Sanitation Hub", type: "restroom", x: 560, y: 225, w: 110, h: 65, cap: "Sanitized Facility" }
          ]
        }
      },
      bldg_sports: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "sports_g_court1", code: "COURT-A", name: "Indoor Teak Badminton Court 1", type: "amenity", x: 40, y: 75, w: 150, h: 125, cap: "BWF Standard Flooring" },
            { id: "sports_g_court2", code: "COURT-B", name: "Indoor Teak Badminton Court 2", type: "amenity", x: 200, y: 75, w: 150, h: 125, cap: "BWF Standard Flooring" },
            { id: "sports_g_gym", code: "GYM-PRO", name: "High-Tech Cardio & Strength Gym", type: "amenity", x: 360, y: 75, w: 185, h: 125, cap: "Full Free-Weight Cell" },
            { id: "sports_g_tt", code: "TT-ARENA", name: "Table Tennis & Carrom Zone", type: "amenity", x: 555, y: 75, w: 115, h: 125, cap: "Tournament Tables" },
            { id: "sports_g_yoga", code: "YOGA", name: "Yoga & Aerobics Studio", type: "amenity", x: 40, y: 225, w: 150, h: 65, cap: "Cushioned Wooden Floor" },
            { id: "sports_g_coach", code: "COACH", name: "Director of Physical Education", type: "office", x: 200, y: 225, w: 120, h: 65, cap: "Coaches Office" },
            { id: "sports_g_firstaid", code: "FIRST-AID", name: "Sports Physio & First Aid Post", type: "emergency", x: 330, y: 225, w: 100, h: 65, cap: "Ice Baths & Defibrillator" },
            { id: "sports_g_exit", code: "FIRE-EXIT", name: "Emergency Exit Sports Pavilion", type: "emergency_exit", x: 440, y: 235, w: 110, h: 55, cap: "Sports Arena Field Egress", isExit: true },
            { id: "sports_g_lockers", code: "LOCKERS", name: "Showers & Locker Suite", type: "restroom", x: 560, y: 225, w: 110, h: 65, cap: "Secured Electronic Lockers" }
          ]
        }
      },
      bldg_health: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "health_g_triage", code: "TRIAGE", name: "24/7 Emergency Triage Post", type: "emergency", x: 40, y: 75, w: 190, h: 125, cap: "Paramedic Station" },
            { id: "health_g_doctor", code: "DOCTOR", name: "Chief Medical Officer Cabin", type: "emergency", x: 240, y: 75, w: 150, h: 125, cap: "Doctor Consultation" },
            { id: "health_g_ward", code: "WARD", name: "4-Bed Critical Observation Ward", type: "emergency", x: 400, y: 75, w: 150, h: 125, cap: "Oxygen & Cardiac Monitors" },
            { id: "health_g_ambu", code: "AMBULANCE", name: "Ambulance Direct Rapid Dock", type: "emergency", x: 560, y: 75, w: 110, h: 125, cap: "24x7 Ambulance Ready" },
            { id: "health_g_pharmacy", code: "PHARMACY", name: "24-Hour Campus Pharmacy", type: "emergency", x: 40, y: 225, w: 140, h: 65, cap: "Essential Drugs Counter" },
            { id: "health_g_diag", code: "LAB-TEST", name: "Pathology & Blood Testing Unit", type: "emergency", x: 190, y: 225, w: 120, h: 65, cap: "Rapid Diagnostic Kits" },
            { id: "health_g_steril", code: "STERILE", name: "Autoclave & Decon Room", type: "emergency", x: 320, y: 225, w: 110, h: 65, cap: "Surgical Sterilization" },
            { id: "health_g_exit", code: "FIRE-EXIT", name: "Clinical Fire Evac Corridor", type: "emergency_exit", x: 440, y: 235, w: 110, h: 55, cap: "Direct Stretcher Ramp", isExit: true },
            { id: "health_g_wc", code: "CLINIC-WC", name: "Sterilized Medical Restrooms", type: "restroom", x: 560, y: 225, w: 110, h: 65, cap: "Accessible Toilet & Shower" }
          ]
        }
      },
      bldg_hostels: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "hostel_g_warden", code: "WARDEN", name: "Chief Warden Secretariat & Desk", type: "office", x: 40, y: 75, w: 180, h: 85, cap: "Warden Desk & Security" },
            { id: "hostel_g_mess", code: "MESS", name: "Student Dining Mess & Kitchen", type: "amenity", x: 230, y: 75, w: 180, h: 85, cap: "350 Seater Dining" },
            { id: "hostel_g_common", code: "COMMON", name: "Recreation & TV Common Room", type: "amenity", x: 420, y: 75, w: 175, h: 125, cap: "Lounge & Board Games" },
            { id: "hostel_g_lift", code: "LIFT-H", name: "Resident Elevator Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "10 Persons Elevator" },
            { id: "hostel_g_stairs", code: "STAIRS-H", name: "Central Hostel Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Reinforced Staircase" },
            { id: "hostel_g_laundry", code: "LAUNDRY", name: "Automated Laundromat Bay", type: "amenity", x: 40, y: 225, w: 130, h: 65, cap: "12 Washing Machines" },
            { id: "hostel_g_study", code: "STUDY-G", name: "24-Hour Quiet Study Sanctuary", type: "library", x: 180, y: 225, w: 150, h: 65, cap: "Night Study Hall" },
            { id: "hostel_g_exit", code: "FIRE-EXIT", name: "Emergency Fire Exit Courtyard", type: "emergency_exit", x: 340, y: 235, w: 115, h: 55, cap: "Open Quad Egress", isExit: true },
            { id: "hostel_g_wc", code: "HOSTEL-WC", name: "Ground Shower & Washrooms", type: "restroom", x: 465, y: 225, w: 100, h: 65, cap: "Hot Water Facility" },
            { id: "hostel_g_store", code: "PARCEL", name: "Student Package & Parcel Desk", type: "amenity", x: 575, y: 225, w: 95, h: 65, cap: "Automated Delivery Locker" }
          ]
        },
        1: {
          name: "First Floor (Level 1)",
          rooms: [
            { id: "hostel_1_wing_a", code: "WING-A", name: "Resident Dorms (Rooms 101-104)", type: "classroom", x: 40, y: 75, w: 180, h: 85, cap: "Double Occupancy Pods" },
            { id: "hostel_1_wing_b", code: "WING-B", name: "Resident Dorms (Rooms 105-108)", type: "classroom", x: 230, y: 75, w: 180, h: 85, cap: "Double Occupancy Pods" },
            { id: "hostel_1_wing_c", code: "WING-C", name: "Resident Dorms (Rooms 109-112)", type: "classroom", x: 420, y: 75, w: 175, h: 125, cap: "Double Occupancy Pods" },
            { id: "hostel_1_lift", code: "LIFT-H", name: "Resident Elevator Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "10 Persons Elevator" },
            { id: "hostel_1_stairs", code: "STAIRS-H", name: "Central Hostel Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Reinforced Staircase" },
            { id: "hostel_1_warden", code: "NIGHT-POST", name: "Assistant Warden Night Station", type: "office", x: 40, y: 225, w: 130, h: 65, cap: "Floor Supervisor" },
            { id: "hostel_1_study", code: "STUDY-1", name: "Group Discussion Study Pods", type: "library", x: 180, y: 225, w: 150, h: 65, cap: "Whiteboard Desks" },
            { id: "hostel_1_exit", code: "FIRE-EXIT", name: "Fire Escape Stairwell North", type: "emergency_exit", x: 340, y: 235, w: 115, h: 55, cap: "External Steel Escape", isExit: true },
            { id: "hostel_1_wc", code: "HOSTEL-WC", name: "Level 1 Showers & Bathrooms", type: "restroom", x: 465, y: 225, w: 100, h: 65, cap: "Solar Heated Showers" },
            { id: "hostel_1_water", code: "H2O-1", name: "RO Water Dispenser Level 1", type: "amenity", x: 575, y: 225, w: 95, h: 65, cap: "Cold / Normal Purified" }
          ]
        },
        2: {
          name: "Second Floor (Level 2)",
          rooms: [
            { id: "hostel_2_wing_d", code: "WING-D", name: "Resident Dorms (Rooms 201-204)", type: "classroom", x: 40, y: 75, w: 180, h: 85, cap: "Double Occupancy Pods" },
            { id: "hostel_2_wing_e", code: "WING-E", name: "Resident Dorms (Rooms 205-208)", type: "classroom", x: 230, y: 75, w: 180, h: 85, cap: "Double Occupancy Pods" },
            { id: "hostel_2_wing_f", code: "WING-F", name: "Resident Dorms (Rooms 209-212)", type: "classroom", x: 420, y: 75, w: 175, h: 125, cap: "Double Occupancy Pods" },
            { id: "hostel_2_lift", code: "LIFT-H", name: "Resident Elevator Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, cap: "10 Persons Elevator" },
            { id: "hostel_2_stairs", code: "STAIRS-H", name: "Central Hostel Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, cap: "Reinforced Staircase" },
            { id: "hostel_2_gym", code: "TERRACE", name: "Open Air Fitness & Games Terrace", type: "amenity", x: 40, y: 225, w: 130, h: 65, cap: "Table Tennis & Pull-ups" },
            { id: "hostel_2_study", code: "STUDY-2", name: "Silent Project Workstation Pods", type: "library", x: 180, y: 225, w: 150, h: 65, cap: "Wi-Fi Hub Terminals" },
            { id: "hostel_2_exit", code: "FIRE-EXIT", name: "Roof Fire Escape Staging", type: "emergency_exit", x: 340, y: 235, w: 115, h: 55, cap: "Rooftop Staging Gate", isExit: true },
            { id: "hostel_2_wc", code: "HOSTEL-WC", name: "Level 2 Showers & Bathrooms", type: "restroom", x: 465, y: 225, w: 100, h: 65, cap: "Solar Heated Showers" },
            { id: "hostel_2_solar", code: "SOLAR", name: "Solar Heater & Plant Core", type: "amenity", x: 575, y: 225, w: 95, h: 65, cap: "Solar Thermal Monitoring" }
          ]
        }
      },
      bldg_gate: {
        0: {
          name: "Ground Floor (Level 0)",
          rooms: [
            { id: "gate_g_cmd", code: "SECURITY", name: "Central Security Command Post", type: "emergency", x: 40, y: 75, w: 190, h: 125, cap: "CCTV Control Matrix" },
            { id: "gate_g_visitor", code: "VISITOR", name: "Visitor Pass & RFID Badging", type: "office", x: 240, y: 75, w: 170, h: 125, cap: "Visitor Verification Desk" },
            { id: "gate_g_turnstile", code: "BARRIERS", name: "RFID Boom Barriers & Turnstiles", type: "lab", x: 420, y: 75, w: 130, h: 125, cap: "Biometric Access Gates" },
            { id: "gate_g_shuttle", code: "SHUTTLE", name: "Electric Campus Shuttle Dock", type: "amenity", x: 560, y: 75, w: 110, h: 125, cap: "E-Bus Rapid Boarding" },
            { id: "gate_g_lost", code: "LOST-FOUND", name: "Lost Property & Deliveries Desk", type: "office", x: 40, y: 225, w: 140, h: 65, cap: "Campus Courier Intake" },
            { id: "gate_g_permit", code: "PERMITS", name: "Vehicle Parking Permits", type: "office", x: 190, y: 225, w: 140, h: 65, cap: "FASTag Inspection Desk" },
            { id: "gate_g_exit", code: "FIRE-EXIT", name: "Perimeter Emergency Gate", type: "emergency_exit", x: 340, y: 235, w: 110, h: 55, cap: "Heavy Egress Gates", isExit: true },
            { id: "gate_g_patrol", code: "PATROL", name: "Mobile Patrol Vehicle Bay", type: "emergency", x: 460, y: 225, w: 100, h: 65, cap: "Rapid Response Unit" },
            { id: "gate_g_wc", code: "GATE-WC", name: "Security Staff Restrooms", type: "restroom", x: 570, y: 225, w: 100, h: 65, cap: "Dedicated Staff Toilet" }
          ]
        }
      }
    };

    // First check API cache, then fallback to multiFloorData
    const cacheKey = `${this.currentBuildingId}_${this.currentFloor}`;
    let currentFloorPlan = null;

    if (this.floorPlansCache.has(cacheKey)) {
      const cached = this.floorPlansCache.get(cacheKey);
      if (cached && cached.rooms) {
        currentFloorPlan = {
          name: cached.floorName || `Level ${this.currentFloor}`,
          rooms: cached.rooms
        };
      }
    }

    if (!currentFloorPlan) {
      const buildingPlans = multiFloorData[this.currentBuildingId] || multiFloorData.bldg_alpha;
      currentFloorPlan = buildingPlans[this.currentFloor] || buildingPlans[0] || {
        name: `Floor Level ${this.currentFloor}`,
        rooms: []
      };
    }

    let html = `
      <defs>
        <!-- Fine CAD coordinate grid -->
        <pattern id="cadGridFine" width="15" height="15" patternUnits="userSpaceOnUse">
          <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(56, 189, 248, 0.035)" stroke-width="0.8"/>
        </pattern>
        <!-- Major CAD structural grid lines -->
        <pattern id="cadGridMajor" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56, 189, 248, 0.08)" stroke-width="1.2"/>
          <circle cx="0" cy="0" r="1.5" fill="rgba(56, 189, 248, 0.25)"/>
        </pattern>
        <!-- Soft CAD elevation shadow -->
        <filter id="cadRoomShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" flood-color="#000" flood-opacity="0.5"/>
        </filter>
        <!-- Emergency glow filter -->
        <filter id="exitNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#ef4444" flood-opacity="0.6"/>
        </filter>
      </defs>

      <!-- Deep architectural canvas backdrop -->
      <rect width="760" height="410" fill="#090b10" />
      <rect width="760" height="410" fill="url(#cadGridFine)" />
      <rect width="760" height="410" fill="url(#cadGridMajor)" />

      <!-- Exterior Structural Reinforced Envelope (Concrete Shell) -->
      <rect x="20" y="16" width="720" height="376" rx="8" fill="#0d111a" stroke="#1a2130" stroke-width="6" />
      <rect x="24" y="20" width="712" height="368" rx="6" fill="#090d16" stroke="#242e42" stroke-width="2" />
      <rect x="27" y="23" width="706" height="362" rx="4" fill="none" stroke="rgba(255,107,53,0.12)" stroke-width="1" stroke-dasharray="8,6" />

      <!-- Exterior Window Slits (Top & Bottom Walls) -->
      ${[60, 160, 260, 360, 460, 560, 640].map(wx => `
        <line x1="${wx}" y1="20" x2="${wx + 45}" y2="20" stroke="#ff7a45" stroke-width="2.5" opacity="0.6"/>
        <line x1="${wx}" y1="388" x2="${wx + 45}" y2="388" stroke="#ff7a45" stroke-width="2.5" opacity="0.6"/>
      `).join("")}

      <!-- Top Header CAD Drawing Banner -->
      <g transform="translate(36, 42)">
        <text x="0" y="0" fill="#f8fafc" font-family="var(--font-sans)" font-size="13" font-weight="700" letter-spacing="0.4">ARCHITECTURAL CAD // ${bldg.name.toUpperCase()}</text>
        <text x="0" y="15" fill="#ff7a45" font-family="var(--font-mono)" font-size="10" font-weight="600" letter-spacing="0.5">${currentFloorPlan.name.toUpperCase()} • METRIC SCALE 1:100</text>
      </g>
      <!-- Oriented CAD Grid True North -->
      <g transform="translate(545, 42)">
        <rect x="-42" y="-14" width="84" height="24" rx="3" fill="#161b29" stroke="#242e42" stroke-width="1"/>
        <polygon points="-26,-6 -23,2 -29,2" fill="#ff7a45"/>
        <polygon points="-26,6 -23,-2 -29,-2" fill="#475569"/>
        <text x="6" y="2" fill="#94a3b8" font-family="var(--font-mono)" font-size="8.5" font-weight="600" text-anchor="middle">GRID NORTH</text>
      </g>
      <g transform="translate(714, 42)">
        <rect x="-115" y="-14" width="115" height="24" rx="3" fill="#161b29" stroke="#242e42" stroke-width="1"/>
        <text x="-57" y="2" fill="#94a3b8" font-family="var(--font-mono)" font-size="9" font-weight="600" text-anchor="middle">LEVEL ${this.currentFloor} PLAN</text>
      </g>

      <!-- Central Hallway Navigation Spine -->
      <rect x="30" y="164" width="670" height="46" fill="#0e131f" stroke="#1a2130" stroke-width="1.2" />
      <line x1="38" y1="187" x2="685" y2="187" stroke="#ff7a45" stroke-width="1.5" stroke-dasharray="6,8" opacity="0.38" />
      <g transform="translate(360, 191)">
        <text x="0" y="0" fill="#64748b" font-family="var(--font-mono)" font-size="8.5" font-weight="600" text-anchor="middle" letter-spacing="1">HALLWAY CIRCULATION SPINE // ADA COMPLIANT WAYPOINT</text>
      </g>

      <!-- Structural Column Grid Pillars (Concrete Stanchions with Cross Hatch) -->
      ${[35, 215, 405, 595, 715].flatMap(cx => [24, 164, 210, 382].map(cy => `
        <g transform="translate(${cx}, ${cy})">
          <rect x="-6" y="-6" width="12" height="12" fill="#161c2b" stroke="#242e42" stroke-width="1.2" opacity="0.9"/>
          <line x1="-6" y1="-6" x2="6" y2="6" stroke="#ff7a45" stroke-width="0.7" opacity="0.4"/>
          <line x1="6" y1="-6" x2="-6" y2="6" stroke="#ff7a45" stroke-width="0.7" opacity="0.4"/>
        </g>
      `)).join("")}

      <!-- Rooms Layer -->
      <g id="svg-indoor-rooms-layer">
    `;

    for (const r of currentFloorPlan.rooms) {
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const layout = this.calculateRoomLayout(r);

      // Color scheme based on room function (Rich Bespoke Architectural Palette)
      let fill = "#0e131e";
      let border = "#263044";
      let textAccent = "#94a3b8";
      let tagBg = "rgba(148, 163, 184, 0.12)";

      if (r.type === "lab") {
        fill = "#0a1526";
        border = "#1d4ed8";
        textAccent = "#60a5fa";
        tagBg = "rgba(37, 99, 235, 0.18)";
      } else if (r.type === "auditorium") {
        fill = "#1b1126";
        border = "#7e22ce";
        textAccent = "#c084fc";
        tagBg = "rgba(126, 34, 206, 0.18)";
      } else if (r.type === "restroom") {
        fill = "#081d1e";
        border = "#0f766e";
        textAccent = "#2dd4bf";
        tagBg = "rgba(15, 118, 110, 0.18)";
      } else if (r.type === "elevator" || r.type === "stairs") {
        fill = "#21160a";
        border = "#b45309";
        textAccent = "#fcd34d";
        tagBg = "rgba(217, 119, 6, 0.2)";
      } else if (r.type === "emergency_exit") {
        fill = "#260c14";
        border = "#e11d48";
        textAccent = "#fda4af";
        tagBg = "rgba(225, 29, 72, 0.22)";
      } else if (r.type === "amenity" || r.type === "food") {
        fill = "#22130a";
        border = "#c2410c";
        textAccent = "#fdba74";
        tagBg = "rgba(234, 88, 12, 0.2)";
      } else if (r.type === "emergency") {
        fill = "#220c15";
        border = "#be123c";
        textAccent = "#fda4af";
        tagBg = "rgba(190, 18, 60, 0.22)";
      }

      const isExit = layout.isExit;

      html += `
        <g class="svg-room-group" data-room-id="${r.id}" data-full-name="${r.name}" data-room-code="${r.code}" style="cursor: pointer;">
          <defs>
            <clipPath id="clip-room-${r.id}">
              <rect x="${r.x + 2}" y="${r.y + 2}" width="${r.w - 4}" height="${r.h - 4}" rx="3"/>
            </clipPath>
          </defs>

          <!-- Room CAD Footprint Wall -->
          <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" 
                rx="4" fill="${fill}" stroke="${border}" stroke-width="${isExit ? 2 : 1.5}" 
                filter="url(#${isExit ? "exitNeonGlow" : "cadRoomShadow"})" class="svg-cad-room"/>

          <!-- Elevator / Stairs Background Graphics -->
          ${r.type === "elevator" ? `
            <rect x="${r.x + 6}" y="${r.y + 6}" width="${r.w - 12}" height="${r.h - 12}" rx="2" fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="1.2"/>
            <line x1="${r.x + 6}" y1="${r.y + 6}" x2="${r.x + r.w - 6}" y2="${r.y + r.h - 6}" stroke="rgba(245,158,11,0.22)" stroke-width="1"/>
            <line x1="${r.x + r.w - 6}" y1="${r.y + 6}" x2="${r.x + 6}" y2="${r.y + r.h - 6}" stroke="rgba(245,158,11,0.22)" stroke-width="1"/>
            <rect x="${cx - 28}" y="${cy - 22}" width="56" height="44" fill="#0d111a" fill-opacity="0.9" rx="3" stroke="rgba(245,158,11,0.3)" stroke-width="0.8"/>
          ` : ""}

          ${r.type === "stairs" ? `
            ${(() => {
              let treads = "";
              for (let s = r.y + 10; s < r.y + r.h - 8; s += 7) {
                treads += `<line x1="${r.x + 6}" y1="${s}" x2="${r.x + r.w - 6}" y2="${s}" stroke="rgba(245,158,11,0.28)" stroke-width="1"/>`;
              }
              return treads;
            })()}
            <line x1="${cx}" y1="${r.y + r.h - 10}" x2="${cx}" y2="${r.y + 12}" stroke="#f59e0b" stroke-width="1.5" marker-end="url(#arrow)"/>
            <polyline points="${cx - 4},${r.y + 16} ${cx},${r.y + 10} ${cx + 4},${r.y + 16}" fill="none" stroke="#f59e0b" stroke-width="1.5"/>
            <rect x="${cx - 28}" y="${cy - 22}" width="56" height="44" fill="#0d111a" fill-opacity="0.9" rx="3" stroke="rgba(245,158,11,0.3)" stroke-width="0.8"/>
          ` : ""}

          <!-- Clipped Interior Room Details (Strict Box Boundary Guaranteed) -->
          <g clip-path="url(#clip-room-${r.id})">
            <!-- Inner Accent Stripe -->
            <rect x="${r.x + 2}" y="${r.y + 2}" width="${r.w - 4}" height="2.5" fill="${textAccent}" opacity="0.85" />

            <!-- Monospace Code Tag Pill -->
            <rect x="${cx - layout.codePillWidth / 2}" y="${cy + layout.codePillY}" width="${layout.codePillWidth}" height="14" rx="3" fill="${tagBg}" stroke="${border}" stroke-width="0.8"/>
            <text x="${cx}" y="${cy + layout.codePillY + 10}" fill="${textAccent}" font-family="var(--font-mono)" font-size="${layout.codeFontSize}" font-weight="700" text-anchor="middle">${r.code}</text>

            <!-- Room Title with Dynamic Word-Wrapping and Box Fitting -->
            <text x="${cx}" y="${cy + layout.titleStartY}" fill="#f8fafc" font-family="var(--font-sans)" font-size="${layout.titleFontSize}" font-weight="600" text-anchor="middle" class="svg-room-title">
              ${layout.lines.length === 1 ? layout.lines[0] : `
                <tspan x="${cx}" y="${cy + layout.titleStartY}">${layout.lines[0]}</tspan>
                <tspan x="${cx}" dy="11">${layout.lines[1]}</tspan>
              `}
            </text>

            <!-- Subtitle / Specification -->
            ${layout.showSub ? `
              <text x="${cx}" y="${cy + layout.subY}" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="500" text-anchor="middle" class="svg-room-sub">${layout.subText}</text>
            ` : ""}

            <!-- Emergency Exit Badge -->
            ${isExit ? `
              <g transform="translate(${cx}, ${cy + 15})">
                <rect x="-32" y="-6.5" width="64" height="13" rx="2" fill="#e11d48" opacity="0.95"/>
                <text x="0" y="3" fill="#ffffff" font-family="var(--font-mono)" font-size="7.5" font-weight="700" text-anchor="middle">EGRESS EXIT</text>
              </g>
            ` : ""}
          </g>
      `;

      // Architectural CAD Door Swing (90° Arc)
      if (r.y < 160) {
        // Upper room door swings down into hallway
        const doorX = r.x + Math.min(25, r.w - 30);
        const doorY = r.y + r.h;
        html += `
          <!-- Door Cutout Threshold -->
          <line x1="${doorX}" y1="${doorY}" x2="${doorX + 22}" y2="${doorY}" stroke="#0e131f" stroke-width="3"/>
          <!-- Door Leaf & Swing Arc -->
          <line x1="${doorX}" y1="${doorY}" x2="${doorX + 18}" y2="${doorY + 16}" stroke="${textAccent}" stroke-width="1.2"/>
          <path d="M ${doorX + 22} ${doorY} A 22 22 0 0 1 ${doorX + 18} ${doorY + 16}" fill="none" stroke="${textAccent}" stroke-width="0.8" stroke-dasharray="2,2"/>
        `;
      } else {
        // Lower room door swings up into hallway
        const doorX = r.x + Math.min(25, r.w - 30);
        const doorY = r.y;
        html += `
          <!-- Door Cutout Threshold -->
          <line x1="${doorX}" y1="${doorY}" x2="${doorX + 22}" y2="${doorY}" stroke="#0e131f" stroke-width="3"/>
          <!-- Door Leaf & Swing Arc -->
          <line x1="${doorX}" y1="${doorY}" x2="${doorX + 18}" y2="${doorY - 16}" stroke="${textAccent}" stroke-width="1.2"/>
          <path d="M ${doorX + 22} ${doorY} A 22 22 0 0 0 ${doorX + 18} ${doorY - 16}" fill="none" stroke="${textAccent}" stroke-width="0.8" stroke-dasharray="2,2"/>
        `;
      }

      html += `</g>`;
    }

    // CAD Blueprint Bottom Legend & Telemetry Bar
    html += `
      </g>
      <!-- CAD Bottom Bar -->
      <g transform="translate(32, 366)">
        <rect x="0" y="0" width="696" height="24" rx="3" fill="#0c111a" stroke="#1a2130" stroke-width="1"/>
        <g transform="translate(10, 15)">
          <circle cx="5" cy="-3.5" r="3" fill="#3b82f6"/>
          <text x="13" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">LAB / TECH</text>
          
          <circle cx="70" cy="-3.5" r="3" fill="#a855f7"/>
          <text x="78" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">HALL / AUD</text>

          <circle cx="134" cy="-3.5" r="3" fill="#64748b"/>
          <text x="142" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">OFFICE</text>

          <circle cx="182" cy="-3.5" r="3" fill="#14b8a6"/>
          <text x="190" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">RESTROOM</text>

          <circle cx="245" cy="-3.5" r="3" fill="#f59e0b"/>
          <text x="253" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">STAIRS / LIFT</text>

          <circle cx="320" cy="-3.5" r="3" fill="#ef4444"/>
          <text x="328" y="0" fill="#ef4444" font-family="var(--font-mono)" font-size="7.5" font-weight="700">FIRE EXIT</text>

          <line x1="384" y1="-9" x2="384" y2="4" stroke="#242e42" stroke-width="1"/>

          <circle cx="398" cy="-3.5" r="2.5" fill="#10b981"/>
          <text x="406" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">SPRINKLERS ARMED</text>

          <circle cx="505" cy="-3.5" r="2.5" fill="#f59e0b"/>
          <text x="513" y="0" fill="#94a3b8" font-family="var(--font-mono)" font-size="7.5" font-weight="600">HYDRANT STN 1</text>

          <rect x="595" y="-10" width="88" height="15" rx="2" fill="rgba(255,107,53,0.12)" stroke="#ff7a45" stroke-width="0.7"/>
          <circle cx="604" cy="-2.5" r="2.5" fill="#ff7a45"/>
          <text x="612" y="1" fill="#ff7a45" font-family="var(--font-mono)" font-size="7.5" font-weight="700">AED READY</text>
        </g>
      </g>
      <g id="svg-route-layer"></g>
      <g id="svg-incidents-layer"></g>
    `;

    this.svg.innerHTML = html;
    this.bindRoomClicks();
  }

  bindBuildingClicks() {
    const groups = this.svg.querySelectorAll(".svg-building-group");
    groups.forEach(g => {
      g.addEventListener("click", (e) => {
        e.stopPropagation();
        const bldgId = g.getAttribute("data-bldg-id");
        this.onBuildingClick(bldgId);
      });
    });
  }

  bindRoomClicks() {
    const rooms = this.svg.querySelectorAll(".svg-room-group");
    rooms.forEach(r => {
      r.addEventListener("click", (e) => {
        e.stopPropagation();
        const roomId = r.getAttribute("data-room-id");
        this.showPopoverForRoom(roomId, e.clientX, e.clientY);
      });
    });
  }

  showPopoverForRoom(roomId, screenX, screenY) {
    const tooltip = document.getElementById("map-tooltip");
    if (!tooltip) return;

    this.hideTooltip();

    // Retrieve room element or full title
    const roomEl = this.svg.querySelector(`.svg-room-group[data-room-id="${roomId}"]`);
    const roomTitleText = roomEl?.getAttribute("data-full-name") || (roomEl?.querySelector(".svg-room-title")?.textContent || roomId);
    const roomCodeText = roomEl?.getAttribute("data-room-code") || "";

    if (roomEl) {
      roomEl.querySelector(".svg-cad-room")?.classList.add("active");
    }

    const bldg = (this.buildings && this.buildings.find(b => b.id === this.currentBuildingId));
    const bldgName = bldg ? bldg.name : "Campus Building";

    tooltip.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: var(--accent-primary); background: var(--accent-primary-subtle); padding: 2px 7px; border-radius: 3px; border: 1px solid rgba(255,107,53,0.3);">${roomCodeText || "CAD NODE"}</span>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 10px; color: var(--text-muted); font-family: var(--font-mono);">LEVEL ${this.currentFloor}</span>
          <button id="pop-btn-close" aria-label="Close" title="Dismiss" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; line-height: 1;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #fff; margin-top: 5px; line-height: 1.3;">${roomTitleText}</div>
      <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${bldgName}</div>
      <div style="display: flex; gap: 6px; margin-top: 10px;">
        <button class="btn btn-primary" style="padding: 5px 9px; font-size: 11px; flex: 1;" id="pop-btn-dest">Set Target</button>
        <button class="btn btn-secondary" style="padding: 5px 9px; font-size: 11px; flex: 1;" id="pop-btn-report">Report Issue</button>
      </div>
    `;

    // Position relative to map viewport container
    const containerRect = this.container.getBoundingClientRect();
    const tooltipWidth = 240;
    const tooltipHeight = 135;

    let posX = screenX - containerRect.left + 12;
    let posY = screenY - containerRect.top + 12;

    if (posX + tooltipWidth > containerRect.width - 20) {
      posX = screenX - containerRect.left - tooltipWidth - 12;
    }
    if (posY + tooltipHeight > containerRect.height - 20) {
      posY = screenY - containerRect.top - tooltipHeight - 12;
    }

    tooltip.style.left = `${Math.max(12, posX)}px`;
    tooltip.style.top = `${Math.max(12, posY)}px`;
    tooltip.classList.add("active");

    // Stop click bubbling on the tooltip itself
    tooltip.onclick = (e) => e.stopPropagation();

    const closeBtn = document.getElementById("pop-btn-close");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.hideTooltip();
      };
      closeBtn.onmouseenter = () => closeBtn.style.color = "#ffffff";
      closeBtn.onmouseleave = () => closeBtn.style.color = "var(--text-muted)";
    }

    document.getElementById("pop-btn-dest").onclick = (e) => {
      e.stopPropagation();
      this.hideTooltip();
      this.onSelectDestination({ id: roomId, name: `${roomTitleText} (${bldgName}, Level ${this.currentFloor})` });
    };

    document.getElementById("pop-btn-report").onclick = (e) => {
      e.stopPropagation();
      this.hideTooltip();
      this.onReportAtLocation({
        buildingId: this.currentBuildingId,
        floor: this.currentFloor,
        locationName: `${roomTitleText} (${bldgName}, Level ${this.currentFloor})`
      });
    };
  }

  showPopoverForIncident(incident, screenX = null, screenY = null) {
    const tooltip = document.getElementById("map-tooltip");
    if (!tooltip) return;

    this.hideTooltip();

    const isCritical = incident.severity === "critical";
    const isHigh = incident.severity === "high";
    const color = isCritical ? "#ef4444" : isHigh ? "#f97316" : "#eab308";
    const colorBg = isCritical ? "rgba(239, 68, 68, 0.15)" : isHigh ? "rgba(249, 115, 22, 0.15)" : "rgba(234, 179, 8, 0.15)";
    const colorBorder = isCritical ? "rgba(239, 68, 68, 0.4)" : isHigh ? "rgba(249, 115, 22, 0.4)" : "rgba(234, 179, 8, 0.4)";

    // Check if current user has already accelerated this incident
    let acceleratedIds = new Set();
    try {
      const stored = localStorage.getItem("campuspulse_accelerated_ids");
      if (stored) acceleratedIds = new Set(JSON.parse(stored));
    } catch (e) {}

    const hasVoted = acceleratedIds.has(incident.id);
    const votes = incident.upvotes || 1;

    tooltip.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 700; color: ${color}; background: ${colorBg}; padding: 2px 7px; border-radius: 4px; border: 1px solid ${colorBorder};">
            ${incident.id}
          </span>
          <span class="badge ${incident.severity}" style="font-size: 9px; padding: 2px 6px; text-transform: uppercase;">
            ${incident.severity}
          </span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 9.5px; font-family: var(--font-mono); color: #94a3b8; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 3px;">
            ${incident.status}
          </span>
          <button id="inc-pop-close" aria-label="Close" title="Dismiss" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 2px; display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; line-height: 1;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>

      <div style="font-size: 13.5px; font-weight: 700; color: #ffffff; margin-top: 6px; line-height: 1.3;">
        ${incident.title}
      </div>

      <div style="font-size: 11px; color: var(--text-secondary); margin-top: 3px; display: flex; align-items: center; gap: 4px;">
        <svg style="width: 12px; height: 12px; flex-shrink: 0; color: var(--accent-primary);" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.4 7.6 11.9a0.6 0.6 0 0 0 .8 0C13 21.4 20 15.4 20 10a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${incident.locationName || "Campus Facility"}</span>
      </div>

      <div style="font-size: 11.5px; color: #cbd5e1; margin-top: 6px; line-height: 1.4; background: rgba(0,0,0,0.35); padding: 6px 8px; border-radius: 4px; border-left: 2.5px solid ${color};">
        ${incident.description}
      </div>

      <div style="display: flex; flex-direction: column; gap: 2px; margin-top: 6px; font-size: 10px; font-family: var(--font-mono); color: #64748b;">
        <div>Reporter: <span style="color: #cbd5e1;">${incident.reportedBy || "Campus Member"}</span></div>
        ${incident.assignedTo ? `<div>Dispatched: <span style="color: #38bdf8;">${incident.assignedTo}</span></div>` : ""}
      </div>

      <!-- Crowdsource Escalation Action Bar -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08);">
        <span style="font-size: 11px; font-weight: 600; color: #ff7a45; display: inline-flex; align-items: center; gap: 4px;">
          🔥 <span id="inc-pop-count">${votes}</span> Affected
        </span>
        <button id="inc-pop-btn-accel" class="btn ${hasVoted ? 'btn-secondary' : 'btn-primary'}" style="padding: 4px 10px; font-size: 10.5px; font-weight: 600; border-radius: 4px; ${hasVoted ? 'opacity: 0.75; cursor: default;' : ''}">
          ${hasVoted ? '✓ Impact Recorded' : '🔥 Impacts Me Too (+1)'}
        </button>
      </div>

      <!-- Quick Actions -->
      <div style="display: flex; gap: 6px; margin-top: 8px;">
        <button class="btn btn-secondary" style="padding: 5px 8px; font-size: 11px; flex: 1;" id="inc-pop-btn-dest">
          <svg style="width: 12px; height: 12px; margin-right: 4px; display: inline-block; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Set Target
        </button>
        <button class="btn btn-secondary" style="padding: 5px 8px; font-size: 11px; flex: 1;" id="inc-pop-btn-soc">
          <svg style="width: 12px; height: 12px; margin-right: 4px; display: inline-block; vertical-align: middle;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          View in SOC
        </button>
      </div>
    `;

    // Position popover intelligently relative to viewport
    const containerRect = this.container.getBoundingClientRect();
    const tooltipWidth = 280;
    const tooltipHeight = 240;

    let posX = 0;
    let posY = 0;

    if (screenX != null && screenY != null) {
      posX = screenX - containerRect.left + 14;
      posY = screenY - containerRect.top + 14;
    } else {
      let ix = incident.coordinates ? incident.coordinates.x : 500;
      let iy = incident.coordinates ? incident.coordinates.y : 350;
      if (this.viewMode === "INDOOR") {
        ix = (incident.id === "INC-1001") ? 125 : (incident.id === "INC-1004") ? 465 : 220;
        iy = (incident.id === "INC-1004") ? 245 : 188;
      }
      const calcScreenX = containerRect.left + this.panX + (ix * this.scale);
      const calcScreenY = containerRect.top + this.panY + (iy * this.scale);
      posX = calcScreenX - containerRect.left + 14;
      posY = calcScreenY - containerRect.top + 14;
    }

    if (posX + tooltipWidth > containerRect.width - 20) {
      posX = posX - tooltipWidth - 28;
    }
    if (posY + tooltipHeight > containerRect.height - 20) {
      posY = posY - tooltipHeight - 28;
    }

    tooltip.style.left = `${Math.max(14, posX)}px`;
    tooltip.style.top = `${Math.max(14, posY)}px`;
    tooltip.classList.add("active");

    // Stop click bubbling on the tooltip itself
    tooltip.onclick = (e) => e.stopPropagation();

    // Close button
    const closeBtn = document.getElementById("inc-pop-close");
    if (closeBtn) {
      closeBtn.onclick = (e) => {
        e.stopPropagation();
        this.hideTooltip();
      };
      closeBtn.onmouseenter = () => closeBtn.style.color = "#ffffff";
      closeBtn.onmouseleave = () => closeBtn.style.color = "var(--text-muted)";
    }

    // Crowdsource Accelerate Button
    const accelBtn = document.getElementById("inc-pop-btn-accel");
    if (accelBtn) {
      accelBtn.onclick = async (e) => {
        e.stopPropagation();
        if (acceleratedIds.has(incident.id)) {
          if (window.showAppToast) window.showAppToast("You have already amplified this issue!");
          return;
        }

        try {
          acceleratedIds.add(incident.id);
          localStorage.setItem("campuspulse_accelerated_ids", JSON.stringify([...acceleratedIds]));
          accelBtn.classList.remove("btn-primary");
          accelBtn.classList.add("btn-secondary");
          accelBtn.style.opacity = "0.75";
          accelBtn.style.cursor = "default";
          accelBtn.textContent = "✓ Impact Recorded";

          incident.upvotes = (incident.upvotes || 1) + 1;
          const countEl = document.getElementById("inc-pop-count");
          if (countEl) countEl.textContent = incident.upvotes;

          if (window.SoundEngine) window.SoundEngine.playPing();

          const res = await API.accelerateIncident(incident.id);
          if (res && res.success) {
            if (window.showAppToast) window.showAppToast(res.message);
            if (window.incidentsManager) await window.incidentsManager.refreshIncidents();
          }
        } catch (err) {
          console.error("Failed to accelerate incident:", err);
        }
      };
    }

    // Set Target Navigation Button
    const destBtn = document.getElementById("inc-pop-btn-dest");
    if (destBtn) {
      destBtn.onclick = (e) => {
        e.stopPropagation();
        this.hideTooltip();
        this.onSelectDestination({
          id: incident.nodeId || incident.id,
          name: `${incident.title} (${incident.locationName})`
        });
      };
    }

    // View in SOC Button
    const socBtn = document.getElementById("inc-pop-btn-soc");
    if (socBtn) {
      socBtn.onclick = (e) => {
        e.stopPropagation();
        this.hideTooltip();
        // Switch to incidents tab in sidebar
        const incTabBtn = document.querySelector('.nav-tab-btn[data-tab="tab-incidents"]');
        if (incTabBtn) incTabBtn.click();
        // Highlight in feed
        setTimeout(() => {
          const feedItem = document.querySelector(`.incident-item[data-inc-id="${incident.id}"]`);
          if (feedItem) {
            feedItem.scrollIntoView({ behavior: "smooth", block: "center" });
            feedItem.style.boxShadow = "0 0 16px var(--accent-primary)";
            setTimeout(() => feedItem.style.boxShadow = "", 1500);
          }
        }, 150);
      };
    }
  }

  renderIncidents() {
    const layer = document.getElementById("svg-incidents-layer");
    if (!layer) return;

    if (!this.layers.incidents) {
      layer.innerHTML = "";
      return;
    }

    let html = "";
    for (const inc of this.incidents) {
      if (inc.status === "Resolved") continue;
      
      // If in indoor mode, only show incidents for this building and this floor level!
      if (this.viewMode === "INDOOR") {
        if (inc.buildingId !== this.currentBuildingId) continue;
        if (inc.floor != null && inc.floor !== this.currentFloor) continue;
      }

      // Calculate coordinates (outdoor vs indoor scaled)
      let x = inc.coordinates.x;
      let y = inc.coordinates.y;

      if (this.viewMode === "INDOOR") {
        if (inc.id === "INC-1001") {
          x = 125; y = 188; // Corridor near room 201
        } else if (inc.id === "INC-1002") {
          x = 240; y = 188;
        } else if (inc.id === "INC-1003") {
          x = 200; y = 188;
        } else if (inc.id === "INC-1004") {
          x = 465; y = 245; // Fire exit south
        } else {
          x = 180; y = 188;
        }
      }

      const isCritical = inc.severity === "critical";
      const color = isCritical ? "#ef4444" : inc.severity === "high" ? "#f97316" : "#eab308";

      html += `
        <g class="svg-pin-incident" data-inc-id="${inc.id}" transform="translate(${x}, ${y})" style="cursor: pointer;">
          <!-- Animated Radar Beacon Waves -->
          <circle cx="0" cy="0" r="14" fill="${color}" fill-opacity="0.2">
            <animate attributeName="r" values="8;20;8" dur="2.2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.6;0;0.6" dur="2.2s" repeatCount="indefinite"/>
          </circle>
          <circle cx="0" cy="0" r="9" fill="${color}" fill-opacity="0.35"/>
          <circle cx="0" cy="0" r="4.8" fill="${color}" stroke="#ffffff" stroke-width="1.8" />
        </g>
      `;
    }

    layer.innerHTML = html;

    layer.querySelectorAll(".svg-pin-incident").forEach(pin => {
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        const incId = pin.getAttribute("data-inc-id");
        const incident = this.incidents.find(i => i.id === incId);
        if (incident) {
          this.showPopoverForIncident(incident, e.clientX, e.clientY);
          if (this.onIncidentClick) {
            this.onIncidentClick(incident);
          }
        }
      });
    });
  }

  renderEvents() {
    const layer = document.getElementById("svg-events-layer");
    if (!layer) return;

    if (!this.layers.events || this.viewMode !== "OUTDOOR") {
      layer.innerHTML = "";
      return;
    }

    let html = "";
    for (const evt of this.events) {
      html += `
        <g transform="translate(${evt.x}, ${evt.y})">
          <circle cx="0" cy="0" r="10" fill="#ff7a45" fill-opacity="0.2"/>
          <circle cx="0" cy="0" r="4.5" fill="#ff7a45" stroke="#ffffff" stroke-width="1.5"/>
          <rect x="8" y="-10" width="110" height="18" rx="3" fill="#161b29" stroke="#242e42"/>
          <text x="14" y="2.5" fill="#f8fafc" font-family="var(--font-mono)" font-size="8" font-weight="600">${evt.title.split(":")[0]}</text>
        </g>
      `;
    }

    layer.innerHTML = html;
  }

  renderRoute() {
    const layer = document.getElementById("svg-route-layer");
    if (!layer || !this.currentRoute) return;

    const { nodes, isEvacuation, accessibleOnly } = this.currentRoute;
    if (!nodes || nodes.length < 2) return;

    let pathD = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      pathD += ` L ${nodes[i].x} ${nodes[i].y}`;
    }

    let lineClass = "svg-route-line";
    if (isEvacuation) lineClass += " evacuation";
    else if (accessibleOnly) lineClass += " accessible";

    const startNode = nodes[0];
    const endNode = nodes[nodes.length - 1];

    layer.innerHTML = `
      <path d="${pathD}" class="${lineClass}" />

      <g transform="translate(${startNode.x}, ${startNode.y})">
        <circle cx="0" cy="0" r="8" fill="#ff7a45" fill-opacity="0.35"/>
        <circle cx="0" cy="0" r="4.5" fill="#ff7a45" stroke="#ffffff" stroke-width="1.5"/>
      </g>

      <g transform="translate(${endNode.x}, ${endNode.y})">
        <circle cx="0" cy="0" r="9" fill="${isEvacuation ? "#f43f5e" : "#10b981"}" fill-opacity="0.35"/>
        <circle cx="0" cy="0" r="5" fill="${isEvacuation ? "#f43f5e" : "#10b981"}" stroke="#ffffff" stroke-width="1.5"/>
      </g>
    `;
  }
}
