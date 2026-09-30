// Campus Data & Navigational Graph Definition
// Scaled coordinate space: 1000 x 700 units (representing a 50-acre smart campus)

export const campusInfo = {
  name: "Sri Sairam Engineering Campus",
  tagline: "Intelligent Navigation & Real-time Incident Command",
  version: "2.4.0",
  coordinates: {
    lat: 12.9602,
    lng: 80.0573
  },
  emergencyHotline: "+91 44 2251 2222",
  securityCommandCenter: "Security Gatehouse A",
  medicalPost: "Campus Health Center, Ground Floor"
};

export const buildings = [
  {
    id: "bldg_alpha",
    name: "Alpha Block",
    subname: "CSE & AI-DS Department",
    code: "CSE-AI",
    category: "academic",
    color: "#3b82f6",
    x: 180,
    y: 160,
    width: 170,
    height: 140,
    floors: [0, 1, 2],
    defaultFloor: 0,
    entrances: [
      { id: "node_alpha_ent_s", x: 265, y: 300, name: "South Main Entrance" },
      { id: "node_alpha_ent_n", x: 265, y: 160, name: "North Quad Entrance" }
    ],
    description: "Hub for Computer Science, Artificial Intelligence & Data Science, housing high-performance GPU clusters, IoT labs, and department faculty.",
    facilities: ["High-Perf GPU Lab", "Robotics & Vision Cell", "Smart Classrooms", "Faculty Lounge", "Restrooms", "Water Dispensers"]
  },
  {
    id: "bldg_beta",
    name: "Beta Block",
    subname: "ECE & Mechanical Sciences",
    code: "ECE-MECH",
    category: "academic",
    color: "#8b5cf6",
    x: 620,
    y: 160,
    width: 170,
    height: 140,
    floors: [0, 1, 2],
    defaultFloor: 0,
    entrances: [
      { id: "node_beta_ent_s", x: 705, y: 300, name: "South Plaza Entrance" },
      { id: "node_beta_ent_w", x: 620, y: 230, name: "West Avenue Entrance" }
    ],
    description: "VLSI design suites, Embedded systems workstations, additive manufacturing and smart automotive labs.",
    facilities: ["VLSI Design Center", "Embedded IoT Lab", "Robotics Arena", "Restrooms", "Water Dispensers"]
  },
  {
    id: "bldg_gamma",
    name: "Gamma Block",
    subname: "Administrative HQ & Central Library",
    code: "ADMIN-LIB",
    category: "administrative",
    color: "#06b6d4",
    x: 400,
    y: 350,
    width: 180,
    height: 130,
    floors: [0, 1],
    defaultFloor: 0,
    entrances: [
      { id: "node_gamma_ent_w", x: 400, y: 415, name: "Main West Portico" },
      { id: "node_gamma_ent_e", x: 580, y: 415, name: "East Library Entrance" }
    ],
    description: "College Directorate, Dean Academics, Registrar Office, and the 2-storey Central Digital Library.",
    facilities: ["Central Digital Library", "Dean Office", "Registrar & Accounts", "Quiet Study Zone", "Conference Rooms"]
  },
  {
    id: "bldg_delta",
    name: "Delta Complex",
    subname: "Grand Auditorium & Innovation Hub",
    code: "AUD-INNOV",
    category: "events",
    color: "#ec4899",
    x: 620,
    y: 450,
    width: 180,
    height: 150,
    floors: [0, 1],
    defaultFloor: 0,
    entrances: [
      { id: "node_delta_ent_w", x: 620, y: 525, name: "Grand Plaza Portico" },
      { id: "node_delta_ent_n", x: 710, y: 450, name: "North Stage Entrance" }
    ],
    description: "2,000-seater air-conditioned auditorium, incubation center, and home of Tech Pulse 2026 Hackathon.",
    facilities: ["Main Auditorium", "Incubation Cell", "Seminar Hall A & B", "Hackathon Arena", "Audio-Visual Suite"]
  },
  {
    id: "bldg_food",
    name: "Campus Food Court",
    subname: "Cafeteria & Student Diner",
    code: "CAFE",
    category: "amenity",
    color: "#f59e0b",
    x: 180,
    y: 450,
    width: 150,
    height: 120,
    floors: [0],
    defaultFloor: 0,
    entrances: [
      { id: "node_food_ent_e", x: 330, y: 510, name: "Main Dining Entrance" }
    ],
    description: "Multi-cuisine food stalls, student coffee bar, terrace garden seating, and juice lounge.",
    facilities: ["Juice Bar", "Coffee Station", "South & North Indian Stalls", "Washrooms", "Filtered Water"]
  },
  {
    id: "bldg_sports",
    name: "Sports Arena & Gym",
    subname: "Indoor Badminton & Fitness",
    code: "SPORTS",
    category: "amenity",
    color: "#10b981",
    x: 400,
    y: 140,
    width: 140,
    height: 110,
    floors: [0],
    defaultFloor: 0,
    entrances: [
      { id: "node_sports_ent_s", x: 470, y: 250, name: "Sports Arena Entrance" }
    ],
    description: "Wooden indoor badminton courts, state-of-the-art gymnasium, table tennis, and yoga studio.",
    facilities: ["Gymnasium", "Indoor Badminton Courts", "Table Tennis", "Shower Rooms", "Locker Rooms"]
  },
  {
    id: "bldg_health",
    name: "Campus Health Center",
    subname: "Medical Clinic & First Aid",
    code: "CLINIC",
    category: "emergency",
    color: "#ef4444",
    x: 840,
    y: 350,
    width: 110,
    height: 90,
    floors: [0],
    defaultFloor: 0,
    entrances: [
      { id: "node_health_ent_w", x: 840, y: 395, name: "Emergency Ambulance Bay" }
    ],
    description: "24x7 doctor on call, paramedic station, 4 observation beds, and emergency ambulance dispatch.",
    facilities: ["Emergency First Aid", "Observation Wards", "Pharmacy Counter", "Ambulance Bay"]
  },
  {
    id: "bldg_hostels",
    name: "Student Hostels",
    subname: "Residences & Courtyard",
    code: "HOSTEL",
    category: "residential",
    color: "#6366f1",
    x: 830,
    y: 150,
    width: 120,
    height: 140,
    floors: [0, 1, 2],
    defaultFloor: 0,
    entrances: [
      { id: "node_hostel_ent_w", x: 830, y: 220, name: "Hostel Security Gate" }
    ],
    description: "Student residential wings with common rooms, indoor recreation, study hall, and 24/7 security warden.",
    facilities: ["Warden Office", "Common Room", "Study Hall", "Wi-Fi Hub"]
  },
  {
    id: "bldg_gate",
    name: "Main Campus Gate",
    subname: "Security Post & Visitor Pass Desk",
    code: "GATE-A",
    category: "security",
    color: "#64748b",
    x: 430,
    y: 630,
    width: 130,
    height: 50,
    floors: [0],
    defaultFloor: 0,
    entrances: [
      { id: "node_gate_n", x: 495, y: 630, name: "Campus Entrance Portal" }
    ],
    description: "Main security checkpost, RFID turnstiles, visitor pass issuance counter, and shuttle pickup.",
    facilities: ["Security Command Room", "Visitor Registration", "Boom Barriers", "Shuttle Pickup"]
  }
];

