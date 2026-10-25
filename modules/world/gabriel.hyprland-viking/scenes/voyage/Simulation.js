.pragma library
.import "../shared/Atmosphere.js" as Atmosphere
.import "Layout.js" as Layout

// ============================================================================
// Simulation.js — the voyage: drifting clouds and islands, gulls and ravens,
// the occasional whale, the crew reacting to sightings, thunder at sea.
// ============================================================================

var RUNES = ["ᚠ", "ᚨ", "ᛏ", "ᛟ", "ᛋ", "ᛒ"]

function rnd(a, b) { return a + Math.random() * (b - a) }
function pick(list) { return list[Math.floor(Math.random() * list.length)] }

function makeIsland(x, beacon) {
  return {
    x: x,
    w: beacon ? 44 : Math.floor(rnd(52, 96)),
    h: beacon ? 12 : Math.floor(rnd(8, 18)),
    speed: rnd(0.05, 0.08),
    beacon: beacon,
    trees: Math.floor(rnd(3, 8))
  }
}

function createInitialState(pw, ph) {
  var sim = Atmosphere.create(pw, ph)
  sim.tick = 0
  sim.lightningFlash = 0
  sim.lightningSegments = []

  sim.clouds = []
  for (var c = 0; c < 7; c++) {
    sim.clouds.push({ x: rnd(0, pw), y: 30 + c * 11 + rnd(-4, 4), w: Math.floor(rnd(30, 70)), speed: rnd(0.04, 0.12) })
  }
  sim.islands = [makeIsland(40, false), makeIsland(250, true)]

  sim.gulls = []
  for (var g = 0; g < 5; g++) {
    sim.gulls.push({ x: rnd(0, pw), y: rnd(60, 108), vx: rnd(0.35, 0.7) * (g % 2 ? 1 : -1), phase: rnd(0, 6) })
  }
  sim.ravens = [
    { x: 80, y: 50, vx: 0.55, phase: 0 },
    { x: 300, y: 70, vx: -0.45, phase: 2 }
  ]
  sim.mastRaven = { state: "perch", timer: 0 }

  sim.event = null
  sim.eventTimer = 700
  sim.whaleCount = 0

  sim.crew = Layout.CREW.map(function(c) {
    return { job: c.job, bubbleRune: "", bubbleTimer: 0, cheer: 0 }
  })
  return sim
}

function crewSay(sim, job, rune, ticks) {
  for (var i = 0; i < sim.crew.length; i++) {
    if (sim.crew[i].job === job) {
      sim.crew[i].bubbleRune = rune
      sim.crew[i].bubbleTimer = ticks
      sim.crew[i].cheer = ticks
    }
  }
}

function reactToSighting(sim) {
  crewSay(sim, "lookout", "ᛟ", 90)
  crewSay(sim, "helmsman", pick(RUNES), 70)
}

function lightning(sim, x) {
  if (!sim) return
  var bx = x !== undefined ? x : Math.floor(rnd(40, 340))
  sim.lightningFlash = 0.85
  sim.lightningSegments = Atmosphere.makeBolt(bx, 150)
  sim.mastRaven.state = "fly"
  sim.mastRaven.timer = 260
  if (Math.abs(bx - 192) < 70) {                         // a strike close to the ship fires up the crew
    crewSay(sim, "helmsman", "ᛏ", 80)
    crewSay(sim, "lookout", "ᛏ", 80)
  }
}

function step(sim, weather, geometry, env) {
  if (!sim) return
  sim.tick += 1
  var pw = geometry.pw

  if (sim.lightningFlash > 0) sim.lightningFlash = Math.max(0, sim.lightningFlash - 0.07)
  if (weather.thunderFrequency > 0.05 && Math.random() < 0.0022 * weather.thunderFrequency) lightning(sim)

  Atmosphere.step(sim, weather, sim.tick, pw, geometry.ph, geometry.waterY + 4, geometry.ph - 4)

  var i
  // The ship sails left, so the world slides right.
  for (i = 0; i < sim.clouds.length; i++) {
    var c = sim.clouds[i]
    c.x += c.speed
    if (c.x > pw + 10) { c.x = -c.w - 10; c.y = 26 + Math.random() * 80 }
  }
  for (i = 0; i < sim.islands.length; i++) {
    var isl = sim.islands[i]
    isl.x += isl.speed
    if (isl.x > pw + 10) {
      var beacon = !sim.islands.some(function(o) { return o !== isl && o.beacon }) && Math.random() < 0.5
      sim.islands[i] = makeIsland(-100, beacon)
    }
    if (isl.beacon && !isl.seen && isl.x > 120 && isl.x < 150) {   // first sight of the beacon
      isl.seen = true
      reactToSighting(sim)
    }
  }
  for (i = 0; i < sim.gulls.length; i++) {
    var gl = sim.gulls[i]
    gl.x += gl.vx
    gl.y += Math.sin(sim.tick * 0.05 + gl.phase) * 0.1
    if (gl.x > pw + 8) gl.x = -8
    if (gl.x < -8) gl.x = pw + 8
  }
  for (i = 0; i < sim.ravens.length; i++) {
    var rv = sim.ravens[i]
    rv.x += rv.vx
    rv.y += Math.sin(sim.tick * 0.04 + rv.phase) * 0.15
    if (rv.x > pw + 8) rv.x = -8
    if (rv.x < -8) rv.x = pw + 8
  }
  if (sim.mastRaven.state === "fly") {
    sim.mastRaven.timer--
    if (sim.mastRaven.timer <= 0) sim.mastRaven.state = "perch"
  }

  // Events: a whale surfaces somewhere off the ship
  sim.eventTimer--
  if (sim.eventTimer <= 0 && !sim.event) {
    var side = Math.random() < 0.5 ? rnd(30, 100) : rnd(290, 350)
    sim.event = { kind: "whale", t: 0, T: 150, x: side, y: Math.floor(rnd(134, 146)) }
    sim.eventTimer = Math.floor(rnd(1500, 3000))
    sim.whaleCount++
  }
  if (sim.event) {
    sim.event.t++
    if (sim.event.t === 18) reactToSighting(sim)
    if (sim.event.t >= sim.event.T) sim.event = null
  }

  for (i = 0; i < sim.crew.length; i++) {
    var m = sim.crew[i]
    if (m.bubbleTimer > 0) {
      m.bubbleTimer--
      if (m.bubbleTimer === 0) m.bubbleRune = ""
    }
    if (m.cheer > 0) m.cheer--
  }
}
