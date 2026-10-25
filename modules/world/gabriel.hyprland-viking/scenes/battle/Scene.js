.pragma library
.import "Backdrop.js" as Backdrop
.import "Renderer.js" as Renderer
.import "Simulation.js" as Simulation
.import "Layout.js" as Layout

// ============================================================================
// Scene.js — Batalla: Norse of the Raven Clan against Saxons at a burning
// stockade. See scenes/README.md for the scene contract.
// ============================================================================

var scene = {
  id: "battle",
  name: "Batalla · Clan del Cuervo vs Sajones",
  description: "Choques de escudos, flechas y cuervos sobre los caídos, ante una empalizada en llamas.",
  swatches: ["#141c28", "#e6edf0", "#4ecdc4", "#a33a2c"],
  geometry: Layout.GEOMETRY,
  supports: {
    timeOfDay: true,
    effects: ["lightning", "ravens", "stars", "aurora", "fire", "arrows"]
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
