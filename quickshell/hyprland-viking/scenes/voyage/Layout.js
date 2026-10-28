.pragma library

// ============================================================================
// Layout.js — fixed coordinates of the voyage scene.
// ============================================================================

// groundY is the ship's waterline; waterY the horizon.
var GEOMETRY = { pw: 384, ph: 216, groundY: 146, waterY: 122 }

// The drakkar is drawn by the Valhalla renderer at 1x around local y = 152.
// This places it small and far away, centred on screen, with its waterline
// (local y = baseSy + 6) on groundY. Raise `scale` for a closer shot.
var SHIP = { tx: 148, ty: -12, scale: 1, baseSy: 152 }

// Crew along the gunwale in the ship's local coordinates. The bow (dragon head)
// is on the left, so the ship sails left and everybody faces left.
var CREW = [
  { x: 21, role: "skald", weapon: "horn",   state: "idle",  hair: "#b85d28", tunic: "#2c423b", job: "lookout" },
  { x: 29, role: "smith", weapon: "",       state: "idle",  hair: "#8c4a27", tunic: "#263845", job: "rower", stroke: 0 },
  { x: 37, role: "skald", weapon: "",       state: "idle",  hair: "#d8a24a", tunic: "#1f3b3a", job: "rower", stroke: 1 },
  { x: 45, role: "smith", weapon: "",       state: "idle",  hair: "#4a3020", tunic: "#5c3824", job: "rower", stroke: 2 },
  { x: 53, role: "skald", weapon: "",       state: "idle",  hair: "#c9c9c9", tunic: "#2a3342", job: "rower", stroke: 3 },
  { x: 61, role: "smith", weapon: "",       state: "idle",  hair: "#e6c36a", tunic: "#243a46", job: "rower", stroke: 4 },
  { x: 70, role: "jarl",  weapon: "axe",    state: "idle",  hair: "#d8a24a", tunic: "#263845", job: "helmsman" }
]
