// Enterprise Master Application Controller
import { API } from "./api.js";
import { CampusMapEngine } from "./map.js";
import { NavigationController } from "./navigation.js";
import { IncidentsManager } from "./incidents.js";
import { AdminCommandCenter } from "./admin.js";
import { SoundEngine } from "./audio.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initializing CampusPulse Enterprise Spatial System...");

  // 1. Initialize Map Engine
  const mapEngine = new CampusMapEngine("map-viewport-container");

  // 2. Initialize Subsystems
  const navCtrl = new NavigationController(mapEngine);
  const incidentsMgr = new IncidentsManager(mapEngine);
  const adminCenter = new AdminCommandCenter(mapEngine);

  window.SoundEngine = SoundEngine;
  window.mapEngine = mapEngine;
  window.incidentsManager = incidentsMgr;
  window.navigationController = navCtrl;

  // 3. Telemetry Sync Status
  const wsStatusPill = document.getElementById("ws-status-pill");
  const wsStatusText = document.getElementById("ws-status-text");

  API.initWebSocket((isConnected) => {
    if (isConnected) {
      wsStatusPill.classList.remove("disconnected");
      wsStatusText.textContent = "Telemetry Synced";
    } else {
      wsStatusPill.classList.add("disconnected");
      wsStatusText.textContent = "Connecting...";
    }
  });

  // 4. Fetch Campus Metadata & Events
  try {
    const [infoRes, bldgRes, evtRes] = await Promise.all([
      API.getCampusInfo(),
      API.getBuildings(),
      API.getEvents()
    ]);

    if (infoRes.success && bldgRes.success && evtRes.success) {
      mapEngine.setData({
        campusInfo: infoRes.campus,
        buildings: bldgRes.buildings,
        events: evtRes.events
      });

      renderCampusEvents(evtRes.events, navCtrl);
    }
  } catch (err) {
    console.error("Initial data load error:", err);
  }

  // 5. Sidebar Navigation Tabs
  const tabBtns = document.querySelectorAll(".nav-tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      mapEngine.hideTooltip();
      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-tab");
      const targetPane = document.getElementById(targetId);
      if (targetPane) targetPane.classList.add("active");
    });
  });

  // 6. Sidebar Collapse / Expand Toggle
  const panel = document.getElementById("floating-panel");
  const panelToggleBtn = document.getElementById("panel-toggle-btn");
  if (panelToggleBtn) {
    panelToggleBtn.addEventListener("click", () => {
      panel.classList.toggle("collapsed");
      panelToggleBtn.innerHTML = panel.classList.contains("collapsed") ? 
        `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>` : 
        `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
    });
  }

  // 7. Role Switcher (Student Navigator vs Admin SOC)
  const roleStudentBtn = document.getElementById("role-btn-student");
  const roleAdminBtn = document.getElementById("role-btn-admin");
  const adminView = document.getElementById("admin-command-view");

  roleStudentBtn.addEventListener("click", () => {
    roleStudentBtn.classList.add("active");
    roleAdminBtn.classList.remove("active");
    adminView.classList.add("hidden");
  });

  roleAdminBtn.addEventListener("click", () => {
    roleAdminBtn.classList.add("active");
    roleStudentBtn.classList.remove("active");
    adminView.classList.remove("hidden");
    adminCenter.refreshData();
  });

  // Helper: Floating Glassmorphic Toast Notification
  function showToast(message, iconSvg = null) {
    window.showAppToast = showToast;
    let container = document.getElementById("app-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "app-toast-container";
      container.className = "app-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "app-toast";
    const defaultIcon = `<svg class="icon icon-sm" style="color: #38bdf8;" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`;
    toast.innerHTML = `
      ${iconSvg || defaultIcon}
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("fade-out");
      setTimeout(() => {
        toast.remove();
        if (container && container.children.length === 0) {
          container.remove();
        }
      }, 250);
    }, 2200);
  }

  // Campus Home Reset Triggered by clicking CampusPulse Logo
  function handleCampusHomeReset() {
    const brandBtn = document.getElementById("brand-home-btn");
    if (brandBtn) {
      brandBtn.classList.remove("brand-pulsing");
      void brandBtn.offsetWidth; // Force reflow to re-trigger pulse animation
      brandBtn.classList.add("brand-pulsing");
      setTimeout(() => brandBtn.classList.remove("brand-pulsing"), 600);
    }

    // Dismiss any active room/node popover
    mapEngine.hideTooltip();

    // 1. If currently inside Command SOC Admin mode, switch back to Navigation
    if (!adminView.classList.contains("hidden")) {
      roleStudentBtn.classList.add("active");
      roleAdminBtn.classList.remove("active");
      adminView.classList.add("hidden");
    }

    // 2. Reset Map: exit indoor mode if open, and fly camera smoothly to campus center
    if (mapEngine.viewMode === "INDOOR") {
      mapEngine.showOutdoorView(true);
    } else {
      mapEngine.resetView(true);
    }

    // 3. Clear active navigation route & turn directions
    navCtrl.clearRoute();

    // 4. Clear search input & autocomplete dropdown
    const searchInput = document.getElementById("global-search-input");
    const searchDropdown = document.getElementById("search-results-dropdown");
    if (searchInput) searchInput.value = "";
    if (searchDropdown) {
      searchDropdown.classList.remove("active");
      searchDropdown.innerHTML = "";
    }

    // 5. Return sidebar to Directions/Navigation tab
    const navTab = document.querySelector('[data-tab="tab-nav"]');
    if (navTab && !navTab.classList.contains("active")) {
      navTab.click();
    }

    // 6. Ensure sidebar panel is open
    if (panel && panel.classList.contains("collapsed")) {
      panel.classList.remove("collapsed");
      if (panelToggleBtn) {
        panelToggleBtn.innerHTML = `<svg class="icon icon-sm" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>`;
      }
    }

    // 7. Tactical Audio Feedback
    SoundEngine.playHomeChime();

    // 8. Visual Toast Feedback
    showToast("Campus overview restored");
  }

  // CampusPulse Brand Logo Click & Keyboard Navigation
  const brandHomeBtn = document.getElementById("brand-home-btn");
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener("click", handleCampusHomeReset);
    brandHomeBtn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleCampusHomeReset();
      }
    });
  }

  // 8. Map Action Controls
  document.getElementById("btn-zoom-in").addEventListener("click", () => mapEngine.zoomIn());
  document.getElementById("btn-zoom-out").addEventListener("click", () => mapEngine.zoomOut());
  document.getElementById("btn-reset-view").addEventListener("click", () => {
    mapEngine.resetView(true);
    showToast("Camera centered");
  });
  document.getElementById("btn-exit-indoor").addEventListener("click", () => {
    mapEngine.showOutdoorView(true);
    showToast("Exited indoor floor plan");
  });

  // 9. Map Layers Checkboxes
  document.getElementById("layer-incidents").addEventListener("change", (e) => {
    mapEngine.setLayerVisibility("incidents", e.target.checked);
  });
  document.getElementById("layer-events").addEventListener("change", (e) => {
    mapEngine.setLayerVisibility("events", e.target.checked);
  });

  // 10. Building Click Event on Map
  mapEngine.onBuildingClick = (bldgId) => {
    mapEngine.showIndoorView(bldgId, 0);
  };

  // 11. Global Search & Autocomplete
  setupGlobalSearch(navCtrl, mapEngine);

  // 12. Keyboard Shortcut (Ctrl+K or Cmd+K) to focus search
  window.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      document.getElementById("global-search-input").focus();
    }
  });

  // 13. Live Emergency Broadcast Banner Listener
  const emergencyBanner = document.getElementById("emergency-banner");
  const bannerText = document.getElementById("banner-message-text");
  const bannerCloseBtn = document.getElementById("btn-close-banner");

  API.on("CAMPUS_BROADCAST", (broadcast) => {
    if (broadcast && broadcast.message) {
      bannerText.textContent = `${broadcast.title}: ${broadcast.message}`;
      emergencyBanner.classList.remove("hidden");
    }
  });

  API.on("CLEAR_BROADCAST", () => {
    emergencyBanner.classList.add("hidden");
  });

  if (bannerCloseBtn) {
    bannerCloseBtn.addEventListener("click", () => {
      emergencyBanner.classList.add("hidden");
    });
  }
});

