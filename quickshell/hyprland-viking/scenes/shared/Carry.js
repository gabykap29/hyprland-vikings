.pragma library

// ============================================================================
// Carry.js — lets the pointer pick a character up, drop it, and watch it fall,
// splash, swim to shore and climb out. Scene-agnostic: grab() gives an entity a
// `carry` record, the scene's step() calls step() every tick, and the scene's
// renderer calls draw() instead of drawing the entity itself while `carry` is set.
//
// A scene describes where bodies can land with a "world":
//   minX, maxX, minY, maxY   pointer clamp while dragging
//   drift                    px/tick the water pushes swimmers sideways (optional)
//   surface(x, y0)           -> { kind: "ground" | "water", y }: where a body let
//                               go at height y0 comes to rest
//   shore(x, y, entity)      -> { x, y, ex, ey }: where to swim to, and where the
//                               climb out ends
// ============================================================================

var GRAVITY = 0.3
var MAX_FALL = 4.5
var SWIM_SPEED = 0.5
var FLOUNDER_TICKS = 10      // thrashing in place before swimming off
var CLIMB_TICKS = 18
var SUBMERGE = 9             // px of the sprite below the waterline while swimming
var REACH_X = 7, REACH_UP = 22, REACH_DOWN = 4

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }
function lerp(a, b, p) { return a + (b - a) * p }

// ---- Picking ------------------------------------------------------------------
// xOf/yOf give an entity's foot position; yOf returns null to exclude it.
function pick(px, py, list, xOf, yOf) {
  var best = null
  var bestScore = 1e9
  for (var i = 0; i < list.length; i++) {
    var e = list[i]
    if (e.carry) continue
    var foot = yOf(e)
    if (foot === null) continue
    var x = xOf(e)
    if (Math.abs(px - x) > REACH_X || py < foot - REACH_UP || py > foot + REACH_DOWN) continue
    var score = Math.abs(px - x) - foot * 0.02            // ties go to the one in front
    if (score < bestScore) { bestScore = score; best = e }
  }
  return best
}

// ---- Pointer ---------------------------------------------------------------------
function grab(e, px, py, footX, footY) {
  e.carry = {
    mode: "held", t: 0, dir: 1, phase: Math.random() * 6,
    x: footX, y: footY, y0: footY, vx: 0, vy: 0,
    ox: footX - px, oy: footY - py,
    fromX: 0, fromY: 0, toX: 0, toY: 0
  }
}

function drag(e, px, py, W) {
  var c = e.carry
  if (!c || c.mode !== "held") return
  var nx = clamp(px + c.ox, W.minX, W.maxX)
  var ny = clamp(py + c.oy, W.minY, W.maxY)
  c.vx = c.vx * 0.6 + (nx - c.x) * 0.4
  c.vy = c.vy * 0.6 + (ny - c.y) * 0.4
  c.x = nx
  c.y = ny
}

// Let go: the body keeps a little of the hand's motion.
function release(e) {
  var c = e.carry
  if (!c || c.mode !== "held") return
  c.mode = "fall"
  c.vx = clamp(c.vx * 0.8, -3, 3)
  c.vy = clamp(c.vy * 0.8, -3, 2)
  c.y0 = c.y
  if (Math.abs(c.vx) > 0.3) c.dir = c.vx > 0 ? 1 : -1
}

// ---- Simulation ----------------------------------------------------------------------
// One tick. Returns null, or "land" | "splash" | "exit". On "land" and "exit" the
// carry record is gone: read the final position from a copy taken before calling.
function step(e, W) {
  var c = e.carry
  if (!c) return null
  c.t++

  if (c.mode === "held") {
    c.vx *= 0.8
    c.vy *= 0.8
    return null
  }

  if (c.mode === "fall") {
    c.vy = Math.min(MAX_FALL, c.vy + GRAVITY)
    c.vx *= 0.985
    c.x = clamp(c.x + c.vx, W.minX, W.maxX)
    c.y = Math.max(W.minY, c.y + c.vy)
    var s = W.surface(c.x, c.y0)
    if (c.y >= s.y) {
      c.y = s.y
      c.vx = 0
      c.vy = 0
      if (s.kind === "water") {
        c.mode = "swim"
        c.t = 0
        return "splash"
      }
      e.carry = null
      return "land"
    }
    return null
  }

  if (c.mode === "swim") {
    var T = W.shore(c.x, c.y, e)
    var dx = T.x - c.x, dy = T.y - c.y
    if (c.t > FLOUNDER_TICKS) {
      c.x += clamp(dx, -SWIM_SPEED, SWIM_SPEED)
      c.y += clamp(dy, -0.25, 0.25)
      if (Math.abs(dx) > 0.5) c.dir = dx > 0 ? 1 : -1
    }
    c.x = clamp(c.x + (W.drift || 0), W.minX, W.maxX)
    if (c.t > FLOUNDER_TICKS && Math.abs(dx) <= 1 && Math.abs(dy) <= 1) {
      c.mode = "climb"
      c.t = 0
      c.fromX = c.x; c.fromY = c.y
      c.toX = T.ex; c.toY = T.ey
    }
    return null
  }

  // climb
  var p = Math.min(1, c.t / CLIMB_TICKS)
  c.x = lerp(c.fromX, c.toX, p)
  c.y = lerp(c.fromY, c.toY, p)
  if (c.toX !== c.fromX) c.dir = c.toX > c.fromX ? 1 : -1
  if (c.t >= CLIMB_TICKS) {
    e.carry = null
    return "exit"
  }
  return null
}

