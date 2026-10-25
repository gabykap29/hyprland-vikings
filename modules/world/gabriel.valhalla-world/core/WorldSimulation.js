.pragma library

// ============================================================================
// WorldSimulation.js
// Autonomous Viking AI State Machine, Ravens of Odin & Weather Particle Physics
// ============================================================================

var RUNES = ["ᚠ", "ᚨ", "ᛏ", "ᛟ", "ᛋ", "ᛒ", "ᛞ"]

function createInitialState(pw, ph) {
  var stars = []
  for (var i = 0; i < 90; i++) {
    stars.push({
      x: Math.floor(Math.random() * pw),
      y: Math.floor(Math.random() * 98),
      phase: Math.random() * 6.28,
      size: Math.random() > 0.85 ? 2 : 1
    })
  }

  var raindrops = []
  for (var r = 0; r < 160; r++) {
    raindrops.push({
      x: Math.random() * pw,
      y: Math.random() * ph,
      len: 4 + Math.floor(Math.random() * 4),
      speed: 3.4 + Math.random() * 1.8
    })
  }

  var snowflakes = []
  for (var s = 0; s < 95; s++) {
    snowflakes.push({
      x: Math.random() * pw,
      y: Math.random() * ph,
      speed: 0.45 + Math.random() * 0.55,
      phase: Math.random() * 6.28
    })
  }

  var sparks = []
  for (var k = 0; k < 28; k++) {
    sparks.push({
      x: 242 + (Math.random() - 0.5) * 6,
      y: 156 - Math.random() * 20,
      vx: (Math.random() - 0.3) * 0.35,
      vy: -0.4 - Math.random() * 0.6,
      life: Math.random(),
      source: k % 3 === 0 ? "forge" : "fire"
    })
  }

  var smokePuffs = []
  for (var m = 0; m < 18; m++) {
    smokePuffs.push({
      x: m % 2 === 0 ? 310 : 194,
      y: (m % 2 === 0 ? 100 : 126) - (m * 2.5),
      age: m / 18.0,
      sourceX: m % 2 === 0 ? 310 : 194,
      sourceY: m % 2 === 0 ? 100 : 126
    })
  }

  var vikings = [
    {
      id: "eivor",
      name: "Eivor",
      role: "jarl",
      x: 118,
      targetX: 230,
      dir: 1,
      speed: 0.34,
      state: "walk",
      timer: 120,
      chatCooldown: 0,
      cloakColor: "#1b4d4a",
      tunicColor: "#263845",
      trimColor: "#f0ba65",
      hairColor: "#d8a24a",
      shieldColor: "#4ecdc4",
      weapon: "axe",
      bubbleRune: ""
    },
    {
      id: "ulf",
      name: "Ulf",
      role: "smith",
      x: 206,
      targetX: 206,
      dir: 1,
      speed: 0.28,
      state: "forge",
      timer: 180,
      chatCooldown: 0,
      cloakColor: "#4a2c1d",
      tunicColor: "#5c3824",
      trimColor: "#d49b4b",
      hairColor: "#8c4a27",
      shieldColor: "#b87333",
      weapon: "hammer",
      bubbleRune: ""
    },
    {
      id: "astrid",
      name: "Astrid",
      role: "guard",
      x: 92,
      targetX: 168,
      dir: 1,
      speed: 0.32,
      state: "walk",
      timer: 90,
      chatCooldown: 0,
      cloakColor: "#7a2323",
      tunicColor: "#1f3442",
      trimColor: "#4ecdc4",
      hairColor: "#e6b85c",
      shieldColor: "#4ecdc4",
      weapon: "spear",
      bubbleRune: ""
    },
    {
      id: "gunnar",
      name: "Gunnar",
      role: "skald",
      x: 254,
      targetX: 254,
      dir: -1,
      speed: 0.26,
      state: "warm",
      timer: 150,
      chatCooldown: 0,
      cloakColor: "#3a3222",
      tunicColor: "#2c423b",
      trimColor: "#f0ba65",
      hairColor: "#b85d28",
      shieldColor: "#f0ba65",
      weapon: "horn",
      bubbleRune: "ᚠ"
    },
    {
      id: "freydis",
      name: "Freydis",
      role: "seer",
      x: 154,
      targetX: 154,
      dir: 1,
      speed: 0.25,
      state: "pray",
      timer: 160,
      chatCooldown: 0,
      cloakColor: "#163840",
      tunicColor: "#10242b",
      trimColor: "#4ecdc4",
      hairColor: "#d0dce0",
      shieldColor: "#4ecdc4",
      weapon: "staff",
      bubbleRune: "ᛟ"
    }
  ]

  var ravens = [
    {
      x: 45,
      y: 42,
      vx: 0.65,
      vy: 0.05,
      state: "fly",
      timer: 180,
      perchX: 155,
      perchY: 121
    },
    {
      x: 250,
      y: 94,
      vx: -0.55,
      vy: 0.0,
      state: "perch",
      timer: 140,
      perchX: 250,
      perchY: 94
    }
  ]

  return {
    tick: 0,
    lightningFlash: 0,
    lightningBoltX: 180,
    lightningSegments: [],
    runeGlowBoost: 0,
    stars: stars,
    raindrops: raindrops,
    splashes: [],
    snowflakes: snowflakes,
    sparks: sparks,
    smokePuffs: smokePuffs,
    vikings: vikings,
    ravens: ravens
  }
}