// Render Campus Events in Directory Tab
function renderCampusEvents(events, navCtrl) {
  const container = document.getElementById("events-list-container");
  if (!container) return;

  container.innerHTML = events.map(evt => `
    <div class="ui-card" style="border-left: 2.5px solid ${evt.color};">
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <span style="font-family: var(--font-mono); font-size: 10px; font-weight: 600; color: ${evt.color}; text-transform: uppercase;">${evt.badge}</span>
        <span style="font-family: var(--font-mono); font-size: 10.5px; color: var(--text-muted);">${evt.time}</span>
      </div>
      <div style="font-weight: 600; font-size: 13px; color: var(--text-primary); line-height: 1.3;">${evt.title}</div>
      <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.4;">${evt.description}</div>
      <div style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">${evt.locationName}</div>
      
      <div style="display: flex; gap: 6px; margin-top: 4px; flex-wrap: wrap;">
        <button class="btn btn-primary" style="flex: 1; min-width: 100px; padding: 5px 10px; font-size: 11.5px;" onclick="window.navigateDirectly('${evt.buildingId}')">
          Route to Venue
        </button>
        ${evt.unstopUrl ? `
          <a href="${evt.unstopUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="text-decoration: none; padding: 5px 10px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
            <svg class="icon icon-sm" viewBox="0 0 24 24" style="width: 12px; height: 12px;"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Unstop
          </a>
        ` : ""}
        ${evt.whatsappUrl ? `
          <a href="${evt.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="text-decoration: none; padding: 5px 10px; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
            Community
          </a>
        ` : ""}
      </div>
    </div>
  `).join("");

  window.navigateDirectly = (buildingId) => {
    const navTab = document.querySelector('[data-tab="tab-nav"]');
    if (navTab) navTab.click();
    const panel = document.getElementById("floating-panel");
    if (panel) panel.classList.remove("collapsed");

    if (buildingId === "bldg_delta") {
      navCtrl.setDestination("node_delta_hack_arena");
    } else if (buildingId === "bldg_alpha") {
      navCtrl.setDestination("node_alpha_f1_ai_lab");
    } else {
      navCtrl.setDestination("node_cent_junc");
    }
    navCtrl.runNavigation();
  };
}

