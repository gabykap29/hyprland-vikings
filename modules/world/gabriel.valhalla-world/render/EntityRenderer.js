.pragma library

// ============================================================================
// EntityRenderer.js
// Dynamic 16-Bit Pixel-Art Renderer (Aurora, Lightning, Bobbing Drakkar,
// Campfire, Vikings + Elder Futhark Speech Bubbles, Ravens, Water, Rain & Snow)
// ============================================================================

var _shadeCache = {}

// Lighten (f > 0) or darken (f < 0) a #rrggbb colour. Cached: called per rect per frame.
function shade(hex, f) {
  var key = hex + f
  if (_shadeCache[key]) return _shadeCache[key]
  var n = parseInt(hex.slice(1), 16)
  var ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  for (var i = 0; i < 3; i++) {
    ch[i] = Math.max(0, Math.min(255, Math.round(f > 0 ? ch[i] + (255 - ch[i]) * f : ch[i] * (1 + f))))
  }
  var out = "rgb(" + ch[0] + "," + ch[1] + "," + ch[2] + ")"
  _shadeCache[key] = out
  return out
}

// Sprite is authored facing right around a centre column; `dir` mirrors it.
// Every part is queued, then drawn twice: a 1px dark outline pass, then the fills.
function drawPixelViking(ctx, vk, tickCount, groundY) {
  var x = Math.round(vk.x)
  var dir = vk.dir > 0 ? 1 : -1
  var walking = vk.state === "walk"
  var step = walking ? (Math.floor(tickCount * 0.25) % 4) : 0
  var bob = (walking && (step === 1 || step === 3)) ? -1 : 0
  if (!walking && Math.floor(tickCount / 28) % 4 === 3) bob = 1   // slow breathing
  var top = groundY - 17
  var vy = top + bob
  var parts = []

  function P(lx, ly, w, h, color, noOutline) {
    parts.push({ x: dir > 0 ? x + lx : x - lx - w + 1, y: ly, w: w, h: h, c: color, o: !noOutline })
  }

  var SKIN = "#e8b992", SKIN_D = "#c48a66"
  var INK = "#0d1218"
  var STEEL = "#9fb3bd", STEEL_D = "#5f717b", STEEL_L = "#d4e4ea"
  var LEATHER = "#5a3d26", LEATHER_D = "#3a2517"
  var GOLD = "#f0ba65"
  var role = vk.role
  var tunic = vk.tunicColor, tunicL = shade(tunic, 0.22), tunicD = shade(tunic, -0.35)
  var cloak = vk.cloakColor, cloakD = shade(cloak, -0.35), cloakL = shade(cloak, 0.18)
  var hair = vk.hairColor, hairD = shade(hair, -0.35), hairL = shade(hair, 0.25)

  // ---- Poses --------------------------------------------------------------
  var armY = 0          // front arm vertical offset
  var armUp = false     // arm raised overhead
  var tick15 = Math.floor(tickCount * 0.15) % 2
  if (vk.state === "forge") armY = (Math.floor(tickCount * 0.35) % 2 === 0) ? -4 : 1
  else if (vk.state === "cheer") { armUp = true; armY = tick15 ? -1 : 0 }
  else if (vk.state === "chat") armY = tick15 ? -2 : 0
  else if (vk.state === "pray") { armUp = true; armY = 1 }
  else if (walking) armY = (step === 0) ? 1 : (step === 2 ? -1 : 0)

  // ---- Ground shadow (not outlined) --------------------------------------
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
  ctx.fillRect(x - 5, groundY - 1, 10, 2)

  // ---- Cloak (behind body), flutters with movement -------------------------
  var flutter = walking ? ((step === 1 || step === 2) ? 1 : 0) : (Math.floor(tickCount / 20) % 2)
  var cloakLen = role === "seer" ? 11 : 8
  P(-5 - flutter, vy + 6, 3 + flutter, cloakLen, cloak)
  P(-5 - flutter, vy + 6 + cloakLen - 2, 3 + flutter, 2, cloakD, true)
  P(-3, vy + 6, 1, 2, cloakL, true)

  // ---- Legs & boots -------------------------------------------------------
  var l1 = 0, l2 = 0
  if (walking) { l1 = (step === 0) ? -2 : (step === 2 ? 2 : 0); l2 = -l1 }
  var legTop = vy + 12
  P(-2 + l1, legTop, 2, 3, "#3b2f26")                // back leg
  P(-2 + l1, groundY - 2, 3, 2, LEATHER_D)
  P(0 + l2, legTop, 2, 3, "#4a3b2e")                 // front leg
  P(0 + l2, groundY - 2, 3, 2, LEATHER)
  P(1 + l2, groundY - 2, 1, 1, shade(LEATHER, 0.25), true)

  // ---- Torso --------------------------------------------------------------
  P(-3, vy + 6, 7, 6, tunic)
  P(-3, vy + 6, 2, 6, tunicD, true)                  // back shadow
  P(1, vy + 6, 1, 3, tunicL, true)                   // chest highlight
  P(-3, vy + 11, 7, 1, tunicD, true)                 // tunic hem
  P(-3, vy + 9, 7, 1, LEATHER_D, true)               // belt
  P(1, vy + 9, 2, 1, vk.trimColor, true)             // buckle
  P(-3, vy + 6, 7, 1, vk.trimColor, true)            // collar trim

  // ---- Head ---------------------------------------------------------------
  P(-2, vy + 2, 5, 4, SKIN)
  P(-2, vy + 2, 1, 4, SKIN_D, true)
  P(1, vy + 3, 1, 1, INK, true)                      // eye
  P(2, vy + 4, 1, 1, SKIN_D, true)                   // nose shade

  // Hair (back of head, long)
  P(-3, vy + 1, 2, 6, hair)
  P(-3, vy + 4, 1, 3, hairD, true)

  // Beard
  if (role !== "guard" && role !== "seer") {
    var long = (role === "smith" || role === "jarl") ? 4 : 3
    P(0, vy + 5, 3, long - 1, hair)
    P(1, vy + 4, 2, 1, hair, true)
    P(0, vy + 4 + long - 1, 2, 1, hairD, true)
    P(1, vy + 5, 1, 1, hairL, true)
  } else if (role === "guard") {
    P(-3, vy + 7, 1, 3, hair)                        // braid
    P(-3, vy + 9, 1, 1, vk.trimColor, true)
  }

  // ---- Headgear -----------------------------------------------------------
  if (role === "seer") {
    P(-3, vy, 7, 3, cloak)                           // hood
    P(-4, vy + 2, 2, 5, cloak)
    P(-3, vy, 7, 1, cloakL, true)
    P(2, vy + 2, 1, 4, cloakD, true)
    P(0, vy + 1, 1, 1, vk.trimColor, true)           // rune circlet gem
  } else if (role === "skald") {
    P(-2, vy + 1, 5, 1, hair)                        // tousled hair
    P(-3, vy + 2, 7, 1, vk.trimColor)                // headband
    P(-3, vy, 4, 1, hairL, true)
  } else if (role === "smith") {
    P(-3, vy + 1, 7, 2, LEATHER)                     // leather cap
    P(-2, vy, 4, 1, LEATHER, true)
    P(-3, vy + 2, 7, 1, LEATHER_D, true)
  } else if (role === "guard") {
    P(-3, vy, 7, 3, STEEL)                           // helm dome
    P(-2, vy - 1, 4, 1, STEEL, true)
    P(-2, vy, 3, 1, STEEL_L, true)
    P(-3, vy + 2, 7, 1, STEEL_D, true)
    P(2, vy + 2, 1, 3, STEEL_D)                      // nasal guard
    P(-1, vy - 2, 1, 1, vk.cloakColor)               // plume
    P(0, vy - 3, 1, 2, vk.cloakColor)
  } else {                                           // jarl: horned helm
    P(-3, vy, 7, 3, STEEL)
    P(-2, vy - 1, 4, 1, STEEL, true)
    P(-2, vy, 3, 1, STEEL_L, true)
    P(-3, vy + 2, 7, 1, GOLD, true)                  // gold brow band
    P(2, vy + 2, 1, 3, STEEL_D)
    P(-4, vy - 1, 1, 2, "#efe4cc")                   // horns
    P(-5, vy - 3, 1, 3, "#efe4cc")
    P(4, vy - 1, 1, 2, "#efe4cc")
    P(5, vy - 3, 1, 3, "#efe4cc")
  }

  // ---- Front arm + hand ---------------------------------------------------
  var handX = 4
  var handY
  if (armUp) {
    P(2, vy + 3 + armY, 2, 4, tunic)                 // forearm raised
    P(3, vy + 2 + armY, 2, 2, SKIN)
    handY = vy + 2 + armY
    handX = 4
  } else {
    P(1, vy + 7 + armY, 3, 2, tunic)
    P(1, vy + 7 + armY, 3, 1, tunicL, true)
    P(3, vy + 8 + armY, 2, 2, SKIN)
    handY = vy + 8 + armY
    handX = 4
  }

  // ---- Weapon / tool (drawn with its own outline) ---------------------------
  var wp = vk.weapon
  if (wp === "axe") {
    P(handX, handY - 5, 1, 9, LEATHER)
    P(handX + 1, handY - 5, 2, 4, STEEL)
    P(handX + 1, handY - 5, 1, 1, STEEL_L, true)
    P(handX + 2, handY - 2, 1, 1, STEEL_D, true)
  } else if (wp === "spear") {
    P(handX, vy - 4 + Math.min(0, armY), 1, 17, LEATHER)
    P(handX, vy - 8 + Math.min(0, armY), 1, 4, STEEL_L)
    P(handX - 1, vy - 5 + Math.min(0, armY), 3, 1, STEEL_D)
  } else if (wp === "hammer") {
    P(handX, handY - 4, 1, 7, LEATHER)
    P(handX - 1, handY - 6, 4, 3, STEEL)
    P(handX - 1, handY - 6, 4, 1, STEEL_L, true)
    if (vk.state === "forge" && armY > 0) {          // spark on the anvil strike
      ctx.fillStyle = "#ffdf80"
      ctx.fillRect(dir > 0 ? x + 7 : x - 7, groundY - 7 - (tickCount % 3), 1, 1)
    }
  } else if (wp === "horn") {
    P(handX, handY - 2, 3, 2, "#efe4cc")
    P(handX + 2, handY - 3, 1, 1, "#efe4cc")
    P(handX, handY - 2, 3, 1, GOLD, true)
  } else if (wp === "staff") {
    P(handX, vy - 1, 1, 14, "#4d3320")
    P(handX - 1, vy - 3, 3, 3, "#4ecdc4")
    P(handX, vy - 3, 1, 1, "#d9fffb", true)
  }

  // ---- Round shield (front of body, over torso) -----------------------------
  if (role === "jarl" || role === "guard") {
    var sc = vk.shieldColor
    P(-1, vy + 7, 5, 5, sc)
    P(-1, vy + 7, 5, 1, shade(sc, 0.25), true)
    P(-1, vy + 11, 5, 1, shade(sc, -0.4), true)
    P(1, vy + 9, 1, 1, GOLD, true)                   // boss
    P(0, vy + 9, 3, 1, shade(sc, -0.15), true)
  }

  // ---- Paint: outline pass, then fills --------------------------------------
  ctx.fillStyle = INK
  for (var oi = 0; oi < parts.length; oi++) {
    var po = parts[oi]
    if (po.o) ctx.fillRect(po.x - 1, po.y - 1, po.w + 2, po.h + 2)
  }
  for (var fi = 0; fi < parts.length; fi++) {
    var pf = parts[fi]
    ctx.fillStyle = pf.c
    ctx.fillRect(pf.x, pf.y, pf.w, pf.h)
  }

  // ---- Elder Futhark Rune Speech Bubble -------------------------------------
  if ((vk.state === "chat" || vk.state === "pray" || vk.state === "cheer") && vk.bubbleRune.length > 0) {
    var bx = x - 5
    var by = vy - 16
    ctx.fillStyle = "rgba(9, 15, 21, 0.88)"
    ctx.fillRect(bx, by, 11, 10)
    ctx.fillStyle = vk.state === "cheer" ? "#f0ba65" : "#4ecdc4"
    ctx.fillRect(bx, by, 11, 1)
    ctx.fillRect(bx, by + 9, 11, 1)
    ctx.fillRect(bx, by, 1, 10)
    ctx.fillRect(bx + 10, by, 1, 10)
    ctx.fillRect(x, by + 10, 2, 2)

    ctx.fillStyle = "#f0ba65"
    ctx.font = "8px 'Noto Sans Runic'"
    ctx.fillText(vk.bubbleRune, bx + 2, by + 8)
  }
}

