# CampusPulse: Intelligent Campus Navigation & Incident Reporting System
### Developed for Tech Pulse 2026 (Sri Sairam Engineering College)
**Problem Statement 4: Intelligent Campus Navigation & Incident Reporting App**

---

## 🌟 Executive Summary
**CampusPulse** is an enterprise-grade smart campus companion and real-time safety operations platform. It unifies high-precision outdoor and multi-floor indoor navigation with an emergency incident response and dispatch system.

Built specifically to solve large-campus mobility bottlenecks, lost visitors, delayed maintenance reporting, and fragmented emergency responses.

---

## 🚀 Key Deliverables & Features

### 1. 🧭 Intelligent Dual-Mode Navigation (Outdoor & Multi-Floor Indoor)
* **Outdoor Campus Map:** Interactive, GPU-accelerated SVG vector map representing Sri Sairam Engineering College (Academic blocks, research centers, auditoriums, sports arenas, health center, cafeteria, and parking).
* **Multi-Floor Indoor Floorplans:** Seamless transition from outdoor building footprints to room-level floorplans with dynamic level switching (**Ground Floor G**, **Level 1 L1**, **Level 2 L2**).
* **Smart Pathfinding (Dijkstra Algorithm):**
  * **Shortest Path Route:** Computes optimal route across outdoor boulevards, skywalks, and indoor corridors.
  * **♿ Wheelchair / Step-Free Accessible Routing:** Avoids stairs and routes exclusively through ramps and passenger elevators.
  * **⚠️ Dynamic Hazard Avoidance:** Automatically reroutes pedestrian paths away from active high-voltage hazards, slippery spills, or blocked corridors with user warning notices.
  * **🚨 1-Click Emergency Evacuation Route:** Instant pathfinding from any user coordinate to the closest verified Emergency Fire Exit.
* **Instant POI Search & Autocomplete:** Global search across laboratories, lecture theatres, seminar halls, restrooms, water stations, and event venues.

### 2. 📢 Geo-Tagged Incident Reporting System
* **Quick Incident Reporter:** Report hazards, infrastructure breakdowns, security threats, or medical emergencies.
* **Multi-Level Severity Triage:** Low, Medium, High, and Critical.
* **Precise Geo-Tagging:** Automatically tags the exact building, floor level, and room coordinate or allows 1-click placement on the interactive map.
* **Evidence Attachment:** Supports photo uploads and camera capture.
* **🚨 1-Tap Emergency SOS Panic Beacon:** High-priority distress signal that triggers visual radar sweeps and synthesized dual-frequency sirens via the Web Audio API across safety control rooms.

### 3. 🛡️ Campus Safety Operations Command Center (Admin Dashboard)
* **Real-Time KPI Dashboard:** Tracks total logged incidents, active critical hazards, in-progress tickets, and campus resolution efficiency.
* **Live Incident Queue:** Synchronized in real-time across all devices via WebSockets (`ws://`).
* **Triage & Dispatch Workflow:** Assign maintenance crews (Electrical, Plumbing, HVAC, Security Quick Reaction Force, Health Center Paramedics) and log resolution notes.
* **Campus-Wide Emergency Broadcasts:** Transmit high-priority campus advisories and weather warnings across all active student screens with 1 click.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Backend API** | Node.js (v20+), Express.js (v4.21), Multer (File Uploads), CORS |
| **Real-Time Layer** | Native WebSockets (`ws`) for low-latency live synchronization |
| **Pathfinding Engine** | Dijkstra Algorithm on an undirected weighted campus graph |
| **Frontend UI** | HTML5 Semantic Architecture, Vanilla JavaScript (ES6 Modules) |
| **Styling & Aesthetics** | Pure Vanilla CSS, Modern CSS Tokens, Glassmorphism, Dark Mode |
| **Mapping Engine** | Interactive Vector SVG Canvas with Pan/Zoom & Floor Switcher |
| **Audio Synthesizer** | Web Audio API (procedural chime, ping, and emergency siren) |

---

## ⚡ Quick Start & Running Locally

The server is already running in background at `http://localhost:3000`.

To start manually at any time:
```bash
# Install dependencies (if not already installed)
npm install

# Start the full-stack server
npm start
```
Open **[http://localhost:3000](http://localhost:3000)** in any browser.

---

## 🧪 Interactive Demo Walkthrough for Judges

1. **Explore Navigation:**
   * In the left panel, select Start: `Campus Main Gate A` and Destination: `Tech Pulse 2026 Hackathon Arena`.
   * Click **Find Optimal Route**. Watch the route animate in glowing cyan, with walking distance (~350 m) and turn-by-turn directions.
   * Toggle **♿ Wheelchair Accessible** to see path recalculation avoiding stairs.
2. **Indoor Exploration:**
   * Click on **Alpha Block (CSE & AI-DS)** on the map.
   * Use the floor switcher bar in the top right: click **Ground (G)**, **Floor 1**, **Floor 2**. Hover over labs (e.g. AI Lab, Cybersecurity Lab).
   * Click **Exit to Campus** to return to the bird's-eye view.
3. **Report an Incident:**
   * Click **📢 Report Campus Issue / Hazard** in the left drawer.
   * Fill out an issue (e.g., *"Water cooler overflow near Room 102"*), select category, severity, and submit.
   * Watch the new incident card appear instantly in the feed and a pulsing pin appear on the map!
4. **Trigger Emergency SOS:**
   * Click the big red **🚨 SOS PANIC** button in the top right.
   * Confirm the distress beacon. Listen to the audible safety siren and see the critical alert dispatch.
5. **Switch to Admin Command Center:**
   * In the top bar, switch the toggle from **🎓 Student View** to **🛡️ Security Admin**.
   * Observe live KPI metrics, view the newly submitted incident in the triage queue, and assign a technician.
   * Broadcast a campus advisory (e.g. *"Heavy rain expected — please use covered walkways"*) and see the emergency banner display across all connected sessions.
