.pragma library

// ============================================================================
// Layout.js — fixed coordinates of the battle scene, shared by the backdrop,
// the simulation and the renderer so they always agree on where things are.
// ============================================================================

var GEOMETRY = { pw: 384, ph: 216, groundY: 160, waterY: 170 }

// Fighters stand on "lanes": the y of their feet, between these bounds.
var LANE_MIN = 170
var LANE_MAX = 202

var NORSE_SPAWN_X = 104     // beach next to the beached drakkar
var SAXON_SPAWN_X = 282     // broken gate of the burning palisade
var NORSE_BANNER = { x: 128, lane: 178 }
var SAXON_BANNER = { x: 262, lane: 176 }

// Burning spots on the Saxon settlement. x/y is the base of the flames.
var FIRES = [
  { x: 296, y: 100, w: 8,  power: 1.0 },    // watchtower roof
  { x: 340, y: 106, w: 22, power: 1.2 },    // hall thatch
  { x: 366, y: 112, w: 10, power: 0.9 },
  { x: 274, y: 140, w: 8,  power: 0.8 },    // palisade by the gate
  { x: 322, y: 142, w: 10, power: 0.7 }
]
