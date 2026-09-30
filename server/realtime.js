// Real-time WebSocket connection manager and broadcast utility

const clients = new Set();

export function registerClient(ws) {
  clients.add(ws);
  
  // Send connection welcome handshake
  ws.send(JSON.stringify({
    type: "CONNECTED",
    payload: {
      message: "Connected to CampusPulse Real-Time Event Stream",
      serverTime: new Date().toISOString()
    }
  }));

  ws.on("close", () => {
    clients.delete(ws);
  });

  ws.on("error", () => {
    clients.delete(ws);
  });
}

export function broadcast(eventType, payload) {
  const message = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  for (const client of clients) {
    if (client.readyState === 1) { // 1 = OPEN
      try {
        client.send(message);
      } catch (err) {
        console.error("Failed to send WS message:", err);
      }
    }
  }
}

export function getConnectedClientCount() {
  return clients.size;
}
