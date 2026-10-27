.pragma library
.import "../shared/Atmosphere.js" as Atmosphere
.import "../shared/Carry.js" as Carry
.import "Layout.js" as Layout

// ============================================================================
// Simulation.js — the battle: Norse of the Raven Clan against Saxons.
// Fighters pick the nearest enemy, close in, trade blows (with blocks, hits,
// knock-back and deaths), archers loose arrows, reinforcements keep the line
// alive, and ravens settle on the fallen. Thunder strikes smite Saxons.
// ============================================================================

var RUNES = ["ᚠ", "ᚨ", "ᛏ", "ᛟ", "ᛋ", "ᛒ", "ᛞ"]
var DYING_TICKS = 14
var MIN_ALIVE = 7
var MAX_ALIVE = 11

var NORSE_HAIR = ["#d8a24a", "#b85d28", "#8c4a27", "#e6c36a", "#4a3020", "#c9c9c9"]
var NORSE_TUNIC = ["#1d2a3a", "#243a46", "#2a3342", "#1f3b3a", "#2e3340"]
var NORSE_CLOAK = ["#14202e", "#1b4d4a", "#1a2433", "#223a52"]
var NORSE_SHIELDS = ["raven", "raven", "raven", "quarter", "rim"]
var SAXON_HAIR = ["#c9a14a", "#7a4a27", "#3a2a1d", "#d8c08a"]
var SAXON_TUNIC = ["#8f2a24", "#a8442b", "#7a5a2a", "#4a6a3a", "#6a2a2a"]
var SAXON_CLOAK = ["#7a2323", "#5a3b24", "#2f4a6a"]
var SAXON_SHIELDS = ["red", "ochre", "green", "red"]

var ROLES = {
  norse: {
    leader: { hp: 9, dmg: 2, speed: 0.40, range: 10, weapon: "axe",   helm: "horned", shield: true,  beard: 3 },
    axe:    { hp: 4, dmg: 1, speed: 0.38, range: 10, weapon: "axe",   helm: "norse",  shield: true,  beard: 2 },
    sword:  { hp: 4, dmg: 1, speed: 0.40, range: 10, weapon: "sword", helm: "band",   shield: true,  beard: 1 },
    spear:  { hp: 3, dmg: 1, speed: 0.34, range: 16, weapon: "spear", helm: "cap",    shield: false, beard: 2 },
    archer: { hp: 2, dmg: 1, speed: 0.30, range: 0,  weapon: "bow",   helm: "hood",   shield: false, beard: 0, ranged: true }
  },
  saxon: {
    thegn:  { hp: 10, dmg: 2, speed: 0.38, range: 10, weapon: "sword", helm: "crest",  shield: true,  beard: 1, mail: true },
    sword:  { hp: 5, dmg: 1, speed: 0.38, range: 10, weapon: "sword", helm: "nasal",  shield: true,  beard: 1 },
    spear:  { hp: 4, dmg: 1, speed: 0.34, range: 16, weapon: "spear", helm: "coif",   shield: false, beard: 1, mail: true },
    archer: { hp: 2, dmg: 1, speed: 0.30, range: 0,  weapon: "bow",   helm: "cap",    shield: false, beard: 0, ranged: true }
  }
}

// The sea laps the beach west of here, above the sand.
var SEA_X = 116

function rnd(a, b) { return a + Math.random() * (b - a) }
function pick(list) { return list[Math.floor(Math.random() * list.length)] }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

function makeFighter(sim, side, role, x, lane) {
  var def = ROLES[side][role]
  var norse = side === "norse"
  var tunic = pick(norse ? NORSE_TUNIC : SAXON_TUNIC)
  var f = {
    id: sim.nextId++,
    side: side,
    role: role,
    x: x,
    lane: lane,
    dir: norse ? 1 : -1,
    hp: def.hp,
    maxHp: def.hp,
    dmg: def.dmg,
    speed: def.speed * rnd(0.9, 1.1),
    range: def.range,
    ranged: def.ranged === true,
    weapon: def.weapon,
    state: "advance",
    timer: 0,
    cd: Math.floor(rnd(0, 40)),
    atkPhase: 0,
    atkT: 0,
    hitFlash: 0,
    blockFlash: 0,
    targetId: -1,
    bubbleRune: "",
    bubbleTimer: 0,
    dead: false,
    fallDir: 1,
    shield: def.shield ? { style: pick(norse ? NORSE_SHIELDS : SAXON_SHIELDS) } : null,
    look: {
      hair: pick(norse ? NORSE_HAIR : SAXON_HAIR),
      tunic: tunic,
      cloak: pick(norse ? NORSE_CLOAK : SAXON_CLOAK),
      trim: norse ? "#f0ba65" : "#d9a441",
      pants: norse ? "#3b2f26" : "#4a3b2e",
      helm: def.helm,
      beard: def.beard,
      mail: def.mail === true
    }
  }
  if (role === "leader") f.shield = { style: "raven" }
  return f
}