// Indoor Floor Plans for Multi-Floor Buildings
export const indoorFloorPlans = {
  bldg_alpha: {
    name: "Alpha Block (CSE & AI-DS)",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "alpha_g_01", code: "G01", name: "Programming Fundamentals Lab", type: "lab", x: 40, y: 75, w: 165, h: 85, color: "#dbeafe" },
          { id: "alpha_g_02", code: "G02", name: "High-Performance GPU Cluster Lab", type: "lab", x: 220, y: 75, w: 175, h: 85, color: "#dbeafe" },
          { id: "alpha_g_hall", code: "G03", name: "Department Seminar Hall 1", type: "auditorium", x: 410, y: 75, w: 180, h: 125, color: "#fce7f3" },
          { id: "alpha_g_lift", code: "LIFT-A", name: "Elevator Core A (ADA Accessible)", type: "elevator", x: 605, y: 75, w: 65, h: 60, color: "#fef08a" },
          { id: "alpha_g_stairs", code: "STAIRS-1", name: "Central Stairwell", type: "stairs", x: 605, y: 145, w: 65, h: 55, color: "#fed7aa" },
          { id: "alpha_g_restroom_m", code: "G-WC-M", name: "Men's Restroom", type: "restroom", x: 40, y: 225, w: 75, h: 65, color: "#e0f2fe" },
          { id: "alpha_g_restroom_f", code: "G-WC-F", name: "Women's Restroom", type: "restroom", x: 125, y: 225, w: 75, h: 65, color: "#fce7f3" },
          { id: "alpha_g_water", code: "G-H2O", name: "Filtered Water & Amenities", type: "amenity", x: 210, y: 225, w: 65, h: 65, color: "#bae6fd" },
          { id: "alpha_g_server", code: "G-SRV", name: "Server Infrastructure Core", type: "lab", x: 285, y: 225, w: 100, h: 65, color: "#e0e7ff" },
          { id: "alpha_g_exit", code: "FIRE-EXIT", name: "Emergency Fire Exit South", type: "emergency_exit", x: 400, y: 235, w: 130, h: 55, color: "#fecaca", isExit: true },
          { id: "alpha_g_recept", code: "G-DESK", name: "CSE Department Help Desk", type: "office", x: 545, y: 225, w: 125, h: 65, color: "#f1f5f9" }
        ]
      },
      1: {
        floorName: "First Floor (Level 1)",
        floorLevel: 1,
        rooms: [
          { id: "alpha_1_01", code: "101", name: "AI & Neural Networks Lab", type: "lab", x: 40, y: 75, w: 165, h: 85, color: "#dbeafe" },
          { id: "alpha_1_02", code: "102", name: "Big Data Analytics & Cloud Suite", type: "lab", x: 220, y: 75, w: 175, h: 85, color: "#dbeafe" },
          { id: "alpha_1_hod", code: "103", name: "HOD Office & Conference Suite", type: "office", x: 410, y: 75, w: 180, h: 70, color: "#e2e8f0" },
          { id: "alpha_1_fac", code: "104", name: "Faculty Research Pods & Cabins", type: "office", x: 410, y: 155, w: 180, h: 65, color: "#f1f5f9" },
          { id: "alpha_1_lift", code: "LIFT-A", name: "Elevator Core A (ADA Accessible)", type: "elevator", x: 605, y: 75, w: 65, h: 60, color: "#fef08a" },
          { id: "alpha_1_stairs", code: "STAIRS-1", name: "Central Stairwell", type: "stairs", x: 605, y: 145, w: 65, h: 55, color: "#fed7aa" },
          { id: "alpha_1_restroom", code: "1-WC", name: "Restroom Suite Level 1", type: "restroom", x: 40, y: 225, w: 90, h: 65, color: "#e0f2fe" },
          { id: "alpha_1_meet", code: "105", name: "Student-Faculty Discussion Cell", type: "classroom", x: 140, y: 225, w: 110, h: 65, color: "#fef3c7" },
          { id: "alpha_1_robotics", code: "106", name: "Autonomous Systems Workcell", type: "lab", x: 260, y: 225, w: 125, h: 65, color: "#dbeafe" },
          { id: "alpha_1_exit", code: "FIRE-EXIT", name: "Emergency Exit Fire Chute", type: "emergency_exit", x: 400, y: 235, w: 130, h: 55, color: "#fecaca", isExit: true },
          { id: "alpha_1_study", code: "107", name: "Digital Library Extension", type: "library", x: 545, y: 225, w: 125, h: 65, color: "#e0e7ff" }
        ]
      },
      2: {
        floorName: "Second Floor (Level 2)",
        floorLevel: 2,
        rooms: [
          { id: "alpha_2_01", code: "201", name: "Cybersecurity & Forensic Lab", type: "lab", x: 40, y: 75, w: 165, h: 85, color: "#dbeafe" },
          { id: "alpha_2_02", code: "202", name: "IoT & Smart Systems Suite", type: "lab", x: 220, y: 75, w: 175, h: 85, color: "#dbeafe" },
          { id: "alpha_2_lecture", code: "203", name: "Smart Tiered Lecture Theatre Alpha", type: "classroom", x: 410, y: 75, w: 180, h: 125, color: "#fef3c7" },
          { id: "alpha_2_lift", code: "LIFT-A", name: "Elevator Core A (ADA Accessible)", type: "elevator", x: 605, y: 75, w: 65, h: 60, color: "#fef08a" },
          { id: "alpha_2_stairs", code: "STAIRS-1", name: "Central Stairwell", type: "stairs", x: 605, y: 145, w: 65, h: 55, color: "#fed7aa" },
          { id: "alpha_2_project", code: "204", name: "Final Year Capstone Project Space", type: "lab", x: 40, y: 225, w: 150, h: 65, color: "#e0e7ff" },
          { id: "alpha_2_foss", code: "205", name: "Open Source Developers Pod", type: "lab", x: 200, y: 225, w: 120, h: 65, color: "#dbeafe" },
          { id: "alpha_2_restroom", code: "2-WC", name: "Restroom Suite Level 2", type: "restroom", x: 330, y: 225, w: 80, h: 65, color: "#e0f2fe" },
          { id: "alpha_2_exit", code: "FIRE-EXIT", name: "Roof Fire Escape Staging", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "alpha_2_ieee", code: "206", name: "IEEE Student Branch HQ", type: "office", x: 555, y: 225, w: 115, h: 65, color: "#f1f5f9" }
        ]
      }
    }
  },
  bldg_beta: {
    name: "Beta Block (ECE & Mechanical)",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "beta_g_01", code: "B-G01", name: "Microprocessor & Embedded Lab", type: "lab", x: 40, y: 75, w: 175, h: 85, color: "#f3e8ff" },
          { id: "beta_g_02", code: "B-G02", name: "Robotics Arena & Testing Cell", type: "lab", x: 230, y: 75, w: 175, h: 85, color: "#f3e8ff" },
          { id: "beta_g_seminar", code: "B-G03", name: "Beta Seminar Hall (120 Seats)", type: "auditorium", x: 420, y: 75, w: 175, h: 125, color: "#fce7f3" },
          { id: "beta_g_lift", code: "LIFT-B", name: "Elevator Beta Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "beta_g_stairs", code: "STAIRS-B", name: "North Stairwell", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "beta_g_wc", code: "B-G-WC", name: "Ground Restroom Complex", type: "restroom", x: 40, y: 225, w: 85, h: 65, color: "#e0f2fe" },
          { id: "beta_g_workshop", code: "B-G04", name: "Heavy Machine Tools Studio", type: "lab", x: 135, y: 225, w: 140, h: 65, color: "#f3e8ff" },
          { id: "beta_g_instr", code: "B-G05", name: "Electronic Instrumentation Bay", type: "lab", x: 285, y: 225, w: 125, h: 65, color: "#f3e8ff" },
          { id: "beta_g_exit", code: "FIRE-EXIT", name: "Emergency Exit Beta South", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "beta_g_store", code: "B-G06", name: "Component & Hardware Store", type: "amenity", x: 555, y: 225, w: 115, h: 65, color: "#bae6fd" }
        ]
      },
      1: {
        floorName: "First Floor (Level 1)",
        floorLevel: 1,
        rooms: [
          { id: "beta_1_vlsi", code: "B-101", name: "Cadence & VLSI Design Center", type: "lab", x: 40, y: 75, w: 175, h: 85, color: "#f3e8ff" },
          { id: "beta_1_comm", code: "B-102", name: "RF & Satellite Communication Lab", type: "lab", x: 230, y: 75, w: 175, h: 85, color: "#f3e8ff" },
          { id: "beta_1_faculty", code: "B-103", name: "ECE Faculty Chambers & Directorate", type: "office", x: 420, y: 75, w: 175, h: 70, color: "#f1f5f9" },
          { id: "beta_1_research", code: "B-104", name: "Research Scholars Work Pods", type: "office", x: 420, y: 155, w: 175, h: 65, color: "#f1f5f9" },
          { id: "beta_1_lift", code: "LIFT-B", name: "Elevator Beta Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "beta_1_stairs", code: "STAIRS-B", name: "North Stairwell", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "beta_1_restroom", code: "B-1-WC", name: "Restroom Suite Level 1", type: "restroom", x: 40, y: 225, w: 85, h: 65, color: "#e0f2fe" },
          { id: "beta_1_pcb", code: "B-105", name: "PCB Prototyping Station", type: "lab", x: 135, y: 225, w: 140, h: 65, color: "#f3e8ff" },
          { id: "beta_1_dsp", code: "B-106", name: "DSP & Signal Processing Lab", type: "lab", x: 285, y: 225, w: 125, h: 65, color: "#f3e8ff" },
          { id: "beta_1_exit", code: "FIRE-EXIT", name: "Fire Chute North Port", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "beta_1_conf", code: "B-107", name: "Smart Conference Room", type: "classroom", x: 555, y: 225, w: 115, h: 65, color: "#fef3c7" }
        ]
      },
      2: {
        floorName: "Second Floor (Level 2)",
        floorLevel: 2,
        rooms: [
          { id: "beta_2_auto", code: "B-201", name: "Embedded Automotive Systems Lab", type: "lab", x: 40, y: 75, w: 175, h: 85, color: "#f3e8ff" },
          { id: "beta_2_3d", code: "B-202", name: "3D Printing & Additive Mfg Studio", type: "lab", x: 230, y: 75, w: 175, h: 85, color: "#f3e8ff" },
          { id: "beta_2_mecha", code: "B-203", name: "Mechatronics Testing Cell", type: "lab", x: 420, y: 75, w: 175, h: 125, color: "#f3e8ff" },
          { id: "beta_2_lift", code: "LIFT-B", name: "Elevator Beta Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "beta_2_stairs", code: "STAIRS-B", name: "North Stairwell", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "beta_2_restroom", code: "B-2-WC", name: "Restroom Suite Level 2", type: "restroom", x: 40, y: 225, w: 85, h: 65, color: "#e0f2fe" },
          { id: "beta_2_cad", code: "B-204", name: "CAD/CAM Workstation Suite", type: "lab", x: 135, y: 225, w: 140, h: 65, color: "#f3e8ff" },
          { id: "beta_2_thermal", code: "B-205", name: "Thermal Engineering Simulation Pod", type: "lab", x: 285, y: 225, w: 125, h: 65, color: "#f3e8ff" },
          { id: "beta_2_exit", code: "FIRE-EXIT", name: "Roof Fire Escape Staging", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "beta_2_lecture", code: "B-206", name: "Smart Lecture Theatre Beta", type: "classroom", x: 555, y: 225, w: 115, h: 65, color: "#fef3c7" }
        ]
      }
    }
  },
  bldg_gamma: {
    name: "Gamma Block (Admin HQ & Central Library)",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "gamma_g_admin", code: "ADMIN-01", name: "Dean Academics & Directorate", type: "office", x: 40, y: 75, w: 175, h: 85, color: "#cffafe" },
          { id: "gamma_g_accounts", code: "ACCOUNTS", name: "Student Accounts & Scholarship Desk", type: "office", x: 230, y: 75, w: 175, h: 85, color: "#cffafe" },
          { id: "gamma_g_lib1", code: "LIB-CIRC", name: "Central Library Circulation & Catalog", type: "library", x: 420, y: 75, w: 175, h: 125, color: "#e0e7ff" },
          { id: "gamma_g_lift", code: "LIFT-G", name: "Elevator Gamma Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "gamma_g_stairs", code: "STAIRS-G", name: "Grand Central Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "gamma_g_wc", code: "G-WC", name: "Executive Restrooms", type: "restroom", x: 40, y: 225, w: 85, h: 65, color: "#e0f2fe" },
          { id: "gamma_g_admission", code: "ADMIT", name: "Admissions & Verification Desk", type: "office", x: 135, y: 225, w: 140, h: 65, color: "#cffafe" },
          { id: "gamma_g_registrar", code: "REGISTRAR", name: "Registrar Secretariat", type: "office", x: 285, y: 225, w: 125, h: 65, color: "#cffafe" },
          { id: "gamma_g_exit", code: "FIRE-EXIT", name: "Emergency Exit West Portico", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "gamma_g_board", code: "BOARD", name: "Governing Council Boardroom", type: "classroom", x: 555, y: 225, w: 115, h: 65, color: "#fef3c7" }
        ]
      },
      1: {
        floorName: "First Floor (Level 1)",
        floorLevel: 1,
        rooms: [
          { id: "gamma_1_lib_e", code: "LIB-EPOD", name: "Digital Library & E-Learning Pods", type: "library", x: 40, y: 75, w: 175, h: 85, color: "#e0e7ff" },
          { id: "gamma_1_lib_ref", code: "LIB-REF", name: "Research Reference & IEEE Archives", type: "library", x: 230, y: 75, w: 175, h: 85, color: "#e0e7ff" },
          { id: "gamma_1_study", code: "LIB-STUDY", name: "Silent Research Carrels (100 Pods)", type: "library", x: 420, y: 75, w: 175, h: 125, color: "#e0e7ff" },
          { id: "gamma_1_lift", code: "LIFT-G", name: "Elevator Gamma Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "gamma_1_stairs", code: "STAIRS-G", name: "Grand Central Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "gamma_1_wc", code: "LIB-WC", name: "Upper Restroom Suite", type: "restroom", x: 40, y: 225, w: 85, h: 65, color: "#e0f2fe" },
          { id: "gamma_1_exam", code: "EXAM-CELL", name: "Controller of Examinations Cell", type: "office", x: 135, y: 225, w: 140, h: 65, color: "#cffafe" },
          { id: "gamma_1_iqac", code: "IQAC", name: "Internal Quality Assurance Cell", type: "office", x: 285, y: 225, w: 125, h: 65, color: "#cffafe" },
          { id: "gamma_1_exit", code: "FIRE-EXIT", name: "Terrace Fire Chute Exit", type: "emergency_exit", x: 425, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "gamma_1_av", code: "LIB-AV", name: "Media Archival & Screening Room", type: "classroom", x: 555, y: 225, w: 115, h: 65, color: "#fef3c7" }
        ]
      }
    }
  },
  bldg_delta: {
    name: "Delta Complex (Auditorium & Innovation)",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "delta_g_audi", code: "MAIN-AUDI", name: "Grand Auditorium (Tech Pulse 2026)", type: "auditorium", x: 40, y: 75, w: 300, h: 125, color: "#fce7f3" },
          { id: "delta_g_hack", code: "HACK-ARENA", name: "Tech Pulse Hackathon Arena", type: "lab", x: 355, y: 75, w: 190, h: 125, color: "#dcfce7" },
          { id: "delta_g_stairs", code: "STAIRS-D", name: "Balcony Access Stairs", type: "stairs", x: 560, y: 75, w: 60, h: 55, color: "#fed7aa" },
          { id: "delta_g_lift", code: "LIFT-D", name: "ADA Freight Elevator", type: "elevator", x: 560, y: 145, w: 60, h: 55, color: "#fef08a" },
          { id: "delta_g_greenroom", code: "VIP-GREEN", name: "VIP Lounge & Judges Panel", type: "office", x: 40, y: 225, w: 165, h: 65, color: "#fef3c7" },
          { id: "delta_g_av", code: "AV-CTRL", name: "Live Broadcast & Streaming Core", type: "lab", x: 215, y: 225, w: 125, h: 65, color: "#e0e7ff" },
          { id: "delta_g_exit_n", code: "EXIT-AUDI-N", name: "Emergency Exit North Port", type: "emergency_exit", x: 355, y: 235, w: 100, h: 55, color: "#fecaca", isExit: true },
          { id: "delta_g_exit_s", code: "EXIT-AUDI-S", name: "Emergency Exit South Port", type: "emergency_exit", x: 465, y: 235, w: 100, h: 55, color: "#fecaca", isExit: true },
          { id: "delta_g_wc", code: "AUDI-WC", name: "Grand Restroom Suite", type: "restroom", x: 575, y: 225, w: 95, h: 65, color: "#e0f2fe" }
        ]
      },
      1: {
        floorName: "First Floor (Level 1)",
        floorLevel: 1,
        rooms: [
          { id: "delta_1_balcony", code: "BALCONY", name: "Auditorium Upper Balcony (800 Seats)", type: "auditorium", x: 40, y: 75, w: 300, h: 125, color: "#fce7f3" },
          { id: "delta_1_incubator", code: "INCUBATOR", name: "Startup Incubation & Mentorship Pods", type: "lab", x: 355, y: 75, w: 190, h: 125, color: "#dcfce7" },
          { id: "delta_1_stairs", code: "STAIRS-D", name: "Balcony Access Stairs", type: "stairs", x: 560, y: 75, w: 60, h: 55, color: "#fed7aa" },
          { id: "delta_1_lift", code: "LIFT-D", name: "ADA Freight Elevator", type: "elevator", x: 560, y: 145, w: 60, h: 55, color: "#fef08a" },
          { id: "delta_1_pitch", code: "PITCH", name: "Investor Pitch Theatre", type: "classroom", x: 40, y: 225, w: 165, h: 65, color: "#fef3c7" },
          { id: "delta_1_ipr", code: "IPR-CELL", name: "Patent & Innovation Advisory", type: "office", x: 215, y: 225, w: 125, h: 65, color: "#f1f5f9" },
          { id: "delta_1_exit", code: "FIRE-EXIT", name: "Upper Balcony Fire Chute", type: "emergency_exit", x: 355, y: 235, w: 100, h: 55, color: "#fecaca", isExit: true },
          { id: "delta_1_lounge", code: "VIP-LOUNGE", name: "Mentors & Speakers Lounge", type: "amenity", x: 465, y: 225, w: 100, h: 65, color: "#bae6fd" },
          { id: "delta_1_wc", code: "1-WC", name: "Upper Restroom Suite", type: "restroom", x: 575, y: 225, w: 95, h: 65, color: "#e0f2fe" }
        ]
      }
    }
  },
  bldg_food: {
    name: "Campus Food Court & Cafeteria",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "food_g_dining", code: "DINING", name: "Central Dining Hall (500 Seats)", type: "amenity", x: 40, y: 75, w: 300, h: 125, color: "#fef3c7" },
          { id: "food_g_stalls", code: "STALLS", name: "Multi-Cuisine Food Stations", type: "amenity", x: 355, y: 75, w: 190, h: 125, color: "#fed7aa" },
          { id: "food_g_kitchen", code: "KITCHEN", name: "Commercial Prep Kitchen & Pantry", type: "amenity", x: 560, y: 75, w: 110, h: 125, color: "#fed7aa" },
          { id: "food_g_coffee", code: "COFFEE", name: "Barista Coffee Bar & Bakery", type: "amenity", x: 40, y: 225, w: 140, h: 65, color: "#fef3c7" },
          { id: "food_g_juice", code: "JUICE", name: "Fresh Juice & Mocktail Counter", type: "amenity", x: 190, y: 225, w: 120, h: 65, color: "#bae6fd" },
          { id: "food_g_wash", code: "WASH", name: "Filtered Handwash Station", type: "amenity", x: 320, y: 225, w: 110, h: 65, color: "#bae6fd" },
          { id: "food_g_exit", code: "FIRE-EXIT", name: "Food Court Emergency Exit East", type: "emergency_exit", x: 440, y: 235, w: 110, h: 55, color: "#fecaca", isExit: true },
          { id: "food_g_wc", code: "CAFE-WC", name: "Restrooms & Sanitation Hub", type: "restroom", x: 560, y: 225, w: 110, h: 65, color: "#e0f2fe" }
        ]
      }
    }
  },
  bldg_sports: {
    name: "Sports Arena & Gymnasium",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "sports_g_court1", code: "COURT-A", name: "Indoor Teak Badminton Court 1", type: "amenity", x: 40, y: 75, w: 150, h: 125, color: "#dcfce7" },
          { id: "sports_g_court2", code: "COURT-B", name: "Indoor Teak Badminton Court 2", type: "amenity", x: 200, y: 75, w: 150, h: 125, color: "#dcfce7" },
          { id: "sports_g_gym", code: "GYM-PRO", name: "High-Tech Cardio & Strength Gym", type: "amenity", x: 360, y: 75, w: 185, h: 125, color: "#dcfce7" },
          { id: "sports_g_tt", code: "TT-ARENA", name: "Table Tennis & Carrom Zone", type: "amenity", x: 555, y: 75, w: 115, h: 125, color: "#dcfce7" },
          { id: "sports_g_yoga", code: "YOGA", name: "Yoga & Aerobics Studio", type: "amenity", x: 40, y: 225, w: 150, h: 65, color: "#dcfce7" },
          { id: "sports_g_coach", code: "COACH", name: "Director of Physical Education", type: "office", x: 200, y: 225, w: 120, h: 65, color: "#f1f5f9" },
          { id: "sports_g_firstaid", code: "FIRST-AID", name: "Sports Physio & First Aid Post", type: "emergency", x: 330, y: 225, w: 100, h: 65, color: "#fee2e2" },
          { id: "sports_g_exit", code: "FIRE-EXIT", name: "Emergency Exit Sports Pavilion", type: "emergency_exit", x: 440, y: 235, w: 110, h: 55, color: "#fecaca", isExit: true },
          { id: "sports_g_lockers", code: "LOCKERS", name: "Showers & Locker Suite", type: "restroom", x: 560, y: 225, w: 110, h: 65, color: "#e0f2fe" }
        ]
      }
    }
  },
  bldg_health: {
    name: "Campus Health Center",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "health_g_triage", code: "TRIAGE", name: "24/7 Emergency Triage Post", type: "emergency", x: 40, y: 75, w: 190, h: 125, color: "#fee2e2" },
          { id: "health_g_doctor", code: "DOCTOR", name: "Chief Medical Officer Cabin", type: "emergency", x: 240, y: 75, w: 150, h: 125, color: "#fee2e2" },
          { id: "health_g_ward", code: "WARD", name: "4-Bed Critical Observation Ward", type: "emergency", x: 400, y: 75, w: 150, h: 125, color: "#fee2e2" },
          { id: "health_g_ambu", code: "AMBULANCE", name: "Ambulance Direct Rapid Dock", type: "emergency", x: 560, y: 75, w: 110, h: 125, color: "#fee2e2" },
          { id: "health_g_pharmacy", code: "PHARMACY", name: "24-Hour Campus Pharmacy", type: "emergency", x: 40, y: 225, w: 140, h: 65, color: "#fee2e2" },
          { id: "health_g_diag", code: "LAB-TEST", name: "Pathology & Blood Testing Unit", type: "emergency", x: 190, y: 225, w: 120, h: 65, color: "#fee2e2" },
          { id: "health_g_steril", code: "STERILE", name: "Autoclave & Decon Room", type: "emergency", x: 320, y: 225, w: 110, h: 65, color: "#fee2e2" },
          { id: "health_g_exit", code: "FIRE-EXIT", name: "Clinical Fire Evac Corridor", type: "emergency_exit", x: 440, y: 235, w: 110, h: 55, color: "#fecaca", isExit: true },
          { id: "health_g_wc", code: "CLINIC-WC", name: "Sterilized Medical Restrooms", type: "restroom", x: 560, y: 225, w: 110, h: 65, color: "#e0f2fe" }
        ]
      }
    }
  },
  bldg_hostels: {
    name: "Student Hostels & Residences",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "hostel_g_warden", code: "WARDEN", name: "Chief Warden Secretariat & Desk", type: "office", x: 40, y: 75, w: 180, h: 85, color: "#f1f5f9" },
          { id: "hostel_g_mess", code: "MESS", name: "Student Dining Mess & Kitchen", type: "amenity", x: 230, y: 75, w: 180, h: 85, color: "#fef3c7" },
          { id: "hostel_g_common", code: "COMMON", name: "Recreation & TV Common Room", type: "amenity", x: 420, y: 75, w: 175, h: 125, color: "#e0f2fe" },
          { id: "hostel_g_lift", code: "LIFT-H", name: "Resident Elevator Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "hostel_g_stairs", code: "STAIRS-H", name: "Central Hostel Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "hostel_g_laundry", code: "LAUNDRY", name: "Automated Laundromat Bay", type: "amenity", x: 40, y: 225, w: 130, h: 65, color: "#bae6fd" },
          { id: "hostel_g_study", code: "STUDY-G", name: "24-Hour Quiet Study Sanctuary", type: "library", x: 180, y: 225, w: 150, h: 65, color: "#e0e7ff" },
          { id: "hostel_g_exit", code: "FIRE-EXIT", name: "Emergency Fire Exit Courtyard", type: "emergency_exit", x: 340, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "hostel_g_wc", code: "HOSTEL-WC", name: "Ground Shower & Washrooms", type: "restroom", x: 465, y: 225, w: 100, h: 65, color: "#e0f2fe" },
          { id: "hostel_g_store", code: "PARCEL", name: "Student Package & Parcel Desk", type: "amenity", x: 575, y: 225, w: 95, h: 65, color: "#bae6fd" }
        ]
      },
      1: {
        floorName: "First Floor (Level 1)",
        floorLevel: 1,
        rooms: [
          { id: "hostel_1_wing_a", code: "WING-A", name: "Resident Dorms (Rooms 101-104)", type: "classroom", x: 40, y: 75, w: 180, h: 85, color: "#f1f5f9" },
          { id: "hostel_1_wing_b", code: "WING-B", name: "Resident Dorms (Rooms 105-108)", type: "classroom", x: 230, y: 75, w: 180, h: 85, color: "#f1f5f9" },
          { id: "hostel_1_wing_c", code: "WING-C", name: "Resident Dorms (Rooms 109-112)", type: "classroom", x: 420, y: 75, w: 175, h: 125, color: "#f1f5f9" },
          { id: "hostel_1_lift", code: "LIFT-H", name: "Resident Elevator Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "hostel_1_stairs", code: "STAIRS-H", name: "Central Hostel Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "hostel_1_warden", code: "NIGHT-POST", name: "Assistant Warden Night Station", type: "office", x: 40, y: 225, w: 130, h: 65, color: "#f1f5f9" },
          { id: "hostel_1_study", code: "STUDY-1", name: "Group Discussion Study Pods", type: "library", x: 180, y: 225, w: 150, h: 65, color: "#e0e7ff" },
          { id: "hostel_1_exit", code: "FIRE-EXIT", name: "Fire Escape Stairwell North", type: "emergency_exit", x: 340, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "hostel_1_wc", code: "HOSTEL-WC", name: "Level 1 Showers & Bathrooms", type: "restroom", x: 465, y: 225, w: 100, h: 65, color: "#e0f2fe" },
          { id: "hostel_1_water", code: "H2O-1", name: "RO Water Dispenser Level 1", type: "amenity", x: 575, y: 225, w: 95, h: 65, color: "#bae6fd" }
        ]
      },
      2: {
        floorName: "Second Floor (Level 2)",
        floorLevel: 2,
        rooms: [
          { id: "hostel_2_wing_d", code: "WING-D", name: "Resident Dorms (Rooms 201-204)", type: "classroom", x: 40, y: 75, w: 180, h: 85, color: "#f1f5f9" },
          { id: "hostel_2_wing_e", code: "WING-E", name: "Resident Dorms (Rooms 205-208)", type: "classroom", x: 230, y: 75, w: 180, h: 85, color: "#f1f5f9" },
          { id: "hostel_2_wing_f", code: "WING-F", name: "Resident Dorms (Rooms 209-212)", type: "classroom", x: 420, y: 75, w: 175, h: 125, color: "#f1f5f9" },
          { id: "hostel_2_lift", code: "LIFT-H", name: "Resident Elevator Core", type: "elevator", x: 610, y: 75, w: 60, h: 60, color: "#fef08a" },
          { id: "hostel_2_stairs", code: "STAIRS-H", name: "Central Hostel Stairs", type: "stairs", x: 610, y: 145, w: 60, h: 55, color: "#fed7aa" },
          { id: "hostel_2_gym", code: "TERRACE", name: "Open Air Fitness & Games Terrace", type: "amenity", x: 40, y: 225, w: 130, h: 65, color: "#dcfce7" },
          { id: "hostel_2_study", code: "STUDY-2", name: "Silent Project Workstation Pods", type: "library", x: 180, y: 225, w: 150, h: 65, color: "#e0e7ff" },
          { id: "hostel_2_exit", code: "FIRE-EXIT", name: "Roof Fire Escape Staging", type: "emergency_exit", x: 340, y: 235, w: 115, h: 55, color: "#fecaca", isExit: true },
          { id: "hostel_2_wc", code: "HOSTEL-WC", name: "Level 2 Showers & Bathrooms", type: "restroom", x: 465, y: 225, w: 100, h: 65, color: "#e0f2fe" },
          { id: "hostel_2_solar", code: "SOLAR", name: "Solar Heater & Plant Core", type: "amenity", x: 575, y: 225, w: 95, h: 65, color: "#fed7aa" }
        ]
      }
    }
  },
  bldg_gate: {
    name: "Main Campus Gate & Security Command",
    floors: {
      0: {
        floorName: "Ground Floor (Level 0)",
        floorLevel: 0,
        rooms: [
          { id: "gate_g_cmd", code: "SECURITY", name: "Central Security Command Post", type: "emergency", x: 40, y: 75, w: 190, h: 125, color: "#fee2e2" },
          { id: "gate_g_visitor", code: "VISITOR", name: "Visitor Pass & RFID Badging", type: "office", x: 240, y: 75, w: 170, h: 125, color: "#f1f5f9" },
          { id: "gate_g_turnstile", code: "BARRIERS", name: "RFID Boom Barriers & Turnstiles", type: "lab", x: 420, y: 75, w: 130, h: 125, color: "#e0e7ff" },
          { id: "gate_g_shuttle", code: "SHUTTLE", name: "Electric Campus Shuttle Dock", type: "amenity", x: 560, y: 75, w: 110, h: 125, color: "#bae6fd" },
          { id: "gate_g_lost", code: "LOST-FOUND", name: "Lost Property & Deliveries Desk", type: "office", x: 40, y: 225, w: 140, h: 65, color: "#f1f5f9" },
          { id: "gate_g_permit", code: "PERMITS", name: "Vehicle Parking Permits", type: "office", x: 190, y: 225, w: 140, h: 65, color: "#f1f5f9" },
          { id: "gate_g_exit", code: "FIRE-EXIT", name: "Perimeter Emergency Gate", type: "emergency_exit", x: 340, y: 235, w: 110, h: 55, color: "#fecaca", isExit: true },
          { id: "gate_g_patrol", code: "PATROL", name: "Mobile Patrol Vehicle Bay", type: "emergency", x: 460, y: 225, w: 100, h: 65, color: "#fee2e2" },
          { id: "gate_g_wc", code: "GATE-WC", name: "Security Staff Restrooms", type: "restroom", x: 570, y: 225, w: 100, h: 65, color: "#e0f2fe" }
        ]
      }
    }
  }
};

