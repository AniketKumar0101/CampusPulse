export let initialIncidents = [
  {
    id: "INC-1001",
    title: "Loose High-Voltage Wiring Exposed",
    description: "Conduit cover detached from ceiling tray; hanging cables near the cybersecurity lab entrance sparking intermittently.",
    category: "hazard",
    severity: "critical",
    buildingId: "bldg_alpha",
    floor: 2,
    locationName: "Alpha Block, Floor 2 Corridor (near Room 201)",
    coordinates: { x: 235, y: 210 },
    nodeId: "node_alpha_f2_corridor",
    status: "In Progress",
    upvotes: 6,
    reportedBy: "Karthik R. (3rd Yr CSE)",
    contact: "+91 98401 23456",
    reportedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    assignedTo: "Chief Electrician & Facilities Team Alpha",
    photoUrl: "/assets/sample_incident_wiring.svg",
    resolutionNotes: "Emergency circuit isolated; replacement junction box being installed.",
    logs: [
      { time: new Date(Date.now() - 3600000 * 2).toISOString(), action: "Incident reported by student via mobile client" },
      { time: new Date(Date.now() - 3600000 * 1.5).toISOString(), action: "Admin triage: escalated to Critical; electrical team dispatched" },
      { time: new Date(Date.now() - 3600000 * 0.8).toISOString(), action: "Technician arrived on-site; circuit breaker tripped for safety" }
    ]
  },
  {
    id: "INC-1002",
    title: "Main A/C Chiller Unit Failure",
    description: "Central HVAC chiller compressor not kicking in; auditorium temperature climbing during hackathon registration.",
    category: "maintenance",
    severity: "high",
    buildingId: "bldg_delta",
    floor: 0,
    locationName: "Delta Complex, Grand Auditorium Lobby",
    coordinates: { x: 655, y: 550 },
    nodeId: "node_delta_f0_corridor",
    status: "Reported",
    upvotes: 3,
    reportedBy: "Priya S. (Event Coordinator)",
    contact: "+91 98840 98765",
    reportedAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    assignedTo: "HVAC Engineering Contractor",
    photoUrl: "/assets/sample_incident_ac.svg",
    resolutionNotes: "",
    logs: [
      { time: new Date(Date.now() - 3600000 * 0.5).toISOString(), action: "Ticket logged from Hackathon Control Desk" }
    ]
  },
  {
    id: "INC-1003",
    title: "Water Dispenser Overflow & Slippery Floor",
    description: "Drain line blocked on reverse-osmosis water cooler, causing pooling water across the walkway.",
    category: "hazard",
    severity: "medium",
    buildingId: "bldg_beta",
    floor: 1,
    locationName: "Beta Block, Floor 1 Water Station",
    coordinates: { x: 705, y: 230 },
    nodeId: "node_beta_f1_corridor",
    status: "Reported",
    upvotes: 2,
    reportedBy: "Dr. Venkatesh (ECE Faculty)",
    contact: "+91 94441 55678",
    reportedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    assignedTo: "Housekeeping & Plumbing Unit 2",
    photoUrl: "/assets/sample_incident_water.svg",
    resolutionNotes: "",
    logs: [
      { time: new Date(Date.now() - 3600000 * 4).toISOString(), action: "Reported by faculty via web portal" }
    ]
  },
  {
    id: "INC-1004",
    title: "Emergency Exit Door Obstructed",
    description: "Pallets of old lab equipment stored directly in front of the South Ground Floor fire escape.",
    category: "security",
    severity: "high",
    buildingId: "bldg_alpha",
    floor: 0,
    locationName: "Alpha Block Ground Floor Fire Exit South",
    coordinates: { x: 265, y: 300 },
    nodeId: "node_alpha_ent_s",
    status: "Resolved",
    reportedBy: "Campus Safety Auditor",
    contact: "+91 98400 11223",
    reportedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    assignedTo: "Campus Security & Logistics",
    photoUrl: "/assets/sample_incident_door.svg",
    resolutionNotes: "All scrap materials cleared and relocated to designated salvage yard. Exit path inspected and verified clear.",
    logs: [
      { time: new Date(Date.now() - 3600000 * 12).toISOString(), action: "Identified during morning routine campus safety walk" },
      { time: new Date(Date.now() - 3600000 * 10).toISOString(), action: "Logistics crew dispatched with trolley" },
      { time: new Date(Date.now() - 3600000 * 8).toISOString(), action: "Path cleared and signed off by Safety Inspector" }
    ]
  }
];
