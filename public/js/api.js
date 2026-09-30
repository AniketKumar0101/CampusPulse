// API Client & Real-Time WebSocket Manager

const BASE_URL = window.location.origin;
const WS_PROTOCOL = window.location.protocol === "https:" ? "wss:" : "ws:";
const WS_URL = `${WS_PROTOCOL}//${window.location.host}/ws`;

let socket = null;
let reconnectTimer = null;
const eventListeners = new Map();

export const API = {
  // REST Endpoints
  async getCampusInfo() {
    const res = await fetch(`${BASE_URL}/api/campus/info`);
    return res.json();
  },

  async getBuildings() {
    const res = await fetch(`${BASE_URL}/api/campus/buildings`);
    return res.json();
  },

  async getBuildingDetails(buildingId) {
    const res = await fetch(`${BASE_URL}/api/campus/buildings/${buildingId}`);
    return res.json();
  },

  async getIndoorFloor(buildingId, floor) {
    const res = await fetch(`${BASE_URL}/api/campus/buildings/${buildingId}/floor/${floor}`);
    return res.json();
  },

  async getEvents() {
    const res = await fetch(`${BASE_URL}/api/campus/events`);
    return res.json();
  },

  async getPOIs(query = "") {
    const res = await fetch(`${BASE_URL}/api/navigation/pois?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  async calculateRoute({ startId, destinationId, accessibleOnly = false, avoidHazards = true, isEvacuation = false }) {
    const res = await fetch(`${BASE_URL}/api/navigation/route`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startId, destinationId, accessibleOnly, avoidHazards, isEvacuation })
    });
    return res.json();
  },

  async getIncidents(filters = {}) {
    const params = new URLSearchParams(filters);
    const res = await fetch(`${BASE_URL}/api/incidents?${params.toString()}`);
    return res.json();
  },

  async reportIncident(formData) {
    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: "POST",
      body: formData // multipart/form-data
    });
    return res.json();
  },

  async triggerSOS(data = {}) {
    const res = await fetch(`${BASE_URL}/api/incidents/sos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateIncident(id, updateData) {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData)
    });
    return res.json();
  },

  async accelerateIncident(id) {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/accelerate`, {
      method: "POST"
    });
    return res.json();
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/api/incidents/stats`);
    return res.json();
  },

  async sendBroadcast(data) {
    const res = await fetch(`${BASE_URL}/api/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async clearBroadcast() {
    const res = await fetch(`${BASE_URL}/api/broadcast`, {
      method: "DELETE"
    });
    return res.json();
  },

  // WebSocket Setup & Event Handlers
  initWebSocket(onStatusChange) {
    connectWS(onStatusChange);
  },

  on(eventType, callback) {
    if (!eventListeners.has(eventType)) {
      eventListeners.set(eventType, []);
    }
    eventListeners.get(eventType).push(callback);
  },

  off(eventType, callback) {
    if (!eventListeners.has(eventType)) return;
    const list = eventListeners.get(eventType).filter(cb => cb !== callback);
    eventListeners.set(eventType, list);
  }
};

function dispatchEvent(type, payload) {
  const callbacks = eventListeners.get(type) || [];
  for (const cb of callbacks) {
    try {
      cb(payload);
    } catch (e) {
      console.error(`Error in WS event listener for ${type}:`, e);
    }
  }
}

function connectWS(onStatusChange) {
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      console.log("🟢 WebSocket Connected to CampusPulse Real-Time Engine");
      if (onStatusChange) onStatusChange(true);
      if (reconnectTimer) {
        clearInterval(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type) {
          dispatchEvent(data.type, data.payload);
        }
      } catch (err) {
        console.error("Failed to parse WS message:", err);
      }
    };

    socket.onclose = () => {
      console.warn("🔴 WebSocket Disconnected. Reconnecting in 3s...");
      if (onStatusChange) onStatusChange(false);
      scheduleReconnect(onStatusChange);
    };

    socket.onerror = (err) => {
      console.error("WS Error:", err);
      if (onStatusChange) onStatusChange(false);
      socket.close();
    };
  } catch (err) {
    console.error("WS Connection Init Error:", err);
    scheduleReconnect(onStatusChange);
  }
}

function scheduleReconnect(onStatusChange) {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWS(onStatusChange);
  }, 3000);
}