// Navigational Graph: Outdoor Paths & Inter-Building Connections
// Nodes have: id, label, x, y, buildingId (optional), floor (optional), isAccessible (ramp/flat), isExit (optional)
export const navigationNodes = [
  // Gate & Plaza
  { id: "node_gate", label: "Campus Main Gate", x: 495, y: 630, type: "outdoor", accessible: true },
  { id: "node_plaza_s", label: "South Boulevard Plaza", x: 495, y: 550, type: "outdoor", accessible: true },
  
  // Central Avenue Walkways
  { id: "node_cent_junc", label: "Central Quad Junction", x: 495, y: 390, type: "outdoor", accessible: true },
  { id: "node_north_junc", label: "North Avenue Junction", x: 495, y: 240, type: "outdoor", accessible: true },
  { id: "node_west_ave", label: "West Campus Avenue", x: 265, y: 390, type: "outdoor", accessible: true },
  { id: "node_east_ave", label: "East Technology Avenue", x: 710, y: 390, type: "outdoor", accessible: true },

  // Alpha Building Entrances & Nodes
  { id: "node_alpha_ent_s", label: "Alpha Block South Entrance", x: 265, y: 300, buildingId: "bldg_alpha", floor: 0, accessible: true },
  { id: "node_alpha_ent_n", label: "Alpha Block North Entrance", x: 265, y: 160, buildingId: "bldg_alpha", floor: 0, accessible: true },
  { id: "node_alpha_f0_corridor", label: "Alpha Block G Floor Corridor", x: 265, y: 230, buildingId: "bldg_alpha", floor: 0, accessible: true },
  { id: "node_alpha_f0_lift", label: "Alpha Elevator G Floor", x: 240, y: 220, buildingId: "bldg_alpha", floor: 0, accessible: true, isLift: true },
  { id: "node_alpha_f0_stairs", label: "Alpha Staircase G Floor", x: 285, y: 220, buildingId: "bldg_alpha", floor: 0, accessible: false, isStairs: true },
  
  // Alpha Floor 1 Nodes
  { id: "node_alpha_f1_lift", label: "Alpha Elevator Floor 1", x: 240, y: 220, buildingId: "bldg_alpha", floor: 1, accessible: true, isLift: true },
  { id: "node_alpha_f1_stairs", label: "Alpha Staircase Floor 1", x: 285, y: 220, buildingId: "bldg_alpha", floor: 1, accessible: false, isStairs: true },
  { id: "node_alpha_f1_corridor", label: "Alpha Floor 1 Main Corridor", x: 265, y: 230, buildingId: "bldg_alpha", floor: 1, accessible: true },
  { id: "node_alpha_f1_ai_lab", label: "AI & Neural Networks Lab (101)", x: 210, y: 180, buildingId: "bldg_alpha", floor: 1, accessible: true },
  { id: "node_alpha_f1_hod", label: "CSE HOD Office (103)", x: 310, y: 180, buildingId: "bldg_alpha", floor: 1, accessible: true },

  // Alpha Floor 2 Nodes
  { id: "node_alpha_f2_lift", label: "Alpha Elevator Floor 2", x: 240, y: 220, buildingId: "bldg_alpha", floor: 2, accessible: true, isLift: true },
  { id: "node_alpha_f2_stairs", label: "Alpha Staircase Floor 2", x: 285, y: 220, buildingId: "bldg_alpha", floor: 2, accessible: false, isStairs: true },
  { id: "node_alpha_f2_corridor", label: "Alpha Floor 2 Corridor", x: 265, y: 230, buildingId: "bldg_alpha", floor: 2, accessible: true },
  { id: "node_alpha_f2_cyber_lab", label: "Cybersecurity & Forensic Lab (201)", x: 210, y: 180, buildingId: "bldg_alpha", floor: 2, accessible: true },
  { id: "node_alpha_f2_smart_theatre", label: "Smart Lecture Theatre Alpha (203)", x: 310, y: 180, buildingId: "bldg_alpha", floor: 2, accessible: true },
  { id: "node_alpha_f2_exit", label: "Alpha Floor 2 Emergency Fire Exit", x: 340, y: 230, buildingId: "bldg_alpha", floor: 2, accessible: true, isExit: true },

  // Beta Building Nodes
  { id: "node_beta_ent_s", label: "Beta Block South Entrance", x: 705, y: 300, buildingId: "bldg_beta", floor: 0, accessible: true },
  { id: "node_beta_ent_w", label: "Beta Block West Entrance", x: 620, y: 230, buildingId: "bldg_beta", floor: 0, accessible: true },
  { id: "node_beta_f0_corridor", label: "Beta Ground Floor Corridor", x: 705, y: 230, buildingId: "bldg_beta", floor: 0, accessible: true },
  { id: "node_beta_f0_lift", label: "Beta Elevator G Floor", x: 680, y: 220, buildingId: "bldg_beta", floor: 0, accessible: true, isLift: true },
  { id: "node_beta_f0_stairs", label: "Beta Staircase G Floor", x: 730, y: 220, buildingId: "bldg_beta", floor: 0, accessible: false, isStairs: true },
  
  // Beta Floor 1
  { id: "node_beta_f1_lift", label: "Beta Elevator Floor 1", x: 680, y: 220, buildingId: "bldg_beta", floor: 1, accessible: true, isLift: true },
  { id: "node_beta_f1_stairs", label: "Beta Staircase Floor 1", x: 730, y: 220, buildingId: "bldg_beta", floor: 1, accessible: false, isStairs: true },
  { id: "node_beta_f1_corridor", label: "Beta Floor 1 Corridor", x: 705, y: 230, buildingId: "bldg_beta", floor: 1, accessible: true },
  { id: "node_beta_f1_vlsi", label: "Cadence & VLSI Design Center (B-101)", x: 650, y: 180, buildingId: "bldg_beta", floor: 1, accessible: true },

  // Beta Floor 2
  { id: "node_beta_f2_lift", label: "Beta Elevator Floor 2", x: 680, y: 220, buildingId: "bldg_beta", floor: 2, accessible: true, isLift: true },
  { id: "node_beta_f2_stairs", label: "Beta Staircase Floor 2", x: 730, y: 220, buildingId: "bldg_beta", floor: 2, accessible: false, isStairs: true },
  { id: "node_beta_f2_corridor", label: "Beta Floor 2 Corridor", x: 705, y: 230, buildingId: "bldg_beta", floor: 2, accessible: true },
  { id: "node_beta_f2_auto", label: "Automotive Embedded Systems Lab (B-201)", x: 650, y: 180, buildingId: "bldg_beta", floor: 2, accessible: true },

  // Gamma Building Nodes
  { id: "node_gamma_ent_w", label: "Gamma Admin Portico", x: 400, y: 415, buildingId: "bldg_gamma", floor: 0, accessible: true },
  { id: "node_gamma_ent_e", label: "Central Library Entrance", x: 580, y: 415, buildingId: "bldg_gamma", floor: 0, accessible: true },
  { id: "node_gamma_f0_corridor", label: "Admin & Library Central Hallway", x: 490, y: 415, buildingId: "bldg_gamma", floor: 0, accessible: true },
  { id: "node_gamma_f0_lift", label: "Gamma Elevator G Floor", x: 470, y: 415, buildingId: "bldg_gamma", floor: 0, accessible: true, isLift: true },
  { id: "node_gamma_f0_stairs", label: "Gamma Grand Stairs G Floor", x: 510, y: 415, buildingId: "bldg_gamma", floor: 0, accessible: false, isStairs: true },
  
  // Gamma Floor 1
  { id: "node_gamma_f1_lift", label: "Gamma Elevator Floor 1", x: 470, y: 415, buildingId: "bldg_gamma", floor: 1, accessible: true, isLift: true },
  { id: "node_gamma_f1_stairs", label: "Gamma Grand Stairs Floor 1", x: 510, y: 415, buildingId: "bldg_gamma", floor: 1, accessible: false, isStairs: true },
  { id: "node_gamma_f1_corridor", label: "Central Digital Library Level 1", x: 490, y: 415, buildingId: "bldg_gamma", floor: 1, accessible: true },
  { id: "node_gamma_f1_study", label: "Silent Research Carrels & IEEE Archives", x: 540, y: 415, buildingId: "bldg_gamma", floor: 1, accessible: true },

  // Delta Building Nodes (Auditorium & Hackathon)
  { id: "node_delta_ent_w", label: "Delta Auditorium Plaza Entrance", x: 620, y: 525, buildingId: "bldg_delta", floor: 0, accessible: true },
  { id: "node_delta_ent_n", label: "Delta North Stage Door", x: 710, y: 450, buildingId: "bldg_delta", floor: 0, accessible: true },
  { id: "node_delta_f0_corridor", label: "Auditorium Grand Lobby", x: 710, y: 525, buildingId: "bldg_delta", floor: 0, accessible: true },
  { id: "node_delta_f0_lift", label: "Delta ADA Elevator G Floor", x: 690, y: 525, buildingId: "bldg_delta", floor: 0, accessible: true, isLift: true },
  { id: "node_delta_f0_stairs", label: "Delta Balcony Stairs G Floor", x: 730, y: 525, buildingId: "bldg_delta", floor: 0, accessible: false, isStairs: true },
  { id: "node_delta_hack_arena", label: "Hackathon Team Arena (Tech Pulse)", x: 760, y: 525, buildingId: "bldg_delta", floor: 0, accessible: true },
  { id: "node_delta_exit", label: "Auditorium Emergency Evacuation Exit", x: 710, y: 590, buildingId: "bldg_delta", floor: 0, accessible: true, isExit: true },
  
  // Delta Floor 1
  { id: "node_delta_f1_lift", label: "Delta ADA Elevator Floor 1", x: 690, y: 525, buildingId: "bldg_delta", floor: 1, accessible: true, isLift: true },
  { id: "node_delta_f1_stairs", label: "Delta Balcony Stairs Floor 1", x: 730, y: 525, buildingId: "bldg_delta", floor: 1, accessible: false, isStairs: true },
  { id: "node_delta_f1_corridor", label: "Auditorium Balcony Lobby", x: 710, y: 525, buildingId: "bldg_delta", floor: 1, accessible: true },
  { id: "node_delta_f1_incubator", label: "Startup Incubation & Mentorship Pods", x: 760, y: 525, buildingId: "bldg_delta", floor: 1, accessible: true },

  // Amenity Nodes
  { id: "node_food_ent_e", label: "Cafeteria & Food Court", x: 330, y: 510, buildingId: "bldg_food", floor: 0, accessible: true },
  { id: "node_sports_ent_s", label: "Sports Arena & Gym", x: 470, y: 250, buildingId: "bldg_sports", floor: 0, accessible: true },
  { id: "node_health_ent_w", label: "Campus Health Center & First Aid", x: 840, y: 395, buildingId: "bldg_health", floor: 0, accessible: true, isEmergency: true },
  { id: "node_hostel_ent_w", label: "Hostel Security Checkpoint", x: 830, y: 220, buildingId: "bldg_hostels", floor: 0, accessible: true }
];

