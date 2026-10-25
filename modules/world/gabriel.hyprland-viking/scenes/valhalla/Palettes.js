.pragma library

// ============================================================================
// Palettes.js — Valhalla scene colour sets per time of day.
// Night is the original Raven Clan look; the others reuse the same geometry.
// ============================================================================

var NIGHT = {
  sky: ["#03060c", "#050b14", "#070f1c", "#0a1626", "#0e1e30", "#132a3b", "#1a3547", "#234656"],
  glowRGB: "78, 205, 196", glowScale: 1.0,
  milkyWay: true,
  celestial: "moon", celX: 57, celGlow: "225, 240, 245",
  cloud: { body: "rgba(6, 14, 24, 0.62)", rim: "rgba(120, 175, 195, 0.20)", under: "rgba(70, 130, 150, 0.14)" },
  mountainFar: "#0c1822", snow: "#486878", mountainMid: "#11222e", midTop: "#1a3140",
  forestA: "#0a1c20", forestB: "#071418",
  ground: "#121a1d", groundTop: "#1c282c", tuftA: "#1f3b34", tuftB: "#273338", puddle: "#1b3b48",
  water: ["#0d2232", "#0b1d2b", "#091825", "#07131e", "#060f18", "#050c14"], bay: "#0d2232",
  starFactor: 1.0, auroraFactor: 1.0, tint: null
}

var DAWN = {
  sky: ["#1b2447", "#2a3260", "#434273", "#6a5584", "#966a8c", "#c4838d", "#e4a08c", "#f3c192"],
  glowRGB: "255, 170, 120", glowScale: 1.2,
  milkyWay: false,
  celestial: "sun", celX: 24, celY: 82, sunCore: "#fff0c2", sunEdge: "#ffc27a", celGlow: "255, 190, 130",
  cloud: { body: "rgba(60, 48, 90, 0.55)", rim: "rgba(255, 190, 140, 0.45)", under: "rgba(200, 120, 120, 0.25)" },
  mountainFar: "#2b3354", snow: "#c9a6ad", mountainMid: "#343d5c", midTop: "#5a5273",
  forestA: "#141c2c", forestB: "#0f1624",
  ground: "#171f26", groundTop: "#243038", tuftA: "#26433e", tuftB: "#2d3a40", puddle: "#4a5f78",
  water: ["#3a4f72", "#334766", "#2c3d5a", "#263450", "#202c44", "#1a243a"], bay: "#3a4f72",
  starFactor: 0.15, auroraFactor: 0.25, tint: "rgba(255, 170, 120, 0.07)"
}

var DAY = {
  sky: ["#2f78ad", "#3f88b8", "#519ac4", "#66aad0", "#7dbbd9", "#95cadf", "#aed7e5", "#c6e3e9"],
  glowRGB: "255, 255, 255", glowScale: 0.5,
  milkyWay: false,
  celestial: "sun", celX: 235, celY: 34, sunCore: "#fffbe0", sunEdge: "#ffe58a", celGlow: "255, 240, 180",
  cloud: { body: "rgba(236, 246, 250, 0.80)", rim: "rgba(255, 255, 255, 0.90)", under: "rgba(150, 185, 205, 0.55)" },
  mountainFar: "#5d86a0", snow: "#eef6f9", mountainMid: "#4d7488", midTop: "#6e97a8",
  forestA: "#21443f", forestB: "#193732",
  ground: "#2b3f38", groundTop: "#3b5548", tuftA: "#44705a", tuftB: "#506a58", puddle: "#4a86a8",
  water: ["#2f7a99", "#2a6d8b", "#245e7a", "#1f5069", "#1a4458", "#163a4b"], bay: "#2f7a99",
  starFactor: 0.0, auroraFactor: 0.0, tint: null
}

var DUSK = {
  sky: ["#171d3b", "#292658", "#4a2f68", "#7d3f6a", "#b5535f", "#d97752", "#ee9a4d", "#f6bd6f"],
  glowRGB: "255, 150, 80", glowScale: 1.2,
  milkyWay: false,
  celestial: "sun", celX: 150, celY: 80, sunCore: "#ffe0a0", sunEdge: "#ff9a50", celGlow: "255, 140, 70",
  cloud: { body: "rgba(54, 32, 70, 0.60)", rim: "rgba(255, 150, 90, 0.50)", under: "rgba(200, 90, 100, 0.30)" },
  mountainFar: "#2a2848", snow: "#b88b9a", mountainMid: "#33304f", midTop: "#5c4560",
  forestA: "#161a2c", forestB: "#101524",
  ground: "#1a1d24", groundTop: "#2a2d33", tuftA: "#2b3f38", tuftB: "#33353b", puddle: "#6a5878",
  water: ["#4b4670", "#413c63", "#373456", "#2e2c4a", "#26243d", "#1e1d32"], bay: "#4b4670",
  starFactor: 0.2, auroraFactor: 0.3, tint: "rgba(255, 130, 70, 0.08)"
}

function forPhase(phase) {
  if (phase === "dawn") return DAWN
  if (phase === "day") return DAY
  if (phase === "dusk") return DUSK
  return NIGHT
}