// Picks the free-est of a few random lanes so fighters fan out across the field.
function freeLane(sim, x) {
  var best = Layout.LANE_MIN + 2
  var bestScore = -1
  for (var c = 0; c < 6; c++) {
    var lane = rnd(Layout.LANE_MIN + 2, Layout.LANE_MAX - 2)
    var score = 1e9
    for (var i = 0; i < sim.fighters.length; i++) {
      var o = sim.fighters[i]
      if (o.role === "banner") continue
      var d = Math.abs(o.lane - lane) + Math.abs(o.x - x) * 0.3
      if (d < score) score = d
    }
    if (score > bestScore) { bestScore = score; best = lane }
  }
  return best
}

function makeBanner(sim, side, x, lane) {
  return {
    id: sim.nextId++, side: side, role: "banner", x: x, lane: lane,
    dir: side === "norse" ? 1 : -1, hp: 999, maxHp: 999, state: "stand", dead: false,
    atkPhase: 0, hitFlash: 0, blockFlash: 0, bubbleRune: "", bubbleTimer: 0
  }
}

function createInitialState(pw, ph) {
  var sim = Atmosphere.create(pw, ph)
  sim.tick = 0
  sim.nextId = 1
  sim.lightningFlash = 0
  sim.lightningSegments = []
  sim.fighters = []
  sim.corpses = []
  sim.arrows = []
  sim.stuck = []
  sim.fx = []
  sim.sparks = []
  sim.smokePuffs = []
  sim.ravens = []
  sim.spawnTimer = { norse: 0, saxon: 0 }
  sim.cryTimer = 200
  sim.kills = { norse: 0, saxon: 0 }

  sim.fighters.push(makeBanner(sim, "norse", Layout.NORSE_BANNER.x, Layout.NORSE_BANNER.lane))
  sim.fighters.push(makeBanner(sim, "saxon", Layout.SAXON_BANNER.x, Layout.SAXON_BANNER.lane))

  var norse = ["leader", "axe", "axe", "axe", "sword", "sword", "spear", "archer"]
  var saxon = ["thegn", "sword", "sword", "sword", "spear", "spear", "archer"]
  var i, f
  for (i = 0; i < norse.length; i++) {
    f = makeFighter(sim, "norse", norse[i], 120 + i * 11 + rnd(-3, 3), freeLane(sim, 120 + i * 11))
    sim.fighters.push(f)
  }
  for (i = 0; i < saxon.length; i++) {
    f = makeFighter(sim, "saxon", saxon[i], 272 - i * 12 + rnd(-3, 3), freeLane(sim, 272 - i * 12))
    sim.fighters.push(f)
  }

  for (var s = 0; s < 44; s++) {
    sim.sparks.push({ fire: s % Layout.FIRES.length, x: 0, y: 0, vx: 0, vy: 0, life: Math.random() })
  }
  for (var m = 0; m < 30; m++) {
    var fi = m % Layout.FIRES.length
    sim.smokePuffs.push({ fire: fi, x: Layout.FIRES[fi].x, y: Layout.FIRES[fi].y - m, age: (m % 6) / 6 })
  }
  for (var r = 0; r < 3; r++) {
    sim.ravens.push({ x: 60 + r * 120, y: 40 + r * 18, vx: (r % 2 ? -0.5 : 0.6), vy: 0, state: "fly", timer: 200 + r * 90, tx: 0, ty: 0 })
  }
  return sim
}