// Edges with distance (meters) and accessibility properties
export const navigationEdges = [
  // Gate to Plaza
  { from: "node_gate", to: "node_plaza_s", distance: 80, accessible: true, pathType: "paved_walkway" },
  { from: "node_plaza_s", to: "node_cent_junc", distance: 160, accessible: true, pathType: "central_avenue" },
  { from: "node_cent_junc", to: "node_north_junc", distance: 150, accessible: true, pathType: "central_avenue" },

  // East-West Connectors
  { from: "node_cent_junc", to: "node_west_ave", distance: 230, accessible: true, pathType: "boulevard" },
  { from: "node_cent_junc", to: "node_east_ave", distance: 215, accessible: true, pathType: "boulevard" },

  // South Boulevard connections
  { from: "node_plaza_s", to: "node_food_ent_e", distance: 170, accessible: true, pathType: "terrace_walkway" },
  { from: "node_plaza_s", to: "node_delta_ent_w", distance: 130, accessible: true, pathType: "grand_plaza" },

  // West Avenue connections (Alpha & Food)
  { from: "node_west_ave", to: "node_alpha_ent_s", distance: 90, accessible: true, pathType: "covered_walkway" },
  { from: "node_west_ave", to: "node_food_ent_e", distance: 135, accessible: true, pathType: "food_court_path" },
  { from: "node_alpha_ent_n", to: "node_north_junc", distance: 240, accessible: true, pathType: "quad_path" },

  // North Avenue connections (Sports & Beta)
  { from: "node_north_junc", to: "node_sports_ent_s", distance: 30, accessible: true, pathType: "sports_plaza" },
  { from: "node_north_junc", to: "node_beta_ent_w", distance: 130, accessible: true, pathType: "shaded_walkway" },

  // East Avenue connections (Beta, Delta, Health, Hostels)
  { from: "node_east_ave", to: "node_beta_ent_s", distance: 90, accessible: true, pathType: "boulevard" },
  { from: "node_east_ave", to: "node_delta_ent_n", distance: 60, accessible: true, pathType: "auditorium_walkway" },
  { from: "node_east_ave", to: "node_health_ent_w", distance: 130, accessible: true, pathType: "clinic_access" },
  { from: "node_beta_ent_w", to: "node_hostel_ent_w", distance: 210, accessible: true, pathType: "hostel_avenue" },

  // Gamma (Admin & Library) connections
  { from: "node_cent_junc", to: "node_gamma_ent_w", distance: 100, accessible: true, pathType: "admin_portico" },
  { from: "node_cent_junc", to: "node_gamma_ent_e", distance: 90, accessible: true, pathType: "library_portico" },
  { from: "node_gamma_ent_w", to: "node_gamma_f0_corridor", distance: 90, accessible: true, pathType: "indoor" },
  { from: "node_gamma_ent_e", to: "node_gamma_f0_corridor", distance: 90, accessible: true, pathType: "indoor" },
  { from: "node_gamma_f0_corridor", to: "node_gamma_f0_lift", distance: 20, accessible: true, pathType: "indoor" },
  { from: "node_gamma_f0_corridor", to: "node_gamma_f0_stairs", distance: 20, accessible: false, pathType: "stairs" },
  { from: "node_gamma_f0_lift", to: "node_gamma_f1_lift", distance: 15, accessible: true, isVertical: true, lift: true },
  { from: "node_gamma_f0_stairs", to: "node_gamma_f1_stairs", distance: 25, accessible: false, isVertical: true, stairs: true },
  { from: "node_gamma_f1_lift", to: "node_gamma_f1_corridor", distance: 20, accessible: true, pathType: "indoor" },
  { from: "node_gamma_f1_stairs", to: "node_gamma_f1_corridor", distance: 20, accessible: false, pathType: "indoor" },
  { from: "node_gamma_f1_corridor", to: "node_gamma_f1_study", distance: 50, accessible: true, pathType: "indoor" },

  // Alpha Building Internal Routing
  { from: "node_alpha_ent_s", to: "node_alpha_f0_corridor", distance: 70, accessible: true, pathType: "indoor_lobby" },
  { from: "node_alpha_ent_n", to: "node_alpha_f0_corridor", distance: 70, accessible: true, pathType: "indoor_lobby" },
  { from: "node_alpha_f0_corridor", to: "node_alpha_f0_lift", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_alpha_f0_corridor", to: "node_alpha_f0_stairs", distance: 25, accessible: false, pathType: "stairs" },

  // Alpha Vertical Connections (Lift & Stairs)
  { from: "node_alpha_f0_lift", to: "node_alpha_f1_lift", distance: 15, accessible: true, isVertical: true, lift: true },
  { from: "node_alpha_f1_lift", to: "node_alpha_f2_lift", distance: 15, accessible: true, isVertical: true, lift: true },
  { from: "node_alpha_f0_stairs", to: "node_alpha_f1_stairs", distance: 25, accessible: false, isVertical: true, stairs: true },
  { from: "node_alpha_f1_stairs", to: "node_alpha_f2_stairs", distance: 25, accessible: false, isVertical: true, stairs: true },

  // Alpha Floor 1 Internal
  { from: "node_alpha_f1_lift", to: "node_alpha_f1_corridor", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_alpha_f1_stairs", to: "node_alpha_f1_corridor", distance: 25, accessible: false, pathType: "indoor" },
  { from: "node_alpha_f1_corridor", to: "node_alpha_f1_ai_lab", distance: 60, accessible: true, pathType: "indoor" },
  { from: "node_alpha_f1_corridor", to: "node_alpha_f1_hod", distance: 55, accessible: true, pathType: "indoor" },

  // Alpha Floor 2 Internal
  { from: "node_alpha_f2_lift", to: "node_alpha_f2_corridor", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_alpha_f2_stairs", to: "node_alpha_f2_corridor", distance: 25, accessible: false, pathType: "indoor" },
  { from: "node_alpha_f2_corridor", to: "node_alpha_f2_cyber_lab", distance: 60, accessible: true, pathType: "indoor" },
  { from: "node_alpha_f2_corridor", to: "node_alpha_f2_smart_theatre", distance: 55, accessible: true, pathType: "indoor" },
  { from: "node_alpha_f2_corridor", to: "node_alpha_f2_exit", distance: 75, accessible: true, pathType: "emergency_stairwell" },

  // Beta Internal Routing
  { from: "node_beta_ent_s", to: "node_beta_f0_corridor", distance: 70, accessible: true, pathType: "indoor_lobby" },
  { from: "node_beta_ent_w", to: "node_beta_f0_corridor", distance: 85, accessible: true, pathType: "indoor_lobby" },
  { from: "node_beta_f0_corridor", to: "node_beta_f0_lift", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_beta_f0_corridor", to: "node_beta_f0_stairs", distance: 25, accessible: false, pathType: "stairs" },
  { from: "node_beta_f0_lift", to: "node_beta_f1_lift", distance: 15, accessible: true, isVertical: true, lift: true },
  { from: "node_beta_f1_lift", to: "node_beta_f2_lift", distance: 15, accessible: true, isVertical: true, lift: true },
  { from: "node_beta_f0_stairs", to: "node_beta_f1_stairs", distance: 25, accessible: false, isVertical: true, stairs: true },
  { from: "node_beta_f1_stairs", to: "node_beta_f2_stairs", distance: 25, accessible: false, isVertical: true, stairs: true },
  { from: "node_beta_f1_lift", to: "node_beta_f1_corridor", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_beta_f1_stairs", to: "node_beta_f1_corridor", distance: 25, accessible: false, pathType: "indoor" },
  { from: "node_beta_f1_corridor", to: "node_beta_f1_vlsi", distance: 65, accessible: true, pathType: "indoor" },
  { from: "node_beta_f2_lift", to: "node_beta_f2_corridor", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_beta_f2_stairs", to: "node_beta_f2_corridor", distance: 25, accessible: false, pathType: "indoor" },
  { from: "node_beta_f2_corridor", to: "node_beta_f2_auto", distance: 65, accessible: true, pathType: "indoor" },

  // Delta Internal Routing
  { from: "node_delta_ent_w", to: "node_delta_f0_corridor", distance: 90, accessible: true, pathType: "indoor" },
  { from: "node_delta_ent_n", to: "node_delta_f0_corridor", distance: 75, accessible: true, pathType: "indoor" },
  { from: "node_delta_f0_corridor", to: "node_delta_hack_arena", distance: 50, accessible: true, pathType: "indoor" },
  { from: "node_delta_f0_corridor", to: "node_delta_exit", distance: 65, accessible: true, pathType: "emergency_exit" },
  { from: "node_delta_f0_corridor", to: "node_delta_f0_lift", distance: 25, accessible: true, pathType: "indoor" },
  { from: "node_delta_f0_corridor", to: "node_delta_f0_stairs", distance: 25, accessible: false, pathType: "stairs" },
  { from: "node_delta_f0_lift", to: "node_delta_f1_lift", distance: 15, accessible: true, isVertical: true, lift: true },
  { from: "node_delta_f0_stairs", to: "node_delta_f1_stairs", distance: 25, accessible: false, isVertical: true, stairs: true },
  { from: "node_delta_f1_lift", to: "node_delta_f1_corridor", distance: 20, accessible: true, pathType: "indoor" },
  { from: "node_delta_f1_stairs", to: "node_delta_f1_corridor", distance: 20, accessible: false, pathType: "indoor" },
  { from: "node_delta_f1_corridor", to: "node_delta_f1_incubator", distance: 50, accessible: true, pathType: "indoor" }
];

// Pre-indexed POIs (Points of Interest) for fast search and auto-complete
export const campusPOIs = [
  { id: "poi_ai_lab", name: "AI & Neural Networks Lab (Room 101)", building: "Alpha Block", floor: 1, nodeId: "node_alpha_f1_ai_lab", category: "lab", keywords: ["ai", "neural", "gpu", "cse", "lab"] },
  { id: "poi_cyber_lab", name: "Cybersecurity & Forensic Lab (Room 201)", building: "Alpha Block", floor: 2, nodeId: "node_alpha_f2_cyber_lab", category: "lab", keywords: ["cyber", "security", "forensic", "hack", "cse"] },
  { id: "poi_hackathon", name: "Tech Pulse 2026 Hackathon Arena", building: "Delta Complex", floor: 0, nodeId: "node_delta_hack_arena", category: "event", keywords: ["hackathon", "tech pulse", "sprint", "arena", "auditorium"] },
  { id: "poi_smart_theatre", name: "Smart Lecture Theatre Alpha (Room 203)", building: "Alpha Block", floor: 2, nodeId: "node_alpha_f2_smart_theatre", category: "classroom", keywords: ["lecture", "theatre", "hall", "class"] },
  { id: "poi_vlsi_lab", name: "Cadence & VLSI Design Center", building: "Beta Block", floor: 1, nodeId: "node_beta_f1_vlsi", category: "lab", keywords: ["vlsi", "cadence", "chips", "ece", "circuits"] },
  { id: "poi_library", name: "Central Digital Library & Reading Hall", building: "Gamma Block", floor: 0, nodeId: "node_gamma_f0_corridor", category: "library", keywords: ["library", "books", "study", "periodicals", "quiet"] },
  { id: "poi_dean_office", name: "Dean Academics & Directorate", building: "Gamma Block", floor: 0, nodeId: "node_gamma_ent_w", category: "office", keywords: ["dean", "director", "admin", "academics"] },
  { id: "poi_food_court", name: "Campus Food Court & Cafeteria", building: "Food Court", floor: 0, nodeId: "node_food_ent_e", category: "food", keywords: ["food", "canteen", "cafe", "coffee", "lunch", "snacks"] },
  { id: "poi_health_clinic", name: "Campus Health Center (First Aid & Doctor)", building: "Health Center", floor: 0, nodeId: "node_health_ent_w", category: "emergency", keywords: ["medical", "clinic", "first aid", "doctor", "health", "hospital", "ambulance"] },
  { id: "poi_sports_gym", name: "Indoor Badminton & Fitness Gymnasium", building: "Sports Arena", floor: 0, nodeId: "node_sports_ent_s", category: "sports", keywords: ["gym", "sports", "badminton", "fitness", "workout"] },
  { id: "poi_main_gate", name: "Main Campus Entrance Gate A", building: "Main Gate", floor: 0, nodeId: "node_gate", category: "security", keywords: ["gate", "entrance", "exit", "visitor", "security"] }
];
