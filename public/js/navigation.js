// Enterprise Route Planning & Guidance Controller
import { API } from "./api.js";
import { SoundEngine } from "./audio.js";

export class NavigationController {
  constructor(mapEngine) {
    this.map = mapEngine;

    this.startId = "node_gate";
    this.destinationId = "node_delta_hack_arena";
    this.accessibleOnly = false;
    this.avoidHazards = true;
    this.isEvacuation = false;

    this.pois = [];
    this.activeRoute = null;

    this.initUI();
  }

  async initUI() {
    this.startSelect = document.getElementById("nav-start-select");
    this.destSelect = document.getElementById("nav-dest-select");
    this.accessibleToggle = document.getElementById("toggle-accessible");
    this.hazardToggle = document.getElementById("toggle-hazard-avoidance");
    this.evacuateBtn = document.getElementById("btn-emergency-evacuate");
    this.calculateBtn = document.getElementById("btn-calculate-route");
    this.clearBtn = document.getElementById("btn-clear-route");
    this.routeSummaryCard = document.getElementById("route-summary-card");
    this.turnStepsList = document.getElementById("turn-steps-list");

    this.populateDropdowns();

    try {
      const res = await API.getPOIs();
      if (res.success && res.pois.length > 0) {
        this.pois = res.pois;
        this.populateDropdowns();
      }
    } catch (e) {
      console.warn("Using default POIs:", e);
    }

    if (this.calculateBtn) {
      this.calculateBtn.addEventListener("click", () => this.runNavigation());
    }
    if (this.clearBtn) {
      this.clearBtn.addEventListener("click", () => this.clearRoute());
    }
    
    if (this.accessibleToggle) {
      this.accessibleToggle.addEventListener("change", (e) => {
        this.accessibleOnly = e.target.checked;
        if (this.activeRoute) this.runNavigation();
      });
    }

    if (this.hazardToggle) {
      this.hazardToggle.addEventListener("change", (e) => {
        this.avoidHazards = e.target.checked;
        if (this.activeRoute) this.runNavigation();
      });
    }

    if (this.evacuateBtn) {
      this.evacuateBtn.addEventListener("click", () => {
        this.isEvacuation = true;
        this.runNavigation(true);
      });
    }

    this.map.onSelectDestination = (dest) => {
      this.setDestination(dest.id || dest.nodeId);
      this.runNavigation();
    };
  }

  populateDropdowns() {
    const defaultStarts = [
      { id: "node_gate", name: "Campus Main Gate A" },
      { id: "node_alpha_ent_s", name: "Alpha Block South Entrance" },
      { id: "node_beta_ent_s", name: "Beta Block Plaza" },
      { id: "node_delta_ent_w", name: "Delta Complex Entrance" },
      { id: "node_food_ent_e", name: "Campus Food Court" }
    ];

    if (this.startSelect) {
      this.startSelect.innerHTML = defaultStarts.map(s => 
        `<option value="${s.id}" ${s.id === this.startId ? "selected" : ""}>${s.name}</option>`
      ).join("");

      this.startSelect.addEventListener("change", (e) => {
        this.startId = e.target.value;
      });
    }

    const availablePOIs = (this.pois && this.pois.length > 0) ? this.pois : [
      { nodeId: "node_delta_hack_arena", name: "Tech Pulse 2026 Hackathon Arena (Delta Complex)" },
      { nodeId: "node_alpha_f1_ai_lab", name: "AI & Neural Networks Lab (Alpha Block Floor 1)" },
      { nodeId: "node_alpha_f2_cyber_lab", name: "Cybersecurity & Forensic Lab (Alpha Block Floor 2)" },
      { nodeId: "node_gamma_f0_corridor", name: "Central Digital Library (Gamma Block)" },
      { nodeId: "node_food_ent_e", name: "Campus Food Court & Cafeteria" },
      { nodeId: "node_health_ent_w", name: "Campus Health Center (Clinic & First Aid)" },
      { nodeId: "node_sports_ent_s", name: "Sports Arena & Gymnasium" }
    ];

    if (this.destSelect) {
      this.destSelect.innerHTML = availablePOIs.map(p => {
        const isSelected = p.nodeId === this.destinationId || (p.id && p.id === "poi_hackathon");
        return `<option value="${p.nodeId}" ${isSelected ? "selected" : ""}>${p.name}</option>`;
      }).join("");

      this.destSelect.addEventListener("change", (e) => {
        this.destinationId = e.target.value;
        this.isEvacuation = false;
      });
    }
  }