// Clinker-built longship: dragon prow, striped sail, shield rack, rigging and rowing oars.
// Anchored at x 9..79; `sy` is the gunwale line and bobs with the swell.
function drawDrakkar(ctx, t) {
  var sy = 152 + Math.round(Math.sin(t * 0.06) * 1.4)
  var INK = "#0b0f14"
  var parts = []
  function P(x, y, w, h, c, noOutline) { parts.push({ x: x, y: y, w: w, h: h, c: c, o: !noOutline }) }

  var WOOD = "#6a4529", WOOD_L = "#8a5e38", WOOD_D = "#3f2716", WOOD_DD = "#2a1a0f"
  var GOLD = "#f0ba65", BONE = "#efe4cc", RED = "#8f2a24", RED_D = "#6a1d19", CREAM = "#d9c9a0", TEAL = "#4ecdc4"

  // ---- Oars (behind hull, dip into the water) ---------------------------
  for (var k = 0; k < 6; k++) {
    var ox = 26 + k * 8
    var sw = Math.round(Math.sin(t * 0.07 + k * 0.9) * 2)
    for (var oi = 0; oi < 7; oi++) P(ox + Math.floor(oi * 0.5) + sw, sy + 3 + oi, 1, 1, WOOD_L, true)
    P(ox + 3 + sw, sy + 9, 2, 3, WOOD_D)
  }

  // ---- Rigging (drawn first so mast and sail sit over it) ----------------
  var mastX = 45, mastTop = sy - 32
  for (var ri = 0; ri < 30; ri++) {
    P(mastX - ri, mastTop + 1 + Math.floor(ri * 0.9), 1, 1, "rgba(200, 180, 140, 0.55)", true)
    if (ri < 29) P(mastX + 1 + ri, mastTop + 1 + Math.floor(ri * 0.85), 1, 1, "rgba(200, 180, 140, 0.55)", true)
  }

  // ---- Sail: Raven Clan (night-blue cloth, bone raven) ----------------------
  var sailTop = sy - 29
  var CLOTH = "#141b25", CLOTH_L = "#1f2a38", TRIM = "#aebcc4", RAVEN = "#eef3f4", RAVEN_D = "#9fb0b9"
  P(30, sailTop - 1, 31, 2, WOOD_D)                                // yard
  var raven = [
    "##...............##",
    "####....###....####",
    ".#####..###..#####.",
    "..#####.#e#.#####..",
    "...#####.G.#####...",
    "....#####.#####....",
    ".....####.####.....",
    "......###.###......",
    ".......##.##.......",
    ".......#####.......",
    "......##...##......"
  ]
  for (var row = 0; row < 18; row++) {
    var billow = Math.round(Math.sin(t * 0.05 + row * 0.35) * 1)
    var inset = row > 13 ? (row - 13) : 0                           // lower hem tapers
    var x0 = 31 + inset + billow, x1 = 31 + 27 - inset + billow
    for (var col = inset; col < 28 - inset; col += 4) {
      var stripe = (Math.floor(col / 4) % 2 === 0)
      P(31 + col + billow, sailTop + 1 + row, Math.min(4, 28 - inset - col), 1, stripe ? CLOTH : CLOTH_L, true)
    }
    P(x0, sailTop + 1 + row, 1, 1, TRIM, true)                      // side trim
    P(x1, sailTop + 1 + row, 1, 1, TRIM, true)
    if (row === 17) P(x0, sailTop + 1 + row, x1 - x0 + 1, 1, TRIM, true)  // hem
    var er = row - 4                                                // raven emblem rows 4..14
    if (er >= 0 && er < raven.length) {
      var line = raven[er]
      for (var ec = 0; ec < line.length; ec++) {
        var ch = line.charAt(ec)
        if (ch === ".") continue
        var ecol = ch === "#" ? (er > 5 ? RAVEN_D : RAVEN) : (ch === "e" ? TEAL : GOLD)
        P(36 + ec + billow, sailTop + 1 + row, 1, 1, ecol, true)
      }
    }
  }
  P(30, sailTop + 1, 31, 18, "rgba(0,0,0,0)", false)               // outline only
  P(31, sailTop + 1, 28, 1, "rgba(255,255,255,0.12)", true)

  // ---- Mast & flag ---------------------------------------------------------
  P(mastX, mastTop, 2, 33, WOOD_D)
  P(mastX, mastTop, 1, 33, WOOD, true)
  var wave = Math.round(Math.sin(t * 0.2) * 1)
  P(mastX + 2, mastTop - 1, 7, 3, TEAL)
  P(mastX + 9, mastTop - 1 + wave, 4, 2, GOLD)
  P(mastX + 5, mastTop + 1, 2, 1, "#2f9b94", true)

  // ---- Hull: tapered clinker strakes --------------------------------------
  var strakes = [
    { y: -1, x1: 18, x2: 73, c: WOOD_L },
    { y: 0,  x1: 16, x2: 75, c: WOOD },
    { y: 1,  x1: 17, x2: 74, c: WOOD_D },
    { y: 2,  x1: 18, x2: 72, c: WOOD },
    { y: 3,  x1: 20, x2: 70, c: WOOD_D },
    { y: 4,  x1: 23, x2: 67, c: WOOD },
    { y: 5,  x1: 26, x2: 64, c: WOOD_D },
    { y: 6,  x1: 30, x2: 60, c: WOOD },
    { y: 7,  x1: 35, x2: 55, c: WOOD_DD }
  ]
  for (var si = 0; si < strakes.length; si++) {
    var s = strakes[si]
    P(s.x1, sy + s.y, s.x2 - s.x1 + 1, 1, s.c)
  }
  P(18, sy - 1, 56, 1, GOLD, true)                                 // gold gunwale trim
  for (var rv = 0; rv < 9; rv++) P(24 + rv * 6, sy + 2, 1, 1, "#b8b8b0", true)  // rivets
  P(34, sy + 4, 24, 1, WOOD_L, true)                               // highlight on a strake

  // ---- Dragon prow --------------------------------------------------------
  P(15, sy - 7, 3, 8, WOOD)                                        // neck
  P(13, sy - 12, 4, 6, WOOD)
  P(15, sy - 12, 1, 5, WOOD_L, true)
  P(8, sy - 12, 6, 3, WOOD_L)                                      // snout
  P(8, sy - 10, 5, 1, BONE, true)                                  // teeth line
  P(8, sy - 13, 2, 1, WOOD_D, true)
  P(13, sy - 14, 2, 2, WOOD_D)                                     // ear / frill
  P(15, sy - 15, 1, 2, GOLD, true)
  P(11, sy - 11, 1, 1, "#ffdf80", true)                            // eye
  P(14, sy - 9, 3, 1, GOLD, true)                                  // neck rings
  P(14, sy - 6, 3, 1, GOLD, true)

  // ---- Stern tail curl ------------------------------------------------------
  P(73, sy - 5, 3, 7, WOOD)
  P(75, sy - 9, 3, 6, WOOD)
  P(73, sy - 12, 4, 3, WOOD_L)
  P(72, sy - 12, 1, 2, WOOD_L)
  P(74, sy - 8, 1, 1, GOLD, true)
  P(76, sy - 5, 1, 1, GOLD, true)

  // ---- Shield rack ----------------------------------------------------------
  var sc = [TEAL, RED, GOLD, "#2f6f9b"]
  for (var sh = 0; sh < 9; sh++) {
    var shx = 22 + sh * 6
    var shc = sc[sh % 4]
    P(shx, sy - 3, 5, 4, shc)
    P(shx, sy - 3, 5, 1, "rgba(255,255,255,0.25)", true)
    P(shx + 2, sy - 2, 1, 2, "#d8d8d0", true)                      // boss
  }

  // ---- Paint ----------------------------------------------------------------
  ctx.fillStyle = INK
  for (var oi2 = 0; oi2 < parts.length; oi2++) {
    var po = parts[oi2]
    if (po.o && po.c !== "rgba(0,0,0,0)") ctx.fillRect(po.x - 1, po.y - 1, po.w + 2, po.h + 2)
  }
  for (var fi = 0; fi < parts.length; fi++) {
    var pf = parts[fi]
    if (pf.c === "rgba(0,0,0,0)") continue
    ctx.fillStyle = pf.c
    ctx.fillRect(pf.x, pf.y, pf.w, pf.h)
  }

  // Bow wave foam
  ctx.fillStyle = "rgba(220, 240, 250, 0.55)"
  var foam = Math.round(Math.sin(t * 0.1) * 1)
  ctx.fillRect(14 + foam, sy + 8, 6, 1)
  ctx.fillRect(70 - foam, sy + 8, 6, 1)
}