function triggerLightning(sim, customX) {
  if (!sim) return
  sim.lightningFlash = 0.85
  var bx = customX !== undefined ? customX : (60 + Math.floor(Math.random() * 260))
  sim.lightningBoltX = bx
  var segs = []
  var cx = bx
  var cy = 0
  while (cy < 118) {
    var nx = cx + Math.floor((Math.random() - 0.45) * 14)
    var ny = cy + 8 + Math.floor(Math.random() * 10)
    segs.push({ x1: cx, y1: cy, x2: nx, y2: ny })
    cx = nx
    cy = ny
  }
  sim.lightningSegments = segs
  sim.runeGlowBoost = 1.0

  for (var i = 0; i < sim.vikings.length; i++) {
    if (Math.random() < 0.75) {
      sim.vikings[i].state = "cheer"
      sim.vikings[i].timer = 55
      sim.vikings[i].bubbleRune = "ᛏ"
    }
  }
  for (var r = 0; r < sim.ravens.length; r++) {
    if (sim.ravens[r].state === "perch") {
      sim.ravens[r].state = "fly"
      sim.ravens[r].timer = 160
      sim.ravens[r].vx = (Math.random() > 0.5 ? 1 : -1) * 0.75
      sim.ravens[r].vy = -0.35
    }
  }
}