// ---- Pointer: pick a fighter up, drop it on the field or in the sea ------------------
function carryWorld(pw, ph) {
  return {
    minX: 6, maxX: pw - 6, minY: 20, maxY: ph - 4, drift: 0,
    surface: function(x, y0) {
      if (x < SEA_X && y0 < Layout.LANE_MIN) return { kind: "water", y: Math.max(y0, 154) }
      return { kind: "ground", y: clamp(y0, Layout.LANE_MIN, Layout.LANE_MAX) }
    },
    shore: function(x) {
      var sx = clamp(x, 8, SEA_X - 4)
      return { x: sx, y: 167, ex: sx, ey: Layout.LANE_MIN + 3 }
    }
  }
}

function pickFighter(sim, px, py) {
  return Carry.pick(px, py, sim.fighters,
    function(f) { return f.x },
    function(f) { return (f.role === "banner" || f.state === "dying") ? null : f.lane })
}

function canGrab(sim, px, py) {
  return !!sim && pickFighter(sim, px, py) !== null
}

function grab(sim, px, py) {
  if (!sim) return false
  var f = pickFighter(sim, px, py)
  if (!f) return false
  Carry.grab(f, px, py, f.x, f.lane)
  f.state = "held"
  f.atkPhase = 0
  f.targetId = -1
  f.bubbleTimer = 0
  f.bubbleRune = ""
  return true
}

function drag(sim, px, py, pw, ph) {
  if (!sim) return
  var W = carryWorld(pw, ph)
  for (var i = 0; i < sim.fighters.length; i++) if (sim.fighters[i].carry) Carry.drag(sim.fighters[i], px, py, W)
}

function release(sim) {
  if (!sim) return
  for (var i = 0; i < sim.fighters.length; i++) if (sim.fighters[i].carry) Carry.release(sim.fighters[i])
}

function stepCarried(sim, f, W) {
  var c = f.carry
  var ev = Carry.step(f, W)
  if (f.carry) {
    f.x = f.carry.x
    f.lane = f.carry.y
    f.dir = f.carry.dir
    f.state = Carry.poseName(f.carry)
    if (ev === "splash") Carry.splash(sim, f.carry.x, f.carry.y)
    return
  }
  // Back on its feet: dust off and look for the nearest enemy again.
  f.x = ev === "exit" ? c.toX : c.x
  f.lane = clamp(ev === "exit" ? c.toY : c.y, Layout.LANE_MIN, Layout.LANE_MAX)
  if (ev === "land") Carry.dust(sim, f.x, f.lane)
  f.state = "advance"
  f.cd = 24
  f.dir = f.side === "norse" ? 1 : -1
}

// ---- Helpers ---------------------------------------------------------------
function isAlive(f) { return f.state !== "dying" && f.hp > 0 }
function isTargetable(f) { return isAlive(f) && !f.carry }
function isCombatant(f) { return f.role !== "banner" }

function nearestEnemy(sim, f) {
  var best = null
  var bestD = 1e9
  var leaderish = (f.role === "leader" || f.role === "thegn")
  for (var i = 0; i < sim.fighters.length; i++) {
    var o = sim.fighters[i]
    if (o.side === f.side || !isCombatant(o) || !isTargetable(o)) continue
    var d = Math.abs(o.x - f.x) + Math.abs(o.lane - f.lane) * 1.6
    // Spread the fight out: avoid piling onto an enemy others are already facing
    var crowd = 0
    for (var j = 0; j < sim.fighters.length; j++) {
      var a = sim.fighters[j]
      if (a !== f && a.side === f.side && a.targetId === o.id && a.state !== "dying") crowd++
    }
    d += crowd * 34
    if (leaderish && (o.role === "leader" || o.role === "thegn")) d *= 0.4   // champions seek each other
    if (d < bestD) { bestD = d; best = o }
  }
  return best
}

function spawnFx(sim, kind, x, y, count) {
  for (var i = 0; i < count; i++) {
    var spark = kind === "spark"
    sim.fx.push({
      kind: kind,
      x: x, y: y,
      vx: rnd(-1.1, 1.1),
      vy: spark ? rnd(-1.4, -0.2) : rnd(-0.9, 0.1),
      life: spark ? rnd(0.5, 1) : rnd(0.7, 1)
    })
  }
  if (sim.fx.length > 140) sim.fx.splice(0, sim.fx.length - 140)
}