// What the sprite should look like this tick: "held" | "swim", as the pose name.
function poseName(c) {
  return (c.mode === "held" || c.mode === "fall") ? "held" : "swim"
}

// ---- Drawing ------------------------------------------------------------------------------
// Calls drawFn(x, footY) with the sprite's foot position. Swimmers are the same
// sprite sunk below the waterline: drawn with a clip so only head and shoulders show.
function draw(ctx, e, t, pw, drawFn) {
  var c = e.carry
  if (c.mode === "held" || c.mode === "fall") { drawFn(c.x, c.y); return }

  var x = Math.round(c.x)
  var foot, clipY, ripple
  if (c.mode === "swim") {
    foot = c.y + SUBMERGE + Math.round(Math.sin(t * 0.2 + c.phase) * 1.2)
    clipY = c.y
    ripple = true
  } else {
    var p = Math.min(1, c.t / CLIMB_TICKS)
    foot = c.y + SUBMERGE * (1 - p)
    clipY = c.fromY + Math.max(0, c.toY - c.fromY) * p
    ripple = p < 0.7
  }
  clipY = Math.round(clipY)

  ctx.save()
  ctx.beginPath()
  ctx.rect(0, 0, pw, clipY)
  ctx.clip()
  drawFn(x, Math.round(foot))
  ctx.restore()

  if (ripple) {
    var w = 9 + (Math.floor(t / 6) % 2) * 2
    ctx.fillStyle = "rgba(225, 242, 248, 0.55)"
    ctx.fillRect(x - Math.floor(w / 2), clipY, w, 1)
    ctx.fillStyle = "rgba(225, 242, 248, 0.28)"
    ctx.fillRect(x - Math.floor(w / 2) - 2, clipY + 1, w + 4, 1)
  }
}

// ---- Splash and dust ---------------------------------------------------------------------------
function fxList(sim) {
  if (!sim.carryFx) sim.carryFx = []
  return sim.carryFx
}

function push(sim, p) {
  var list = fxList(sim)
  list.push(p)
  if (list.length > 120) list.shift()
}

function splash(sim, x, y) {
  for (var i = 0; i < 12; i++) {
    push(sim, { kind: "drop", x: x, y: y, vx: (Math.random() - 0.5) * 2.4, vy: -1.2 - Math.random() * 1.9, life: 1 })
  }
  push(sim, { kind: "ring", x: x, y: y, vx: 0, vy: 0, life: 1 })
}

function dust(sim, x, y) {
  for (var i = 0; i < 6; i++) {
    push(sim, { kind: "dust", x: x + (Math.random() - 0.5) * 6, y: y - 1, vx: (Math.random() - 0.5) * 1.1, vy: -0.2 - Math.random() * 0.5, life: 1 })
  }
}

function stepFx(sim) {
  var list = sim.carryFx
  if (!list) return
  for (var i = list.length - 1; i >= 0; i--) {
    var p = list[i]
    p.x += p.vx
    p.y += p.vy
    if (p.kind === "drop") { p.vy += 0.16; p.life -= 0.05 }
    else if (p.kind === "dust") { p.vx *= 0.9; p.life -= 0.07 }
    else p.life -= 0.06
    if (p.life <= 0) list.splice(i, 1)
  }
}

function drawFx(ctx, sim) {
  var list = sim.carryFx
  if (!list) return
  for (var i = 0; i < list.length; i++) {
    var p = list[i]
    var x = Math.round(p.x), y = Math.round(p.y)
    if (p.kind === "ring") {
      var w = 4 + Math.round((1 - p.life) * 16)
      ctx.fillStyle = "rgba(225, 242, 248, " + (p.life * 0.7).toFixed(2) + ")"
      ctx.fillRect(x - Math.floor(w / 2), y, w, 1)
      ctx.fillRect(x - Math.floor(w / 4), y + 1, Math.max(1, Math.floor(w / 2)), 1)
    } else if (p.kind === "drop") {
      ctx.fillStyle = "rgba(225, 242, 248, " + Math.min(1, p.life * 1.3).toFixed(2) + ")"
      ctx.fillRect(x, y, 1, 1)
    } else {
      ctx.fillStyle = "rgba(176, 156, 126, " + (p.life * 0.6).toFixed(2) + ")"
      ctx.fillRect(x, y, 2, 1)
    }
  }
}