  setDestination(nodeId) {
    this.destinationId = nodeId;
    if (this.destSelect) {
      let found = false;
      for (const opt of this.destSelect.options) {
        if (opt.value === nodeId) {
          opt.selected = true;
          found = true;
          break;
        }
      }
      if (!found) {
        const opt = document.createElement("option");
        opt.value = nodeId;
        opt.textContent = `Target Point (${nodeId})`;
        opt.selected = true;
        this.destSelect.appendChild(opt);
      }
    }
  }

  async runNavigation(isEvac = false) {
    const dest = isEvac ? null : (this.destSelect && this.destSelect.value ? this.destSelect.value : this.destinationId);
    const start = (this.startSelect && this.startSelect.value) ? this.startSelect.value : this.startId;

    try {
      if (this.calculateBtn) {
        this.calculateBtn.disabled = true;
        this.calculateBtn.textContent = "Routing...";
      }

      const res = await API.calculateRoute({
        startId: start,
        destinationId: dest,
        accessibleOnly: this.accessibleOnly,
        avoidHazards: this.avoidHazards,
        isEvacuation: isEvac
      });

      if (!res.success) {
        alert(res.error || "Route calculation failed.");
        return;
      }

      this.activeRoute = res.route;
      this.map.setRoute(res.route);

      try {
        SoundEngine.playRouteChime();
      } catch (e) {
        console.warn("Audio warning:", e);
      }

      this.renderSummary(res.route);

    } catch (err) {
      console.error("Navigation error:", err);
    } finally {
      if (this.calculateBtn) {
        this.calculateBtn.disabled = false;
        this.calculateBtn.innerHTML = `
          <svg class="icon icon-sm" viewBox="0 0 24 24"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
          Calculate Route
        `;
      }
    }
  }

  renderSummary(route) {
    if (!this.routeSummaryCard) return;
    this.routeSummaryCard.style.display = "flex";

    document.getElementById("route-dist-val").textContent = `${route.totalDistanceMeters} m`;
    document.getElementById("route-time-val").textContent = `~${route.estimatedWalkTimeMinutes} min ETA`;

    const hazardNotice = document.getElementById("hazard-warning-badge");
    if (hazardNotice) {
      if (route.avoidedIncidentsCount > 0) {
        hazardNotice.style.display = "block";
        hazardNotice.textContent = `Hazard alert: Rerouted around ${route.avoidedIncidentsCount} active campus inspection zone(s).`;
      } else {
        hazardNotice.style.display = "none";
      }
    }

    if (this.turnStepsList) {
      this.turnStepsList.innerHTML = route.steps.map((s, idx) => {
        let iconSvg = `<svg class="icon icon-sm" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`;
        if (s.type === "lift") {
          iconSvg = `<svg class="icon icon-sm" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="8 12 12 8 16 12"/></svg>`;
        } else if (s.type === "stairs") {
          iconSvg = `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="6 20 6 14 12 14 12 8 18 8 18 2"/></svg>`;
        } else if (s.type === "destination") {
          iconSvg = `<svg class="icon icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;
        } else if (s.type === "emergency") {
          iconSvg = `<svg class="icon icon-sm" viewBox="0 0 24 24" style="color: #ef4444;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        }

        return `
          <div class="turn-step-row">
            <div class="turn-step-icon">${iconSvg}</div>
            <div style="flex: 1;">
              <div class="turn-step-text">${s.text}</div>
              ${s.distance > 0 ? `<div class="turn-step-dist">${s.distance} m</div>` : ""}
            </div>
          </div>
        `;
      }).join("");
    }
  }

  clearRoute() {
    this.activeRoute = null;
    this.isEvacuation = false;
    this.map.clearRoute();
    if (this.routeSummaryCard) {
      this.routeSummaryCard.style.display = "none";
    }
  }
}