function say(f, rune, ticks) {
  if (f.side !== "norse") return
  f.bubbleRune = rune
  f.bubbleTimer = ticks
}

function kill(sim, victim, byDir, killer) {
  victim.state = "dying"
  victim.timer = DYING_TICKS
  victim.atkPhase = 0
  victim.fallDir = byDir
  if (killer) {
    sim.kills[killer.side] += 1
    if (killer.state !== "dying" && killer.atkPhase === 0 && Math.random() < 0.4) {
      killer.state = "cheer"
      killer.timer = 40
      say(killer, pick(RUNES), 60)
    }
  }
}

function damage(sim, victim, amount, byDir, killer) {
  victim.hp -= amount
  victim.hitFlash = 4
  victim.x += byDir * 1.5                                 // knock-back
  spawnFx(sim, "blood", victim.x, victim.lane - 9, 4)
  if (victim.hp <= 0 && victim.state !== "dying") kill(sim, victim, byDir, killer)
}

function resolveStrike(sim, f) {
  if (f.weapon === "bow") { shootArrow(sim, f); return }
  var tgt = null
  for (var i = 0; i < sim.fighters.length; i++) if (sim.fighters[i].id === f.targetId) tgt = sim.fighters[i]
  if (!tgt || !isTargetable(tgt)) return
  if (Math.abs(tgt.x - f.x) > f.range + 3 || Math.abs(tgt.lane - f.lane) > 6) return
  var hasShield = tgt.shield !== null && tgt.role !== "banner"
  var facing = (tgt.dir === -f.dir)
  var blockChance = hasShield ? (facing ? 0.42 : 0.15) : 0.08
  var hitX = tgt.x - f.dir * 2
  if (Math.random() < blockChance && tgt.state !== "cheer") {
    tgt.state = "block"
    tgt.timer = 8
    tgt.atkPhase = 0
    tgt.blockFlash = 5
    spawnFx(sim, "spark", hitX, tgt.lane - 9, 7)          // steel on shield
  } else {
    if (Math.random() < 0.5) spawnFx(sim, "spark", hitX, tgt.lane - 10, 3)
    damage(sim, tgt, f.dmg, f.dir, f)
  }
}

function shootArrow(sim, f) {
  var tgt = null
  for (var i = 0; i < sim.fighters.length; i++) if (sim.fighters[i].id === f.targetId) tgt = sim.fighters[i]
  if (!tgt || !isTargetable(tgt)) return
  var x0 = f.x + f.dir * 5
  var y0 = f.lane - 11
  var x1 = tgt.x + rnd(-6, 6)
  var y1 = tgt.lane - 6
  var T = clamp(Math.round(Math.abs(x1 - x0) / 5) + 14, 24, 50)
  sim.arrows.push({ x0: x0, y0: y0, x1: x1, y1: y1, t: 0, T: T, x: x0, y: y0, px: x0, py: y0, side: f.side, fire: f.side === "saxon" && Math.random() < 0.4 })
}

function landArrow(sim, a) {
  for (var i = 0; i < sim.fighters.length; i++) {
    var o = sim.fighters[i]
    if (o.side === a.side || !isCombatant(o) || !isTargetable(o)) continue
    if (Math.abs(o.x - a.x1) < 5 && Math.abs((o.lane - 6) - a.y1) < 7) {
      var arrowDir = a.x1 >= a.x0 ? 1 : -1
      var facingArrow = o.shield !== null && o.dir === -arrowDir
      if (facingArrow && Math.random() < 0.3) { spawnFx(sim, "spark", o.x, o.lane - 9, 3); o.blockFlash = 4; return }
      damage(sim, o, 1, a.x1 > a.x0 ? 1 : -1, null)
      if (o.state === "dying") sim.kills[a.side] += 1
      return
    }
  }
  sim.stuck.push({ x: Math.round(a.x1), y: Math.round(clamp(a.y1 + 6, Layout.LANE_MIN, Layout.LANE_MAX + 2)), age: 0 })
  if (sim.stuck.length > 36) sim.stuck.shift()
}