function renderDynamicWorld(ctx, sim, weather, w, h, groundY, waterY) {
  if (!sim) return
  var t = sim.tick

  // 1. Twinkling Stars
  for (var si = 0; si < sim.stars.length; si++) {
    var st = sim.stars[si]
    var tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.03 + st.phase))
    ctx.fillStyle = "rgba(220, 240, 250, " + (tw * (1.0 - weather.rainIntensity * 0.45)).toFixed(2) + ")"
    ctx.fillRect(st.x, st.y, st.size, st.size)
  }

  // 2. Animated Aurora Borealis
  if (weather.auroraIntensity > 0.05) {
    for (var ax = 0; ax < w; ax += 3) {
      var wave1 = Math.sin(ax * 0.022 + t * 0.025) * 10 + Math.cos(ax * 0.05 - t * 0.018) * 5
      var ay = Math.floor(26 + wave1)
      var ah = Math.floor(14 + Math.sin(ax * 0.04 + t * 0.03) * 8)
      var alpha = (0.14 + 0.14 * Math.sin(ax * 0.03 + t * 0.02)) * weather.auroraIntensity
      ctx.fillStyle = "rgba(78, 205, 196, " + alpha.toFixed(3) + ")"
      ctx.fillRect(ax, ay, 2, ah)
      ctx.fillStyle = "rgba(240, 186, 101, " + (alpha * 0.55).toFixed(3) + ")"
      ctx.fillRect(ax, ay - 3, 2, 3)
    }
  }

  // 3. Thor's Lightning Bolt & Flash
  if (sim.lightningFlash > 0) {
    ctx.fillStyle = "rgba(210, 240, 255, " + (sim.lightningFlash * 0.35).toFixed(2) + ")"
    ctx.fillRect(0, 0, w, waterY)
    ctx.fillStyle = "#e8faff"
    for (var li = 0; li < sim.lightningSegments.length; li++) {
      var seg = sim.lightningSegments[li]
      ctx.fillRect(seg.x1, seg.y1, 2, Math.max(2, seg.y2 - seg.y1))
      ctx.fillStyle = "#4ecdc4"
      ctx.fillRect(seg.x1 - 1, seg.y1, 1, Math.max(2, seg.y2 - seg.y1))
      ctx.fillStyle = "#e8faff"
    }
  }

  // 4. Smoke Puffs
  for (var smi = 0; smi < sim.smokePuffs.length; smi++) {
    var smp = sim.smokePuffs[smi]
    var smAlpha = (1.0 - smp.age) * 0.32
    var smSize = 2 + Math.floor(smp.age * 5)
    ctx.fillStyle = "rgba(160, 180, 190, " + smAlpha.toFixed(2) + ")"
    ctx.fillRect(Math.round(smp.x), Math.round(smp.y), smSize, smSize)
  }

  // 5. Glowing Runestone Inscription
  var rGlow = 0.45 + 0.35 * Math.sin(t * 0.08) + sim.runeGlowBoost * 0.5
  ctx.fillStyle = "rgba(78, 205, 196, " + Math.min(1, rGlow * 0.35).toFixed(2) + ")"
  ctx.fillRect(148, 128, 14, 20)
  ctx.fillStyle = sim.runeGlowBoost > 0.2 ? "#f0ba65" : "#4ecdc4"
  ctx.font = "11px 'Noto Sans Runic'"
  ctx.fillText("ᛟ", 151, 142)

  // 6. Bobbing Viking Drakkar
  drawDrakkar(ctx, t)

  // 7. Torches, Forge Hearth & Central Campfire
  var torches = [
    { x: 82,  y: 149 },
    { x: 134, y: 149 },
    { x: 256, y: 143 },
    { x: 358, y: 143 }
  ]
  for (var ti = 0; ti < torches.length; ti++) {
    var tc = torches[ti]
    ctx.fillStyle = "#3b2618"
    ctx.fillRect(tc.x, tc.y, 2, 6)
    ctx.fillStyle = "rgba(240, 186, 101, 0.16)"
    ctx.fillRect(tc.x - 5, tc.y - 6, 12, 12)
    ctx.fillStyle = "#e67e22"
    ctx.fillRect(tc.x, tc.y - 3, 2, 3)
    ctx.fillStyle = "#ffdf80"
    ctx.fillRect(tc.x, tc.y - 2 - ((t + ti) % 2), 1, 2)
  }

  ctx.fillStyle = "#d35400"
  ctx.fillRect(190, 148, 6, 4)
  ctx.fillStyle = "#f0ba65"
  ctx.fillRect(191 + (t % 2), 149, 4, 2)

  ctx.fillStyle = "rgba(240, 150, 60, " + (0.16 + 0.04 * Math.sin(t * 0.25)).toFixed(2) + ")"
  ctx.fillRect(222, 148, 40, 14)
  ctx.fillStyle = "#d9534f"
  ctx.fillRect(238, 152, 8, 6)
  ctx.fillStyle = "#f0ba65"
  ctx.fillRect(239, 150 - (t % 2), 6, 6)
  ctx.fillStyle = "#fff5cc"
  ctx.fillRect(241, 152 - ((t + 1) % 3), 2, 4)

  for (var spi = 0; spi < sim.sparks.length; spi++) {
    var spk = sim.sparks[spi]
    ctx.fillStyle = spk.life > 0.5 ? "#ffea9f" : "#e67e22"
    ctx.fillRect(Math.round(spk.x), Math.round(spk.y), 1, 1)
  }

  // 8. Autonomous Vikings
  for (var vi = 0; vi < sim.vikings.length; vi++) {
    drawPixelViking(ctx, sim.vikings[vi], t, groundY)
  }

  // 9. Ravens (Huginn & Muninn)
  for (var ri = 0; ri < sim.ravens.length; ri++) {
    var rv = sim.ravens[ri]
    var rx = Math.round(rv.x)
    var ry = Math.round(rv.y)
    ctx.fillStyle = "#0b1116"
    ctx.fillRect(rx - 2, ry, 4, 2)
    if (rv.state === "perch") {
      ctx.fillRect(rx - 1, ry - 1, 2, 2)
      ctx.fillStyle = "#4ecdc4"
      ctx.fillRect(rx, ry - 1, 1, 1)
    } else {
      var wingY = (Math.floor(t * 0.35 + ri) % 2 === 0) ? -2 : 1
      ctx.fillRect(rx - 3, ry + wingY, 2, 2)
      ctx.fillRect(rx + 1, ry + wingY, 2, 2)
    }
  }

  // 10. Animated Fjord Water: depth gradient, travelling swells, moon / aurora / hall reflections
  var waterTop = waterY
  var bayTop = waterY - 8                                          // the bay in front of the pier is higher
  var depthBands = ["#0d2232", "#0b1d2b", "#091825", "#07131e", "#060f18", "#050c14"]
  var bandH = Math.ceil((h - waterY) / depthBands.length)
  for (var wb = 0; wb < depthBands.length; wb++) {
    ctx.fillStyle = depthBands[wb]
    ctx.fillRect(0, waterY + wb * bandH, w, bandH)
    if (wb > 0) {
      ctx.fillStyle = depthBands[wb - 1]
      for (var wdx = wb % 2; wdx < w; wdx += 4) ctx.fillRect(wdx, waterY + wb * bandH, 2, 1)
    }
  }
  ctx.fillStyle = "#0d2232"
  ctx.fillRect(0, bayTop, 126, 8)                                  // bay under the drakkar
  ctx.fillStyle = "rgba(120, 200, 215, 0.30)"
  for (var bx2 = 0; bx2 < 126; bx2 += 6) ctx.fillRect(bx2 + Math.round(Math.sin(t * 0.07 + bx2) * 1), bayTop, 3, 1)
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)"
  ctx.fillRect(14, bayTop + 1, 62, 2)                              // hull shadow on the swell

  // Moon column: broken, shimmering pillar of light
  for (var my = bayTop + 2; my < h; my += 2) {
    var mdepth = (my - waterY) / (h - waterY)
    var mshift = Math.round(Math.sin(my * 0.5 + t * 0.1) * (2 + mdepth * 3))
    var mw2 = Math.max(2, Math.floor(10 - mdepth * 4)) + ((my >> 1) % 3)
    var shimmer = 0.55 + 0.45 * Math.sin(my * 0.9 + t * 0.15)
    ctx.fillStyle = "rgba(225, 240, 245, " + ((1.0 - mdepth * 0.7) * 0.34 * shimmer).toFixed(2) + ")"
    ctx.fillRect(57 - Math.floor(mw2 / 2) + mshift, my, mw2, 1)
  }

  for (var wy = waterY; wy < h; wy += 2) {
    var depth = (wy - waterY) / (h - waterY)
    var shift = Math.round(Math.sin(wy * 0.35 + t * 0.12) * 2.5)

    // Travelling swell crests (bigger and faster toward the viewer)
    var crestLen = 3 + Math.floor(depth * 9)
    var crestGap = 20 + Math.floor(depth * 14)
    var drift = Math.floor(t * (0.05 + depth * 0.12))
    ctx.fillStyle = "rgba(110, 190, 205, " + ((1.0 - depth * 0.6) * 0.17).toFixed(2) + ")"
    for (var cx2 = ((wy * 11) + drift) % crestGap; cx2 < w; cx2 += crestGap) {
      ctx.fillRect(cx2, wy, crestLen, 1)
      ctx.fillStyle = "rgba(190, 230, 240, " + ((1.0 - depth * 0.6) * 0.10).toFixed(2) + ")"
      ctx.fillRect(cx2 + 1, wy - 1, Math.max(1, crestLen - 3), 1)
      ctx.fillStyle = "rgba(110, 190, 205, " + ((1.0 - depth * 0.6) * 0.17).toFixed(2) + ")"
    }

    // Aurora reflection (teal ribbons with gold fringe)
    ctx.fillStyle = "rgba(56, 178, 166, " + ((1.0 - depth) * 0.20 * weather.auroraIntensity).toFixed(2) + ")"
    for (var wx = (wy * 7) % 16; wx < w; wx += 18) {
      ctx.fillRect(wx + shift, wy, 6 + (wy % 4), 1)
    }
    ctx.fillStyle = "rgba(240, 186, 101, " + ((1.0 - depth) * 0.05 * weather.auroraIntensity).toFixed(3) + ")"
    for (var gx = (wy * 5) % 23; gx < w; gx += 31) ctx.fillRect(gx - shift, wy, 3, 1)

    // Warm torch / forge / hall-window reflections
    ctx.fillStyle = "rgba(240, 186, 101, " + ((1.0 - depth * 0.8) * 0.26).toFixed(2) + ")"
    ctx.fillRect(81 + shift, wy, 4, 1)
    ctx.fillRect(133 + shift, wy, 4, 1)
    ctx.fillRect(238 + shift, wy, 8 - Math.floor(depth * 5), 1)
    ctx.fillRect(276 + shift, wy, 5, 1)
    ctx.fillRect(334 + shift, wy, 5, 1)
    ctx.fillStyle = "rgba(240, 150, 60, " + ((1.0 - depth) * 0.07).toFixed(3) + ")"
    ctx.fillRect(270 + shift, wy, 76, 1)                           // hall glow wash
  }

  // Shoreline foam: scalloped, lapping with the swell
  ctx.fillStyle = "rgba(150, 215, 225, 0.40)"
  for (var fx = 124; fx < w; fx += 6) {
    var fOffset = Math.round(Math.sin(t * 0.08 + fx) * 1)
    ctx.fillRect(fx + fOffset, waterY, 4, 1)
    ctx.fillRect(fx + 1 - fOffset, waterY + 1, 2, 1)
  }
  ctx.fillStyle = "rgba(220, 240, 248, 0.22)"
  for (var fx2 = 127; fx2 < w; fx2 += 12) ctx.fillRect(fx2 + Math.round(Math.sin(t * 0.06 + fx2) * 2), waterY + 3, 3, 1)

  // 11. Nordic Mist
  if (weather.fogDensity > 0.05) {
    for (var fg = 0; fg < 6; fg++) {
      var fgX = Math.round(((fg * 75 + t * (0.2 + fg * 0.04)) % (w + 90)) - 45)
      var fgY = 148 + (fg % 3) * 8
      ctx.fillStyle = "rgba(140, 185, 198, " + (weather.fogDensity * 0.14).toFixed(2) + ")"
      ctx.fillRect(fgX, fgY, 64, 5)
      ctx.fillRect(fgX + 10, fgY - 2, 44, 2)
    }
  }

  // 12. Raindrops & Splashes
  var rainCount = Math.floor(sim.raindrops.length * weather.rainIntensity)
  if (rainCount > 0) {
    ctx.fillStyle = "rgba(165, 215, 235, 0.52)"
    for (var r = 0; r < rainCount; r++) {
      var drop = sim.raindrops[r]
      var dx = Math.round(drop.x)
      var dy = Math.round(drop.y)
      for (var s = 0; s < drop.len; s++) {
        ctx.fillRect(dx + Math.round(s * weather.windSpeed * 0.25), dy + s, 1, 1)
      }
    }

    ctx.fillStyle = "rgba(195, 235, 250, 0.68)"
    for (var spIdx = 0; spIdx < sim.splashes.length; spIdx++) {
      var sp = sim.splashes[spIdx]
      if (sp.age < 2) {
        ctx.fillRect(sp.x, sp.y - 1, 1, 1)
      } else {
        ctx.fillRect(sp.x - 2, sp.y - 1, 1, 1)
        ctx.fillRect(sp.x + 2, sp.y - 1, 1, 1)
        ctx.fillRect(sp.x - 1, sp.y, 3, 1)
      }
    }
  }

  // 13. Snowflakes
  var snowCount = Math.floor(sim.snowflakes.length * weather.snowIntensity)
  if (snowCount > 0) {
    ctx.fillStyle = "rgba(235, 248, 255, 0.82)"
    for (var sni = 0; sni < snowCount; sni++) {
      var snf = sim.snowflakes[sni]
      ctx.fillRect(Math.round(snf.x), Math.round(snf.y), 2, 2)
    }
  }
}
