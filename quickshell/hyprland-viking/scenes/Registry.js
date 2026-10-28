.pragma library
.import "valhalla/Scene.js" as Valhalla
.import "battle/Scene.js" as Battle
.import "voyage/Scene.js" as Voyage

// ============================================================================
// Registry.js — every visualisation the settings panel can offer.
// To add one: create scenes/<id>/Scene.js and append its `scene` object here.
// ============================================================================

var SCENES = [
  Valhalla.scene,
  Battle.scene,
  Voyage.scene
]

function list() {
  return SCENES
}

function ids() {
  return SCENES.map(function(s) { return s.id })
}

function get(id) {
  for (var i = 0; i < SCENES.length; i++) {
    if (SCENES[i].id === id) return SCENES[i]
  }
  return SCENES[0]
}

// Serialisable summary for the UI (functions stripped).
function summaries() {
  return SCENES.map(function(s) {
    return { id: s.id, name: s.name, description: s.description, swatches: s.swatches, supports: s.supports }
  })
}
