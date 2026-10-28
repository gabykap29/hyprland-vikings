.pragma library
.import "BackdropRenderer.js" as Backdrop
.import "EntityRenderer.js" as Entities
.import "WorldSimulation.js" as Simulation

// ============================================================================
// Scene.js — Valhalla: the default Raven Clan fjord scene.
//
// A scene is a plain object; scenes/Registry.js lists them. See scenes/README.md
// for the contract a new scene has to fulfil.
// ============================================================================

var scene = {
  id: "valhalla",
  name: "Valhalla · Fiordo del Cuervo",
  description: "Drakkar, Langhús y vikingos autónomos junto a un fiordo nórdico.",
  swatches: ["#0e1e30", "#4ecdc4", "#f0ba65", "#8f2a24"],
  geometry: { pw: 384, ph: 216, groundY: 158, waterY: 168 },
  supports: {
    timeOfDay: true,
    effects: ["aurora", "lightning", "ravens", "vikings", "stars"]
  },

  createState: function(pw, ph) {
    return Simulation.createInitialState(pw, ph)
  },

  step: function(sim, weather, geometry) {
    Simulation.stepSimulation(sim, weather, geometry.pw, geometry.ph, geometry.groundY, geometry.waterY)
  },

  renderBackdrop: function(ctx, geometry, env) {
    Backdrop.renderBackdrop(ctx, geometry.pw, geometry.ph, geometry.groundY, geometry.waterY, env)
  },

  renderDynamic: function(ctx, sim, weather, geometry, env) {
    Entities.renderDynamicWorld(ctx, sim, weather, geometry.pw, geometry.ph, geometry.groundY, geometry.waterY, env)
  },

  lightning: function(sim, x) {
    Simulation.triggerLightning(sim, x)
  },

  canGrab: function(sim, x, y, geometry, env) {
    return env.effects.vikings !== false && Simulation.canGrab(sim, x, y, geometry.groundY)
  },
  grab: function(sim, x, y, geometry, env) {
    return env.effects.vikings !== false && Simulation.grab(sim, x, y, geometry.pw, geometry.ph, geometry.groundY)
  },
  drag: function(sim, x, y, geometry) {
    Simulation.drag(sim, x, y, geometry.pw, geometry.ph, geometry.groundY)
  },
  release: function(sim) {
    Simulation.release(sim)
  }
}