// ---- Thunder ---------------------------------------------------------------
function lightning(sim, x) {
  if (!sim) return
  var bx = x !== undefined ? x : pickStrikeX(sim)
  sim.lightningFlash = 0.85
  sim.lightningSegments = Atmosphere.makeBolt(bx, Layout.LANE_MAX)
  spawnFx(sim, "spark", bx, Layout.LANE_MAX - 8, 14)
  for (var i = 0; i < sim.fighters.length; i++) {
    var f = sim.fighters[i]
    if (!isCombatant(f) || !isTargetable(f) || Math.abs(f.x - bx) > 20) continue
    if (f.side === "saxon") {
      damage(sim, f, 4, f.x >= bx ? 1 : -1, null)
      sim.kills.norse += (f.state === "dying") ? 1 : 0
    } else {
      f.state = "cheer"
      f.timer = 50
      f.atkPhase = 0
      say(f, "ᛏ", 70)
    }
  }
  for (var r = 0; r < sim.ravens.length; r++) {
    if (sim.ravens[r].state !== "fly") {
      sim.ravens[r].state = "fly"
      sim.ravens[r].vx = (Math.random() > 0.5 ? 1 : -1) * 0.8
      sim.ravens[r].vy = -0.45
      sim.ravens[r].timer = 200
    }
  }
}

function pickStrikeX(sim) {
  var saxons = sim.fighters.filter(function(f) { return f.side === "saxon" && isCombatant(f) && isAlive(f) })
  if (saxons.length === 0) return 180
  return saxons[Math.floor(Math.random() * saxons.length)].x
}

// ---- Fighter AI --------------------------------------------------------------
function updateFighter(sim, f, env, carryW) {
  if (f.hitFlash > 0) f.hitFlash--
  if (f.blockFlash > 0) f.blockFlash--
  if (f.cd > 0) f.cd--
  if (f.bubbleTimer > 0) {
    f.bubbleTimer--
    if (f.bubbleTimer === 0) f.bubbleRune = ""
  }
  if (f.role === "banner") return
  if (f.carry) { stepCarried(sim, f, carryW); return }

  if (f.state === "dying") {
    f.timer--
    if (f.timer <= 0) f.dead = true
    return
  }
  if (f.state === "cheer" || f.state === "block") {
    f.timer--
    if (f.timer <= 0) f.state = "advance"
    return
  }

  if (f.atkPhase > 0) {
    f.atkT--
    if (f.atkT <= 0) {
      if (f.atkPhase === 1) { f.atkPhase = 2; f.atkT = 4; resolveStrike(sim, f) }
      else if (f.atkPhase === 2) { f.atkPhase = 3; f.atkT = 8 }
      else { f.atkPhase = 0; f.cd = f.ranged ? Math.floor(rnd(70, 120)) : Math.floor(rnd(16, 42)) }
    }
    return
  }

  var tgt = nearestEnemy(sim, f)
  if (!tgt) {
    f.dir = f.side === "norse" ? 1 : -1
    f.x += f.dir * f.speed * 0.5
    f.state = "advance"
    return
  }
  f.targetId = tgt.id
  var dx = tgt.x - f.x
  var dist = Math.abs(dx)
  if (dist > 1) f.dir = dx >= 0 ? 1 : -1
  var dl = tgt.lane - f.lane
  f.lane = clamp(f.lane + clamp(dl, -0.12, 0.12), Layout.LANE_MIN, Layout.LANE_MAX)

  if (f.ranged) {
    if (dist < 24) { f.x -= f.dir * 0.35; f.state = "advance" }
    else if (f.cd <= 0 && dist < 200 && env.effects.arrows !== false) { f.state = "fight"; f.atkPhase = 1; f.atkT = 12 }
    else f.state = "fight"
    f.x = clamp(f.x, 96, 290)
    return
  }

  if (dist > f.range || Math.abs(dl) > 5) {
    // The side that is ahead slows down and the one behind rallies, so the
    // front line sways around the middle of the field instead of racing to a gate.
    var mine = aliveCount(sim, f.side), theirs = aliveCount(sim, f.side === "norse" ? "saxon" : "norse")
    var tide = mine > theirs ? 0.8 : (mine < theirs ? 1.1 : 1.0)
    var minX = f.side === "norse" ? 96 : 150, maxX = f.side === "norse" ? 236 : 296
    var nx = f.x + f.dir * f.speed * tide
    if (nx >= minX && nx <= maxX) f.x = nx
    f.state = "advance"
  } else {
    f.state = "fight"
    if (f.cd <= 0) { f.atkPhase = 1; f.atkT = 8 }
  }

  // Separation: nobody stands inside another fighter's sprite
  for (var i = 0; i < sim.fighters.length; i++) {
    var o = sim.fighters[i]
    if (o === f || !isCombatant(o) || !isTargetable(o)) continue
    var ox = Math.abs(o.x - f.x), ol = o.lane - f.lane
    if (ox < 8 && Math.abs(ol) < 5 && o.id !== f.targetId) {
      f.lane = clamp(f.lane + (ol > 0 ? -0.35 : 0.35) + (ol === 0 ? (f.id % 2 ? 0.2 : -0.2) : 0), Layout.LANE_MIN, Layout.LANE_MAX)
    }
  }
}