// Global Autocomplete Search
function setupGlobalSearch(navCtrl, mapEngine) {
  const input = document.getElementById("global-search-input");
  const dropdown = document.getElementById("search-results-dropdown");

  let debounceTimer = null;

  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    const query = e.target.value.trim();

    if (query.length === 0) {
      dropdown.classList.remove("active");
      dropdown.innerHTML = "";
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await API.getPOIs(query);
        if (res.success && res.pois.length > 0) {
          dropdown.innerHTML = res.pois.map(p => `
            <div class="search-result-item" data-node-id="${p.nodeId}">
              <div>
                <div class="item-title">${p.name}</div>
                <div class="item-sub">${p.building} • Floor ${p.floor}</div>
              </div>
              <span class="item-tag">${p.category}</span>
            </div>
          `).join("");

          dropdown.classList.add("active");

          dropdown.querySelectorAll(".search-result-item").forEach(item => {
            item.addEventListener("click", () => {
              const nodeId = item.getAttribute("data-node-id");
              input.value = item.querySelector(".item-title").textContent;
              dropdown.classList.remove("active");

              const navTab = document.querySelector('[data-tab="tab-nav"]');
              if (navTab) navTab.click();
              const panel = document.getElementById("floating-panel");
              if (panel) panel.classList.remove("collapsed");

              navCtrl.setDestination(nodeId);
              navCtrl.runNavigation();
            });
          });
        } else {
          dropdown.innerHTML = `<div style="padding: 12px; font-size: 11.5px; color: var(--text-muted); text-align: center;">No campus records match "${query}"</div>`;
          dropdown.classList.add("active");
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    }, 180);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      dropdown.classList.remove("active");
    }
  });
}
