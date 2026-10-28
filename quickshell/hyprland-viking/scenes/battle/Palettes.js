.pragma library
.import "../valhalla/Palettes.js" as Base

// ============================================================================
// Palettes.js — battle scene colours. Sky, sun/moon, clouds and the colour grade
// come from the Valhalla palettes; this adds smoke, field, sea and timber.
// ============================================================================

var OVERRIDES = {
  night: {
    sky: ["#04060a", "#070a10", "#0a1018", "#101722", "#171e2a", "#252330", "#3a2b30", "#52352f"],
    glowRGB: "255, 110, 40", glowScale: 2.4,
    haze: "rgba(30, 20, 18, 0.30)",
    field: "#1b2420", fieldLight: "#26322b", mud: "#241c16", mudLight: "#33271d",
    sand: "#4a4333", sea: "#0d2232", seaLight: "#1b3b4c",
    wood: "#4a3220", woodLight: "#6a4a30", woodDark: "#2a1a10", thatch: "#4a3f22", thatchLight: "#6b5a2e", stone: "#3c434a"
  },
  dawn: {
    haze: "rgba(70, 40, 40, 0.28)",
    field: "#2a3a30", fieldLight: "#3a4c3e", mud: "#3a2c24", mudLight: "#52402f",
    sand: "#8c7a66", sea: "#3a4f72", seaLight: "#6a82a8",
    wood: "#5a3d28", woodLight: "#7e5a3a", woodDark: "#33211a", thatch: "#6a5a38", thatchLight: "#8e7a48", stone: "#5a6068"
  },
  day: {
    haze: "rgba(90, 80, 74, 0.22)",
    field: "#43683f", fieldLight: "#5b8650", mud: "#5a4331", mudLight: "#7a5c41",
    sand: "#cdb98a", sea: "#2f7a99", seaLight: "#7fc0d2",
    wood: "#6a4a30", woodLight: "#8c6540", woodDark: "#3d281a", thatch: "#a08a48", thatchLight: "#c4ae66", stone: "#7a8088"
  },
  dusk: {
    haze: "rgba(80, 36, 30, 0.30)",
    field: "#2c3a2c", fieldLight: "#3c4c3a", mud: "#3a2a22", mudLight: "#533b2c",
    sand: "#8a7058", sea: "#4b4670", seaLight: "#8a78a0",
    wood: "#5a3d28", woodLight: "#7e5a3a", woodDark: "#33211a", thatch: "#6a5434", thatchLight: "#8e7444", stone: "#5a5a66"
  }
}

function forPhase(phase) {
  var key = (phase === "dawn" || phase === "day" || phase === "dusk") ? phase : "night"
  var base = Base.forPhase(key)
  var out = {}
  var k
  for (k in base) out[k] = base[k]
  var o = OVERRIDES[key]
  for (k in o) out[k] = o[k]
  return out
}