function aliveCount(sim, side) {
  var n = 0
  for (var i = 0; i < sim.fighters.length; i++) {
    var f = sim.fighters[i]
    if (f.side === side && isCombatant(f) && isAlive(f)) n++
  }
  return n
}

function reinforce(sim, side) {
  if (sim.spawnTimer[side] > 0) { sim.spawnTimer[side]--; return }
  var n = aliveCount(sim, side)
  if (n >= MIN_ALIVE && !(n < MAX_ALIVE && Math.random() < 0.0008)) return
  if (n >= MAX_ALIVE) return
  var roles = side === "norse" ? ["axe", "axe", "sword", "sword", "spear", "archer"] : ["sword", "sword", "sword", "spear", "spear", "archer"]
  var x = side === "norse" ? Layout.NORSE_SPAWN_X + rnd(-4, 4) : Layout.SAXON_SPAWN_X + rnd(-3, 3)
  sim.fighters.push(makeFighter(sim, side, pick(roles), x, freeLane(sim, x)))
  sim.spawnTimer[side] = Math.floor(side === "saxon" ? rnd(55, 120) : rnd(70, 150))
}

// ---- Main step -----------------------------------------------------------------
function step(sim, weather, geometry, env) {
  if (!sim) return
  env = env || { effects: {} }
  sim.tick += 1

  if (sim.lightningFlash > 0) sim.lightningFlash = Math.max(0, sim.lightningFlash - 0.07)

  if (weather.thunderFrequency > 0.05 && Math.random() < 0.0022 * weather.thunderFrequency) lightning(sim)

  Atmosphere.step(sim, weather, sim.tick, geometry.pw, geometry.ph, Layout.LANE_MIN, Layout.LANE_MAX + 6)

  var i
  var carryW = carryWorld(geometry.pw, geometry.ph)
  for (i = 0; i < sim.fighters.length; i++) updateFighter(sim, sim.fighters[i], env, carryW)
  Carry.stepFx(sim)

  // Remove the dead from the line and lay them on the field
  var live = []
  for (i = 0; i < sim.fighters.length; i++) {
    var f = sim.fighters[i]
    if (f.dead) {
      sim.corpses.push({ x: f.x, lane: f.lane, side: f.side, fallDir: f.fallDir, look: f.look, shield: f.shield, age: 0 })
    } else {
      live.push(f)
    }
  }
  sim.fighters = live
  for (i = sim.corpses.length - 1; i >= 0; i--) {
    sim.corpses[i].age++
    if (sim.corpses[i].age > 900) sim.corpses.splice(i, 1)
  }
  if (sim.corpses.length > 18) sim.corpses.shift()

  reinforce(sim, "norse")
  reinforce(sim, "saxon")

  // Battle cries
  sim.cryTimer--
  if (sim.cryTimer <= 0) {
    sim.cryTimer = Math.floor(rnd(260, 480))
    var cands = sim.fighters.filter(function(f) { return f.side === "norse" && isCombatant(f) && isAlive(f) && f.bubbleTimer === 0 })
    if (cands.length) say(cands[Math.floor(Math.random() * cands.length)], pick(RUNES), 70)
  }

  // Arrows in flight
  for (i = sim.arrows.length - 1; i >= 0; i--) {
    var a = sim.arrows[i]
    a.px = a.x
    a.py = a.y
    a.t++
    var s = Math.min(1, a.t / a.T)
    a.x = a.x0 + (a.x1 - a.x0) * s
    a.y = a.y0 + (a.y1 - a.y0) * s - 16 * Math.sin(Math.PI * s)
    if (a.t >= a.T) {
      landArrow(sim, a)
      sim.arrows.splice(i, 1)
    }
  }
  for (i = 0; i < sim.stuck.length; i++) sim.stuck[i].age++

  // Sparks, blood and dust
  for (i = sim.fx.length - 1; i >= 0; i--) {
    var p = sim.fx[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.12
    p.life -= p.kind === "spark" ? 0.09 : 0.06
    if (p.life <= 0) sim.fx.splice(i, 1)
  }

  // Embers and smoke from the burning stockade
  for (i = 0; i < sim.sparks.length; i++) {
    var e = sim.sparks[i]
    e.x += e.vx + weather.windSpeed * 0.1
    e.y += e.vy
    e.life -= 0.02
    if (e.life <= 0) {
      var src = Layout.FIRES[e.fire]
      e.x = src.x + Math.random() * src.w
      e.y = src.y - 2
      e.vx = (Math.random() - 0.5) * 0.5
      e.vy = -0.3 - Math.random() * 0.6
      e.life = 0.6 + Math.random() * 0.4
    }
  }
  for (i = 0; i < sim.smokePuffs.length; i++) {
    var sm = sim.smokePuffs[i]
    sm.age += 0.010
    sm.x += weather.windSpeed * 0.16 + Math.sin(sim.tick * 0.03 + i) * 0.08
    sm.y -= 0.24
    if (sm.age >= 1) {
      var fs = Layout.FIRES[sm.fire]
      sm.age = 0
      sm.x = fs.x + fs.w / 2
      sm.y = fs.y
    }
  }

  stepRavens(sim, geometry)
}

function stepRavens(sim, geometry) {
  for (var i = 0; i < sim.ravens.length; i++) {
    var rv = sim.ravens[i]
    rv.timer--
    if (rv.state === "fly") {
      rv.x += rv.vx
      rv.y += rv.vy + Math.sin(sim.tick * 0.08 + i) * 0.12
      if (rv.x > geometry.pw + 16) rv.x = -12
      if (rv.x < -16) rv.x = geometry.pw + 12
      if (rv.y < 18) rv.vy = Math.abs(rv.vy) + 0.02
      if (rv.y > 110) rv.vy = -Math.abs(rv.vy) - 0.02
      if (Math.abs(rv.vy) > 0.3) rv.vy *= 0.98
      if (rv.timer <= 0 && sim.corpses.length > 0) {
        var c = sim.corpses[Math.floor(Math.random() * sim.corpses.length)]
        rv.tx = c.x
        rv.ty = c.lane - 5
        rv.state = "landing"
        rv.timer = 260
      } else if (rv.timer <= 0) {
        rv.timer = 160
      }
    } else if (rv.state === "landing") {
      var dx = rv.tx - rv.x
      var dy = rv.ty - rv.y
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        rv.x = rv.tx
        rv.y = rv.ty
        rv.state = "perch"
        rv.timer = 120 + Math.floor(Math.random() * 160)
      } else {
        rv.x += dx * 0.03 + (dx > 0 ? 0.25 : -0.25)
        rv.y += dy * 0.03 + (dy > 0 ? 0.15 : -0.15)
      }
      if (rv.timer <= 0) { rv.state = "fly"; rv.vx = 0.5; rv.vy = -0.3; rv.timer = 220 }
    } else if (rv.state === "perch") {
      var disturbed = false
      for (var k = 0; k < sim.fighters.length; k++) {
        var f = sim.fighters[k]
        if (isCombatant(f) && isTargetable(f) && Math.abs(f.x - rv.x) < 14 && Math.abs(f.lane - rv.y - 5) < 8) disturbed = true
      }
      if (rv.timer <= 0 || disturbed) {
        rv.state = "fly"
        rv.vx = (Math.random() > 0.5 ? 1 : -1) * 0.6
        rv.vy = -0.5
        rv.timer = 240 + Math.floor(Math.random() * 120)
      }
    }
  }
}
