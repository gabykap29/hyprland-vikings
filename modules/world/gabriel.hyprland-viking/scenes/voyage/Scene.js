.pragma library
.import "Backdrop.js" as Backdrop
.import "Renderer.js" as Renderer
.import "Simulation.js" as Simulation
.import "Layout.js" as Layout

// ============================================================================
// Scene.js — Travesía: the Raven Clan drakkar under oar and sail on open sea.
// See scenes/README.md for the scene contract.
// ============================================================================

var scene = {
  id: "voyage",
  name: "Travesía · Drakkar en alta mar",
  description: "El drakkar surca el mar al ritmo del tambor, con ballenas, islas con balizas y el cielo cambiando.",
  swatches: ["#0e1e30", "#2f7a99", "#e6edf0", "#8f2a24"],
  geometry: Layout.GEOMETRY,
  supports: {
    timeOfDay: true,
    effects: ["lightning", "ravens", "stars", "aurora", "vikings", "wildlife"]
  },

  createState: function(pw, ph) {
    return Simulation.createInitialState(pw, ph)
  },

  step: function(sim, weather, geometry, env) {
    Simulation.step(sim, weather, geometry, env)
  },

  renderBackdrop: function(ctx, geometry, env) {
    Backdrop.renderBackdrop(ctx, geometry, env)
  },

  renderDynamic: function(ctx, sim, weather, geometry, env) {
    Renderer.renderDynamic(ctx, sim, weather, geometry, env)
  },

  lightning: function(sim, x) {
    Simulation.lightning(sim, x)
  }
}