function stepSimulation(sim, weather, pw, ph, groundY, waterY) {
  if (!sim) return
  sim.tick += 1

  if (sim.lightningFlash > 0) sim.lightningFlash = Math.max(0, sim.lightningFlash - 0.07)
  if (sim.runeGlowBoost > 0) sim.runeGlowBoost = Math.max(0, sim.runeGlowBoost - 0.02)

  if (weather.thunderFrequency > 0.05 && Math.random() < (0.0022 * weather.thunderFrequency)) {
    triggerLightning(sim)
  }

  // Raindrops & splashes
  var activeRainCount = Math.floor(sim.raindrops.length * weather.rainIntensity)
  var newSplashes = []
  for (var s = 0; s < sim.splashes.length; s++) {
    var spItem = sim.splashes[s]
    spItem.age += 1
    if (spItem.age < 5) newSplashes.push(spItem)
  }

  for (var i = 0; i < activeRainCount; i++) {
    var d = sim.raindrops[i]
    d.x += weather.windSpeed * 0.85
    d.y += d.speed

    var hitY = waterY + Math.floor(Math.random() * 36)
    if (d.x > 250 && d.x < 366) hitY = Math.random() < 0.45 ? 128 : groundY + 2
    else if (d.x > 76 && d.x < 370) hitY = groundY + Math.floor(Math.random() * 8)

    if (d.y >= hitY) {
      if (newSplashes.length < 45 && Math.random() < 0.45) {
        newSplashes.push({ x: Math.floor(d.x), y: Math.floor(hitY), age: 0 })
      }
      d.y = -5 - Math.random() * 20
      d.x = Math.random() * (pw + 60) - 30
    }
    if (d.x > pw + 20) d.x = -10
    if (d.x < -20) d.x = pw + 10
  }
  sim.splashes = newSplashes

  // Snowflakes
  var activeSnowCount = Math.floor(sim.snowflakes.length * weather.snowIntensity)
  for (var snIdx = 0; snIdx < activeSnowCount; snIdx++) {
    var sf = sim.snowflakes[snIdx]
    sf.x += weather.windSpeed * 0.25 + Math.sin(sim.tick * 0.04 + sf.phase) * 0.25
    sf.y += sf.speed
    if (sf.y > ph) {
      sf.y = -4
      sf.x = Math.random() * pw
    }
    if (sf.x > pw) sf.x = 0
    if (sf.x < 0) sf.x = pw
  }

  // Embers / Sparks
  for (var k = 0; k < sim.sparks.length; k++) {
    var pk = sim.sparks[k]
    pk.x += pk.vx + weather.windSpeed * 0.08
    pk.y += pk.vy
    pk.life -= 0.028
    if (pk.life <= 0) {
      var fromForge = (pk.source === "forge")
      pk.x = (fromForge ? 206 : 242) + (Math.random() - 0.5) * 5
      pk.y = (fromForge ? 148 : 157)
      pk.vx = (Math.random() - 0.5) * (fromForge ? 0.9 : 0.35)
      pk.vy = -0.35 - Math.random() * 0.65
      pk.life = 0.6 + Math.random() * 0.4
    }
  }

  // Smoke puffs
  for (var smIdx = 0; smIdx < sim.smokePuffs.length; smIdx++) {
    var sm = sim.smokePuffs[smIdx]
    sm.age += 0.012
    sm.x += weather.windSpeed * 0.14 + Math.sin(sim.tick * 0.03 + smIdx) * 0.08
    sm.y -= 0.22
    if (sm.age >= 1.0) {
      sm.age = 0.0
      sm.x = sm.sourceX
      sm.y = sm.sourceY
    }
  }

  // Vikings AI State Machine
  for (var v = 0; v < sim.vikings.length; v++) {
    var vk = sim.vikings[v]
    if (vk.chatCooldown > 0) vk.chatCooldown -= 1
    vk.timer -= 1

    if (vk.state === "walk") {
      var dx = vk.targetX - vk.x
      if (Math.abs(dx) <= 1.5) {
        vk.x = vk.targetX
        if (Math.abs(vk.x - 206) < 10 && vk.role === "smith") {
          vk.state = "forge"
          vk.dir = 1
          vk.timer = 140 + Math.floor(Math.random() * 90)
          vk.bubbleRune = ""
        } else if (Math.abs(vk.x - 155) < 14) {
          vk.state = "pray"
          vk.dir = vk.x < 155 ? 1 : -1
          vk.timer = 95 + Math.floor(Math.random() * 70)
          vk.bubbleRune = "ᛟ"
          sim.runeGlowBoost = Math.max(sim.runeGlowBoost, 0.7)
        } else if (Math.abs(vk.x - 242) < 22) {
          vk.state = "warm"
          vk.dir = vk.x < 242 ? 1 : -1
          vk.timer = 110 + Math.floor(Math.random() * 90)
          vk.bubbleRune = Math.random() < 0.5 ? "ᚠ" : ""
        } else {
          vk.state = "idle"
          vk.timer = 65 + Math.floor(Math.random() * 60)
          vk.bubbleRune = ""
        }
      } else {
        vk.dir = dx > 0 ? 1 : -1
        vk.x += vk.dir * vk.speed
      }

      if (vk.chatCooldown <= 0) {
        for (var u = v + 1; u < sim.vikings.length; u++) {
          var other = sim.vikings[u]
          if (other.chatCooldown <= 0 && (other.state === "walk" || other.state === "idle" || other.state === "warm") && Math.abs(vk.x - other.x) < 15 && Math.abs(vk.x - other.x) > 6) {
            vk.state = "chat"
            other.state = "chat"
            vk.dir = other.x > vk.x ? 1 : -1
            other.dir = -vk.dir
            vk.timer = 95
            other.timer = 95
            vk.chatCooldown = 280
            other.chatCooldown = 280
            vk.bubbleRune = RUNES[Math.floor(Math.random() * RUNES.length)]
            other.bubbleRune = RUNES[Math.floor(Math.random() * RUNES.length)]
            break
          }
        }
      }
    } else if (vk.timer <= 0) {
      vk.state = "walk"
      vk.bubbleRune = ""
      var waypoints = [88, 118, 152, 188, 206, 232, 254, 295, 330]
      if (vk.role === "smith") waypoints = [206, 206, 234, 252]
      else if (vk.role === "guard") waypoints = [84, 112, 148, 275, 335]
      else if (vk.role === "seer") waypoints = [146, 158, 228, 298]
      vk.targetX = waypoints[Math.floor(Math.random() * waypoints.length)] + Math.floor((Math.random() - 0.5) * 8)
      vk.timer = 200
    }
  }

  // Ravens (Huginn & Muninn)
  for (var rIdx = 0; rIdx < sim.ravens.length; rIdx++) {
    var rv = sim.ravens[rIdx]
    rv.timer -= 1
    if (rv.state === "fly") {
      rv.x += rv.vx
      rv.y += rv.vy + Math.sin(sim.tick * 0.08 + rIdx) * 0.12
      if (rv.x > pw + 16) rv.x = -12
      if (rv.x < -16) rv.x = pw + 12
      if (rv.y < 16) rv.vy = Math.abs(rv.vy)
      if (rv.y > 110) rv.vy = -Math.abs(rv.vy)

      if (rv.timer <= 0) {
        var perches = [
          { x: 155, y: 121 },
          { x: 250, y: 94 },
          { x: 365, y: 94 },
          { x: 48,  y: 124 }
        ]
        var p = perches[Math.floor(Math.random() * perches.length)]
        rv.perchX = p.x
        rv.perchY = p.y
        rv.state = "landing"
        rv.timer = 160
      }
    } else if (rv.state === "landing") {
      var rdx = rv.perchX - rv.x
      var rdy = rv.perchY - rv.y
      if (Math.abs(rdx) < 2 && Math.abs(rdy) < 2) {
        rv.x = rv.perchX
        rv.y = rv.perchY
        rv.state = "perch"
        rv.timer = 120 + Math.floor(Math.random() * 120)
      } else {
        rv.x += rdx * 0.06
        rv.y += rdy * 0.06
      }
    } else if (rv.state === "perch") {
      if (rv.timer <= 0) {
        rv.state = "fly"
        rv.vx = (Math.random() > 0.5 ? 1 : -1) * (0.55 + Math.random() * 0.25)
        rv.vy = -0.25
        rv.timer = 160 + Math.floor(Math.random() * 120)
      }
    }
  }
}
