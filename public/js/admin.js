// Security Operations Center (SOC) & Campus Incident Command System (ICS)
import { API } from "./api.js";
import { SoundEngine } from "./audio.js";

export class AdminCommandCenter {
  constructor(mapEngine) {
    this.map = mapEngine;
    this.stats = null;
    this.incidents = [];
    this.selectedBroadcastLevel = "warning";
    this.activeTriageIncident = null;

    this.initUI();
  }

  async initUI() {
    this.container = document.getElementById("admin-command-view");
    this.tableBody = document.getElementById("admin-incidents-tbody");
    this.triageModal = document.getElementById("triage-modal");
    
    this.broadcastMsgInput = document.getElementById("broadcast-message-input");
    this.broadcastTitleInput = document.getElementById("broadcast-title-input");
    this.sendBroadcastBtn = document.getElementById("btn-send-broadcast");
    this.clearBroadcastBtn = document.getElementById("btn-clear-broadcast");

    const levelBtns = document.querySelectorAll(".adv-level-btn");
    levelBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        levelBtns.forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedBroadcastLevel = btn.getAttribute("data-level");
      });
    });

    if (this.sendBroadcastBtn) {
      this.sendBroadcastBtn.addEventListener("click", () => this.sendBroadcast());
    }

    if (this.clearBroadcastBtn) {
      this.clearBroadcastBtn.addEventListener("click", () => this.clearBroadcast());
    }

    this.closeTriageBtn = document.getElementById("btn-close-triage-modal");
    this.saveTriageBtn = document.getElementById("btn-save-triage");
    if (this.closeTriageBtn) {
      this.closeTriageBtn.addEventListener("click", () => {
        this.triageModal.classList.remove("active");
      });
    }
    if (this.saveTriageBtn) {
      this.saveTriageBtn.addEventListener("click", () => this.saveTriageChanges());
    }

    API.on("NEW_INCIDENT", () => this.refreshData());
    API.on("INCIDENT_UPDATED", () => this.refreshData());
    API.on("SOS_ALERT", () => this.refreshData());

    await this.refreshData();
  }

  async refreshData() {
    try {
      const [statsRes, incRes] = await Promise.all([
        API.getStats(),
        API.getIncidents()
      ]);

      if (statsRes.success) {
        this.stats = statsRes.stats;
        this.renderMetrics();
      }

      if (incRes.success) {
        this.incidents = incRes.incidents;
        this.renderTable();
      }
    } catch (e) {
      console.error("Admin data refresh error:", e);
    }
  }

  renderMetrics() {
    if (!this.stats) return;
    const { total, critical, inProgress, resolutionRate } = this.stats;

    const elTotal = document.getElementById("kpi-total");
    const elCrit = document.getElementById("kpi-critical");
    const elProg = document.getElementById("kpi-inprogress");
    const elRate = document.getElementById("kpi-rate");

    if (elTotal) elTotal.textContent = total;
    if (elCrit) elCrit.textContent = critical;
    if (elProg) elProg.textContent = inProgress;
    if (elRate) elRate.textContent = `${resolutionRate}%`;
  }

  renderTable() {
    if (!this.tableBody) return;

    this.tableBody.innerHTML = this.incidents.map(inc => {
      const statusClass = inc.status.replace(" ", "_");
      return `
        <tr>
          <td><span style="font-family: var(--font-mono); font-weight: 600; color: var(--accent-primary);">${inc.id}</span></td>
          <td>
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <span class="severity-indicator ${inc.severity}">${inc.severity}</span>
              <span style="font-family: var(--font-mono); font-size: 10px; color: ${(inc.upvotes || 1) >= 4 ? '#ff6b35' : 'var(--text-muted)'}; font-weight: ${(inc.upvotes || 1) >= 4 ? '700' : '500'}; display: inline-flex; align-items: center; gap: 3px;">
                🔥 ${inc.upvotes || 1} ${(inc.upvotes || 1) === 1 ? 'affected' : 'affected'}
              </span>
            </div>
          </td>
          <td>
            <div style="font-weight: 600;">${inc.title}</div>
            <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">${inc.category}</div>
          </td>
          <td>${inc.locationName}</td>
          <td>${inc.reportedBy}</td>
          <td><span class="crew-assignment-tag">${inc.assignedTo}</span></td>
          <td><span class="status-badge ${statusClass}">${inc.status}</span></td>
          <td>
            <button class="btn btn-secondary" style="padding: 3px 8px; font-size: 11px;" data-id="${inc.id}">Triage</button>
          </td>
        </tr>
      `;
    }).join("");

    this.tableBody.querySelectorAll("button").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const inc = this.incidents.find(i => i.id === id);
        if (inc) this.openTriageModal(inc);
      });
    });
  }

  openTriageModal(inc) {
    this.activeTriageIncident = inc;
    this.triageModal.classList.add("active");

    document.getElementById("triage-incident-id").textContent = inc.id;
    document.getElementById("triage-title").textContent = inc.title;
    document.getElementById("triage-status-select").value = inc.status;
    document.getElementById("triage-assignee-select").value = inc.assignedTo.includes("Electrician") ? "Electrical Maintenance Unit" :
      inc.assignedTo.includes("Security") ? "Campus Security Quick Reaction Force" :
      inc.assignedTo.includes("Plumb") ? "Plumbing & Sanitation Unit" : "Campus Safety Officer";
    document.getElementById("triage-notes").value = inc.resolutionNotes || "";
  }

  async saveTriageChanges() {
    if (!this.activeTriageIncident) return;

    const newStatus = document.getElementById("triage-status-select").value;
    const newAssignee = document.getElementById("triage-assignee-select").value;
    const notes = document.getElementById("triage-notes").value.trim();

    try {
      this.saveTriageBtn.disabled = true;
      const res = await API.updateIncident(this.activeTriageIncident.id, {
        status: newStatus,
        assignedTo: newAssignee,
        resolutionNotes: notes
      });

      if (res.success) {
        this.triageModal.classList.remove("active");
        SoundEngine.playPing();
        await this.refreshData();
      }
    } catch (e) {
      console.error("Failed to save triage:", e);
    } finally {
      this.saveTriageBtn.disabled = false;
    }
  }

  async sendBroadcast() {
    const title = this.broadcastTitleInput.value.trim() || "CAMPUS ADVISORY";
    const message = this.broadcastMsgInput.value.trim();

    if (!message) {
      alert("Please enter a directive message.");
      return;
    }

    try {
      this.sendBroadcastBtn.disabled = true;
      const res = await API.sendBroadcast({
        title,
        message,
        level: this.selectedBroadcastLevel
      });

      if (res.success) {
        this.broadcastMsgInput.value = "";
      }
    } catch (e) {
      console.error("Broadcast failed:", e);
    } finally {
      this.sendBroadcastBtn.disabled = false;
    }
  }

  async clearBroadcast() {
    try {
      await API.clearBroadcast();
    } catch (e) {
      console.error("Clear broadcast failed:", e);
    }
  }
}
