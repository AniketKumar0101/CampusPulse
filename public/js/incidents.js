// Enterprise Incident Management & Field Reporting Controller
import { API } from "./api.js";
import { SoundEngine } from "./audio.js";

export class IncidentsManager {
  constructor(mapEngine) {
    this.map = mapEngine;
    this.incidents = [];
    this.selectedCategory = "hazard";
    this.selectedSeverity = "medium";
    this.acceleratedIds = new Set(JSON.parse(localStorage.getItem("campuspulse_accelerated_ids") || "[]"));

    this.initUI();
  }

  async initUI() {
    this.feedContainer = document.getElementById("incidents-feed-list");
    this.reportModal = document.getElementById("report-incident-modal");
    this.sosModal = document.getElementById("sos-modal");

    this.openReportBtn = document.getElementById("btn-open-report-modal");
    this.closeReportBtn = document.getElementById("btn-close-report-modal");
    this.cancelReportBtn = document.getElementById("btn-cancel-report");
    this.submitReportBtn = document.getElementById("btn-submit-report");

    this.sosHeaderBtn = document.getElementById("btn-sos-panic");
    this.closeSosBtn = document.getElementById("btn-close-sos-modal");
    this.confirmSosBtn = document.getElementById("btn-confirm-sos-panic");

    this.photoInput = document.getElementById("incident-photo-input");
    this.photoPreview = document.getElementById("incident-photo-preview");

    // Category Buttons
    const catButtons = document.querySelectorAll(".category-pill-btn");
    catButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        catButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedCategory = btn.getAttribute("data-category");
      });
    });

    // Severity Buttons
    const sevButtons = document.querySelectorAll(".sev-btn");
    sevButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        sevButtons.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedSeverity = btn.getAttribute("data-severity");
      });
    });

    // Photo input preview
    if (this.photoInput) {
      this.photoInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            this.photoPreview.src = re.target.result;
            this.photoPreview.classList.add("active");
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Modal open/close bindings
    if (this.openReportBtn) this.openReportBtn.addEventListener("click", () => this.openReportModal());
    if (this.closeReportBtn) this.closeReportBtn.addEventListener("click", () => this.closeReportModal());
    if (this.cancelReportBtn) this.cancelReportBtn.addEventListener("click", () => this.closeReportModal());
    if (this.submitReportBtn) this.submitReportBtn.addEventListener("click", () => this.submitReport());

    // SOS modal bindings
    if (this.sosHeaderBtn) {
      this.sosHeaderBtn.addEventListener("click", () => {
        this.sosModal.classList.add("active");
      });
    }
    if (this.closeSosBtn) {
      this.closeSosBtn.addEventListener("click", () => {
        this.sosModal.classList.remove("active");
      });
    }
    if (this.confirmSosBtn) {
      this.confirmSosBtn.addEventListener("click", () => this.triggerSOSPanic());
    }

    await this.refreshIncidents();

    // WebSocket Listeners
    API.on("NEW_INCIDENT", (newInc) => {
      this.incidents.unshift(newInc);
      this.renderFeed();
      this.map.setData({ incidents: this.incidents });
      SoundEngine.playPing();
    });

    API.on("INCIDENT_UPDATED", (updatedInc) => {
      const idx = this.incidents.findIndex(i => i.id === updatedInc.id);
      if (idx !== -1) {
        this.incidents[idx] = updatedInc;
        this.renderFeed();
        this.map.setData({ incidents: this.incidents });
      }
    });

    API.on("SOS_ALERT", (sosInc) => {
      this.incidents.unshift(sosInc);
      this.renderFeed();
      this.map.setData({ incidents: this.incidents });
      SoundEngine.playEmergencySiren(4);
    });

    this.map.onReportAtLocation = (loc) => {
      this.openReportModal(loc);
    };

    this.map.onIncidentClick = (inc) => {
      this.highlightIncident(inc);
    };
  }

  async refreshIncidents() {
    try {
      const res = await API.getIncidents();
      if (res.success) {
        this.incidents = res.incidents;
        this.renderFeed();
        this.map.setData({ incidents: this.incidents });
        
        const activeCount = this.incidents.filter(i => i.status !== "Resolved").length;
        const badge = document.getElementById("incidents-tab-badge");
        if (badge) badge.textContent = activeCount;
      }
    } catch (err) {
      console.error("Failed to fetch incidents:", err);
    }
  }

  renderFeed() {
    if (!this.feedContainer) return;

    if (this.incidents.length === 0) {
      this.feedContainer.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 24px;">No active incidents recorded.</div>`;
      return;
    }

    this.feedContainer.innerHTML = this.incidents.map(inc => {
      const statusClass = inc.status.replace(" ", "_");
      const hasAccelerated = this.acceleratedIds.has(inc.id);
      const isResolved = inc.status === "Resolved";
      const votes = inc.upvotes || 1;

      return `
        <div class="incident-item" data-inc-id="${inc.id}">
          <div class="incident-header-row">
            <span class="incident-id-tag">${inc.id}</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              ${votes > 1 ? `
                <span class="crowd-urgency-badge" title="${votes} students reported this issue">
                  🔥 ${votes}
                </span>
              ` : ""}
              <span class="severity-indicator ${inc.severity}">${inc.severity}</span>
            </div>
          </div>
          <div class="incident-headline">${inc.title}</div>
          <div class="incident-summary">${inc.description}</div>
          <div class="incident-footer-row">
            <span>${inc.locationName}</span>
            <span class="status-badge ${statusClass}">${inc.status}</span>
          </div>

          ${!isResolved ? `
            <div class="incident-action-row" style="margin-top: 6px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between;">
              <button class="btn-accelerate-issue ${hasAccelerated ? 'active' : ''}" data-action-id="${inc.id}" title="Click if you are also affected by this problem">
                <span class="btn-flame-icon">🔥</span>
                <span>${hasAccelerated ? 'Escalated (+1)' : 'Impacts Me Too (+1)'}</span>
                <span class="accelerate-pill-count">${votes}</span>
              </button>
              <span style="font-size: 10px; font-family: var(--font-mono); color: var(--text-muted);">${votes >= 4 ? 'Surging Alert' : 'Active Ticket'}</span>
            </div>
          ` : ""}
        </div>
      `;
    }).join("");

    this.feedContainer.querySelectorAll(".incident-item").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-inc-id");
        const incident = this.incidents.find(i => i.id === id);
        if (incident) this.highlightIncident(incident);
      });
    });

    this.feedContainer.querySelectorAll(".btn-accelerate-issue").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-action-id");
        if (this.acceleratedIds.has(id)) {
          if (window.showAppToast) {
            window.showAppToast("You have already amplified this issue!");
          }
          return;
        }

        try {
          this.acceleratedIds.add(id);
          localStorage.setItem("campuspulse_accelerated_ids", JSON.stringify([...this.acceleratedIds]));
          btn.classList.add("active");

          const res = await API.accelerateIncident(id);
          if (res && res.success) {
            SoundEngine.playPing();
            await this.refreshIncidents();
            if (window.showAppToast) {
              window.showAppToast(res.message);
            }
          }
        } catch (err) {
          console.error("Failed to accelerate issue:", err);
        }
      });
    });
  }

  highlightIncident(inc) {
    if (inc.buildingId && inc.buildingId.startsWith("bldg_")) {
      this.map.showIndoorView(inc.buildingId, inc.floor || 0);
    } else {
      this.map.showOutdoorView();
    }
    
    this.map.scale = 2.0;
    this.map.panX = (this.map.container.clientWidth / 2) - (inc.coordinates.x * 2.0);
    this.map.panY = (this.map.container.clientHeight / 2) - (inc.coordinates.y * 2.0);
    this.map.updateTransform();

    SoundEngine.playPing();

    setTimeout(() => {
      if (this.map.showPopoverForIncident) {
        this.map.showPopoverForIncident(inc);
      }
    }, 120);
  }

  openReportModal(presetLocation = null) {
    if (!this.reportModal) return;
    this.reportModal.classList.add("active");
    if (presetLocation) {
      document.getElementById("report-title").value = "";
      document.getElementById("report-desc").value = "";
      document.getElementById("report-bldg-select").value = presetLocation.buildingId || "bldg_alpha";
      document.getElementById("report-floor-select").value = presetLocation.floor ?? 0;
      document.getElementById("report-location-name").value = presetLocation.locationName || "";
    }
  }

  closeReportModal() {
    if (!this.reportModal) return;
    this.reportModal.classList.remove("active");
    if (this.photoPreview) {
      this.photoPreview.src = "";
      this.photoPreview.classList.remove("active");
    }
    if (this.photoInput) {
      this.photoInput.value = "";
    }
  }

  async submitReport() {
    const title = document.getElementById("report-title").value.trim();
    const description = document.getElementById("report-desc").value.trim();
    const buildingId = document.getElementById("report-bldg-select").value;
    const floor = document.getElementById("report-floor-select").value;
    const locationName = document.getElementById("report-location-name").value.trim();
    const reportedBy = document.getElementById("report-reporter-name").value.trim() || "Field Inspector";
    const contact = document.getElementById("report-reporter-contact").value.trim();

    if (!title || !description) {
      alert("Please provide a description and subject.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", this.selectedCategory);
    formData.append("severity", this.selectedSeverity);
    formData.append("buildingId", buildingId);
    formData.append("floor", floor);
    formData.append("locationName", locationName);
    formData.append("reportedBy", reportedBy);
    formData.append("contact", contact);

    if (this.photoInput && this.photoInput.files[0]) {
      formData.append("photo", this.photoInput.files[0]);
    }

    try {
      this.submitReportBtn.disabled = true;
      this.submitReportBtn.textContent = "Submitting...";

      const res = await API.reportIncident(formData);
      if (res.success) {
        this.closeReportModal();
        SoundEngine.playPing();
      } else {
        alert(res.error || "Submission failed.");
      }
    } catch (e) {
      console.error("Report submit error:", e);
    } finally {
      this.submitReportBtn.disabled = false;
      this.submitReportBtn.textContent = "Submit Report";
    }
  }

  async triggerSOSPanic() {
    try {
      this.confirmSosBtn.disabled = true;
      this.confirmSosBtn.textContent = "TRANSMITTING BEACON...";

      const res = await API.triggerSOS({
        coordinatesX: 710,
        coordinatesY: 525,
        locationName: "Delta Complex - Main Auditorium & Hackathon Arena",
        reportedBy: "Distress Telemetry Beacon"
      });

      if (res.success) {
        this.sosModal.classList.remove("active");
        SoundEngine.playEmergencySiren(4);
      }
    } catch (err) {
      console.error("SOS panic error:", err);
    } finally {
      this.confirmSosBtn.disabled = false;
      this.confirmSosBtn.textContent = "Confirm Emergency Beacon";
    }
  }
}
