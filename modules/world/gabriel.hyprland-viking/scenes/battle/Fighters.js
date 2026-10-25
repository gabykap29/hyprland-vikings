.pragma library

// ============================================================================
// Fighters.js — pixel sprites for Norse (Raven Clan) and Saxon warriors:
// walking, attack windup/strike/recover, blocking, dying, corpses and banners.
// Sprites are authored facing right around a centre column; `dir` mirrors them.
// Every part is queued, then painted twice: dark outline first, fills after.
// ============================================================================

var INK = "#0b0f14"
var STEEL = "#9fb3bd", STEEL_D = "#5f717b", STEEL_L = "#d4e4ea"
var LEATHER = "#5a3d26", LEATHER_D = "#3a2517"
var GOLD = "#f0ba65", BONE = "#e6edf0", TEAL = "#4ecdc4", NAVY = "#141c28"
var SKIN = "#e8b992", SKIN_D = "#c48a66"

var _shade = {}
function shade(hex, f) {
  var key = hex + f
  if (_shade[key]) return _shade[key]
  var n = parseInt(hex.slice(1), 16)
  var ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  for (var i = 0; i < 3; i++) {
    ch[i] = Math.max(0, Math.min(255, Math.round(f > 0 ? ch[i] + (255 - ch[i]) * f : ch[i] * (1 + f))))
  }
  var out = "rgb(" + ch[0] + "," + ch[1] + "," + ch[2] + ")"
  _shade[key] = out
  return out
}

function paint(ctx, parts) {
  ctx.fillStyle = INK
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i]
    if (p.o) ctx.fillRect(p.x - 1, p.y - 1, p.w + 2, p.h + 2)
  }
  for (var j = 0; j < parts.length; j++) {
    var q = parts[j]
    ctx.fillStyle = q.c
    ctx.fillRect(q.x, q.y, q.w, q.h)
  }
}

// ---- Shields ---------------------------------------------------------------
// style: "raven" (navy, bone raven), "quarter" (bone/navy split), "rim" (navy,
// teal rim, gold boss) for the Raven Clan; "red" / "ochre" / "green" for Saxons.
function drawShield(P, s, lx, ty, flash) {
  var rim = flash ? "#ffffff" : null
  if (s.style === "raven") {
    P(lx + 1, ty, 3, 1, rim || BONE)
    P(lx, ty + 1, 5, 4, NAVY)
    P(lx, ty + 1, 1, 4, rim || BONE, true)
    P(lx + 4, ty + 1, 1, 4, rim || BONE, true)
    P(lx + 1, ty + 5, 3, 1, rim || BONE)
    P(lx + 1, ty + 2, 1, 1, BONE, true)                  // raven: wings, body, head
    P(lx + 3, ty + 2, 1, 1, BONE, true)
    P(lx + 1, ty + 3, 3, 1, BONE, true)
    P(lx + 2, ty + 4, 1, 1, BONE, true)
    P(lx + 2, ty + 2, 1, 1, TEAL, true)
  } else if (s.style === "quarter") {
    P(lx + 1, ty, 3, 1, rim || TEAL)
    P(lx, ty + 1, 5, 4, NAVY)
    P(lx, ty + 1, 2, 4, BONE, true)
    P(lx + 1, ty + 5, 3, 1, rim || TEAL)
    P(lx + 2, ty + 2, 1, 2, GOLD, true)
  } else if (s.style === "rim") {
    P(lx + 1, ty, 3, 1, rim || TEAL)
    P(lx, ty + 1, 5, 4, NAVY)
    P(lx, ty + 1, 1, 4, rim || TEAL, true)
    P(lx + 4, ty + 1, 1, 4, rim || TEAL, true)
    P(lx + 1, ty + 5, 3, 1, rim || TEAL)
    P(lx + 2, ty + 2, 1, 2, GOLD, true)
  } else {
    var body = s.style === "ochre" ? "#c2872f" : (s.style === "green" ? "#2f5a3a" : "#a33a2c")
    var edge = s.style === "ochre" ? "#7a3b24" : "#d9a441"
    P(lx + 1, ty, 3, 1, rim || edge)
    P(lx, ty + 1, 5, 4, body)
    P(lx, ty + 1, 1, 4, rim || edge, true)
    P(lx + 4, ty + 1, 1, 4, rim || edge, true)
    P(lx + 1, ty + 5, 3, 1, rim || edge)
    P(lx + 2, ty + 2, 1, 2, "#e8d9a0", true)             // boss
  }
}

// ---- Weapons ---------------------------------------------------------------
function drawWeapon(P, kind, pose, hx, hy) {
  var i
  if (kind === "sword") {
    if (pose === "up") {
      P(hx, hy - 8, 1, 7, STEEL_L); P(hx - 1, hy - 1, 3, 1, GOLD); P(hx, hy, 1, 2, LEATHER)
    } else if (pose === "horiz") {
      P(hx + 1, hy, 8, 1, STEEL_L); P(hx, hy - 1, 1, 3, GOLD); P(hx - 2, hy, 2, 1, LEATHER)
    } else if (pose === "down") {
      P(hx, hy + 1, 1, 5, STEEL_L); P(hx - 1, hy, 3, 1, GOLD)
    } else {
      for (i = 1; i <= 5; i++) P(hx + i, hy - i, 1, 1, i > 3 ? STEEL_L : STEEL)
      P(hx, hy, 1, 1, LEATHER); P(hx, hy - 1, 2, 1, GOLD)
    }
  } else if (kind === "axe") {
    if (pose === "up") {
      P(hx, hy - 8, 1, 9, LEATHER); P(hx + 1, hy - 9, 3, 4, STEEL); P(hx + 1, hy - 9, 3, 1, STEEL_L, true)
    } else if (pose === "horiz") {
      P(hx - 2, hy, 8, 1, LEATHER); P(hx + 5, hy - 2, 3, 5, STEEL); P(hx + 5, hy - 2, 3, 1, STEEL_L, true)
    } else if (pose === "down") {
      P(hx, hy - 1, 1, 7, LEATHER); P(hx + 1, hy + 3, 3, 4, STEEL)
    } else {
      P(hx, hy - 6, 1, 8, LEATHER); P(hx + 1, hy - 7, 3, 4, STEEL); P(hx + 1, hy - 7, 3, 1, STEEL_L, true)
    }
  } else if (kind === "spear") {
    if (pose === "horiz") {
      P(hx - 6, hy, 14, 1, LEATHER); P(hx + 8, hy - 1, 4, 3, STEEL_L)
    } else if (pose === "up") {
      P(hx - 1, hy - 12, 1, 16, LEATHER); P(hx - 1, hy - 15, 1, 4, STEEL_L)
    } else if (pose === "down") {
      P(hx - 5, hy + 1, 12, 1, LEATHER); P(hx + 7, hy, 3, 3, STEEL_L)
    } else {
      P(hx, hy - 12, 1, 16, LEATHER); P(hx, hy - 15, 1, 4, STEEL_L)
    }
  }
}

// ---- Heads ---------------------------------------------------------------
function drawHelm(P, look, vy) {
  var h = look.helm
  if (h === "horned") {
    P(-3, vy, 7, 3, STEEL); P(-2, vy - 1, 4, 1, STEEL, true); P(-2, vy, 3, 1, STEEL_L, true)
    P(-3, vy + 2, 7, 1, GOLD, true); P(2, vy + 2, 1, 3, STEEL_D)
    P(-4, vy - 1, 1, 2, BONE); P(-5, vy - 3, 1, 3, BONE); P(4, vy - 1, 1, 2, BONE); P(5, vy - 3, 1, 3, BONE)
  } else if (h === "norse") {
    P(-3, vy, 7, 3, STEEL); P(-2, vy - 1, 4, 1, STEEL, true); P(-2, vy, 3, 1, STEEL_L, true)
    P(-3, vy + 2, 7, 1, STEEL_D, true); P(2, vy + 2, 1, 3, STEEL_D)
  } else if (h === "band") {
    P(-2, vy + 1, 5, 1, look.hair); P(-3, vy + 2, 7, 1, look.trim); P(-3, vy, 4, 1, shade(look.hair, 0.25), true)
  } else if (h === "cap") {
    P(-3, vy + 1, 7, 2, LEATHER); P(-2, vy, 4, 1, LEATHER, true); P(-3, vy + 2, 7, 1, LEATHER_D, true)
  } else if (h === "hood") {
    P(-3, vy, 7, 3, look.cloak); P(-4, vy + 2, 2, 5, look.cloak); P(-3, vy, 7, 1, shade(look.cloak, 0.18), true)
    P(2, vy + 2, 1, 4, shade(look.cloak, -0.35), true)
  } else if (h === "nasal" || h === "crest") {
    P(-3, vy, 7, 3, STEEL); P(-1, vy - 1, 3, 1, STEEL, true); P(0, vy - 2, 1, 1, STEEL_L, true)
    P(-2, vy, 3, 1, STEEL_L, true); P(-3, vy + 2, 7, 1, STEEL_D, true); P(2, vy + 2, 1, 3, STEEL_D)
    if (h === "crest") { P(-2, vy - 3, 3, 1, "#a33a2c", true); P(-1, vy - 2, 1, 1, "#a33a2c", true) }
  } else if (h === "coif") {
    P(-3, vy, 7, 4, "#8a9aa3"); P(-4, vy + 2, 2, 5, "#8a9aa3"); P(-3, vy, 7, 1, STEEL_L, true)
    P(-2, vy + 1, 1, 1, STEEL_D, true); P(0, vy + 2, 1, 1, STEEL_D, true)
  }
}

function drawHead(P, look, vy) {
  P(-2, vy + 2, 5, 4, SKIN)
  P(-2, vy + 2, 1, 4, SKIN_D, true)
  P(1, vy + 3, 1, 1, INK, true)
  P(2, vy + 4, 1, 1, SKIN_D, true)
  if (look.helm !== "coif" && look.helm !== "hood") {
    P(-3, vy + 1, 2, 5, look.hair)
    P(-3, vy + 4, 1, 3, shade(look.hair, -0.35), true)
  }
  if (look.beard > 0) {
    P(0, vy + 5, 3, look.beard + 1, look.hair)
    P(1, vy + 4, 2, 1, look.hair, true)
    P(0, vy + 5 + look.beard, 2, 1, shade(look.hair, -0.35), true)
  }
  drawHelm(P, look, vy)
}

// ---- A standing / fighting warrior ----------------------------------------
function drawFighter(ctx, f, t) {
  if (f.role === "banner") { drawBanner(ctx, f, t); return }
  var dir = f.dir > 0 ? 1 : -1
  var x = Math.round(f.x)
  var foot = Math.round(f.lane)
  var dyingP = (f.state === "dying") ? 1 - f.timer / 14 : 0
  if (dyingP >= 0.45) return                              // already lying down: drawCorpse() handles it

  var walking = f.state === "advance"
  var step = walking ? (Math.floor(t * 0.25 + f.id) % 4) : 0
  var bob = (walking && (step === 1 || step === 3)) ? -1 : 0
  if (!walking && f.atkPhase === 0 && Math.floor((t + f.id * 5) / 22) % 4 === 3) bob = 1
  var ox = dyingP > 0 ? -dir * Math.round(dyingP * 7) : 0
  var vy = foot - 17 + bob + (dyingP > 0 ? Math.round(dyingP * 4) : 0)
  var look = f.look
  var flash = f.hitFlash > 0
  var parts = []

  function C(c) { return flash ? shade(c, 0.6) : c }
  function P(lx, ly, w, h, c, noOutline) {
    parts.push({ x: dir > 0 ? x + ox + lx : x + ox - lx - w + 1, y: ly, w: w, h: h, c: C(c), o: !noOutline })
  }
  function PR(lx, ly, w, h, c, noOutline) {                // raw colour (no hit flash), used for shield rim flash
    parts.push({ x: dir > 0 ? x + ox + lx : x + ox - lx - w + 1, y: ly, w: w, h: h, c: c, o: !noOutline })
  }

  var tunic = look.tunic, tunicL = shade(tunic, 0.22), tunicD = shade(tunic, -0.35)
  var cloak = look.cloak, cloakD = shade(cloak, -0.35), cloakL = shade(cloak, 0.18)

  // Shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
  ctx.fillRect(x - 5, foot - 1, 10, 2)

  // Cloak
  var flutter = walking ? ((step === 1 || step === 2) ? 1 : 0) : (Math.floor(t / 20 + f.id) % 2)
  P(-5 - flutter, vy + 6, 3 + flutter, 8, cloak)
  P(-5 - flutter, vy + 12, 3 + flutter, 2, cloakD, true)
  P(-3, vy + 6, 1, 2, cloakL, true)

  // Legs and boots
  var l1 = 0, l2 = 0
  if (walking) { l1 = (step === 0) ? -2 : (step === 2 ? 2 : 0); l2 = -l1 }
  else if (f.atkPhase === 2) { l1 = -1; l2 = 1 }          // lunge on the strike
  P(-2 + l1, vy + 12, 2, 3, look.pants)
  P(-2 + l1, foot - 2, 3, 2, LEATHER_D)
  P(0 + l2, vy + 12, 2, 3, shade(look.pants, 0.15))
  P(0 + l2, foot - 2, 3, 2, LEATHER)

  // Torso (mail shirt when the look asks for it)
  P(-3, vy + 6, 7, 6, tunic)
  P(-3, vy + 6, 2, 6, tunicD, true)
  P(1, vy + 6, 1, 3, tunicL, true)
  P(-3, vy + 11, 7, 1, tunicD, true)
  if (look.mail) {
    P(-3, vy + 6, 7, 4, "#8a9aa3", true)
    P(-2, vy + 7, 1, 1, STEEL_D, true); P(0, vy + 8, 1, 1, STEEL_D, true); P(2, vy + 7, 1, 1, STEEL_D, true)
  }
  P(-3, vy + 9, 7, 1, LEATHER_D, true)
  P(1, vy + 9, 2, 1, look.trim, true)
  P(-3, vy + 6, 7, 1, look.trim, true)

  drawHead(P, look, vy)

  // Pose: where the weapon hand is and how the blade points
  var pose = "diag", hx = 4, hy = vy + 8
  if (f.state === "cheer") { pose = "up"; hx = 3; hy = vy + 3 }
  else if (f.atkPhase === 1) { pose = "up"; hx = 3; hy = vy + 4 }
  else if (f.atkPhase === 2) { pose = "horiz"; hx = 5; hy = vy + 9 }
  else if (f.atkPhase === 3) { pose = "down"; hx = 4; hy = vy + 11 }
  else if (walking) { hy = vy + 8 + ((step === 0) ? 1 : (step === 2 ? -1 : 0)) }

  // Shield (forward when blocking)
  var blocking = f.state === "block"
  if (f.shield && f.weapon !== "bow") {
    var sx = blocking ? 1 : -1
    var sy = blocking ? vy + 5 : vy + 6
    drawShield(PR, f.shield, sx, sy, f.blockFlash > 0)
  }

  // Front arm and hand
  if (pose === "up") P(2, hy, 2, 4, tunic)
  else P(1, hy - 1, 3, 2, tunic)
  P(hx - 1, hy - 1, 2, 2, SKIN)

  if (dyingP === 0) {
    if (f.weapon === "bow") drawBow(P, f, vy, hx, hy)
    else drawWeapon(P, f.weapon, pose, hx, hy)
  }

  paint(ctx, parts)

  // Leaders show a slim health bar once wounded
  if ((f.role === "leader" || f.role === "thegn") && f.hp < f.maxHp && f.hp > 0) {
    var bw = 9, bx = x - 4, by = vy - (look.helm === "horned" ? 6 : 4)
    ctx.fillStyle = INK
    ctx.fillRect(bx - 1, by - 1, bw + 2, 3)
    ctx.fillStyle = f.side === "norse" ? TEAL : "#c8554b"
    ctx.fillRect(bx, by, Math.max(1, Math.round(bw * f.hp / f.maxHp)), 1)
  }

  // Battle-cry bubble with an Elder Futhark rune
  if (f.bubbleTimer > 0 && f.bubbleRune.length > 0) {
    var bubX = x - 5, bubY = vy - 16
    ctx.fillStyle = "rgba(9, 15, 21, 0.88)"
    ctx.fillRect(bubX, bubY, 11, 10)
    ctx.fillStyle = TEAL
    ctx.fillRect(bubX, bubY, 11, 1)
    ctx.fillRect(bubX, bubY + 9, 11, 1)
    ctx.fillRect(bubX, bubY, 1, 10)
    ctx.fillRect(bubX + 10, bubY, 1, 10)
    ctx.fillRect(x, bubY + 10, 2, 2)
    ctx.fillStyle = GOLD
    ctx.font = "8px 'Noto Sans Runic'"
    ctx.fillText(f.bubbleRune, bubX + 2, bubY + 8)
  }
}

function drawBow(P, f, vy, hx, hy) {
  var pull = f.atkPhase === 1
  var BOW = "#6a4529"
  P(hx, vy + 4, 1, 2, BOW)
  P(hx - 1, vy + 6, 1, 4, BOW)
  P(hx, vy + 10, 1, 2, BOW)
  if (pull) {
    P(hx - 4, vy + 8, 1, 1, "#d8d0b8", true)
    P(hx - 4, vy + 8, 8, 1, "#d8d0b8", true)             // nocked arrow
    P(hx + 4, vy + 8, 1, 1, STEEL_L, true)
  } else {
    P(hx - 1, vy + 5, 1, 6, "#d8d0b8", true)
  }
}

// ---- Banners ----------------------------------------------------------------
function drawBanner(ctx, f, t) {
  var dir = f.dir > 0 ? 1 : -1
  var x = Math.round(f.x)
  var foot = Math.round(f.lane)
  var top = foot - 34
  var parts = []
  function P(lx, ly, w, h, c, noOutline) {
    parts.push({ x: dir > 0 ? x + lx : x - lx - w + 1, y: ly, w: w, h: h, c: c, o: !noOutline })
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
  ctx.fillRect(x - 4, foot - 1, 8, 2)

  P(2, top, 1, 36, LEATHER)                                // pole
  P(1, top - 2, 3, 3, GOLD)                                // finial
  P(-9, top + 2, 12, 1, LEATHER_D)                         // crossbar
  var norse = f.side === "norse"
  var cloth = norse ? NAVY : "#a33a2c"
  var cloth2 = norse ? "#1d2a3a" : "#8f2a24"
  for (var row = 0; row < 18; row++) {
    var wave = Math.round(Math.sin(t * 0.12 + row * 0.5) * 1.2)
    var inset = row > 13 ? (row - 13) : 0
    P(-8 + wave + inset, top + 3 + row, 10 - inset * 2, 1, (row % 4 < 2) ? cloth : cloth2, true)
  }
  P(-9, top + 3, 12, 18, "rgba(0,0,0,0)", false)           // outline only
  if (norse) {
    var raven = [
      "#.....#", "##...##", ".##.##.", "..#e#..", "...G...", "..###..", "..#.#.."
    ]
    for (var r = 0; r < raven.length; r++) {
      for (var c = 0; c < raven[r].length; c++) {
        var ch = raven[r].charAt(c)
        if (ch === ".") continue
        var wv = Math.round(Math.sin(t * 0.12 + (r + 3) * 0.5) * 1.2)
        P(-7 + c + wv, top + 6 + r, 1, 1, ch === "#" ? BONE : (ch === "e" ? TEAL : GOLD), true)
      }
    }
    P(-8, top + 20, 10, 1, TEAL, true)
  } else {
    for (var d = 0; d < 7; d++) {                           // gold wyvern-ish zigzag
      var wv2 = Math.round(Math.sin(t * 0.12 + (d + 4) * 0.5) * 1.2)
      P(-6 + wv2 + (d % 2) * 2, top + 7 + d, 4, 1, GOLD, true)
    }
    P(-8, top + 20, 10, 1, GOLD, true)
  }

  // paint, skipping the transparent outline-only marker
  ctx.fillStyle = INK
  for (var i = 0; i < parts.length; i++) {
    if (parts[i].o) ctx.fillRect(parts[i].x - 1, parts[i].y - 1, parts[i].w + 2, parts[i].h + 2)
  }
  for (var j = 0; j < parts.length; j++) {
    if (parts[j].c === "rgba(0,0,0,0)") continue
    ctx.fillStyle = parts[j].c
    ctx.fillRect(parts[j].x, parts[j].y, parts[j].w, parts[j].h)
  }
}

// ---- Fallen warriors ----------------------------------------------------------
function drawCorpse(ctx, c, t) {
  var dir = c.fallDir > 0 ? 1 : -1
  var x = Math.round(c.x)
  var foot = Math.round(c.lane)
  var look = c.look
  var parts = []
  function P(lx, ly, w, h, col, noOutline) {
    parts.push({ x: dir > 0 ? x + lx : x - lx - w + 1, y: foot + ly, w: w, h: h, c: col, o: !noOutline })
  }
  var fade = c.age > 780 ? Math.max(0, 1 - (c.age - 780) / 120) : 1
  ctx.globalAlpha = fade
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)"
  ctx.fillRect(x - 8, foot - 1, 16, 2)
  P(-9, -2, 2, 2, LEATHER_D)                                // boots
  P(-7, -3, 4, 2, look.pants)                               // legs
  P(-3, -4, 7, 3, look.tunic)                               // torso
  P(-3, -4, 7, 1, look.trim, true)
  P(4, -4, 3, 3, SKIN)                                      // head
  P(3, -4, 1, 3, look.hair, true)
  if (look.helm === "horned" || look.helm === "norse" || look.helm === "nasal" || look.helm === "crest") P(4, -5, 3, 2, STEEL)
  if (c.shield) {
    var s = c.shield
    var a = s.style === "raven" || s.style === "quarter" || s.style === "rim" ? NAVY :
            (s.style === "ochre" ? "#c2872f" : (s.style === "green" ? "#2f5a3a" : "#a33a2c"))
    var b = (s.style === "raven" || s.style === "quarter") ? BONE : (s.style === "rim" ? TEAL : "#d9a441")
    P(-2, -7, 5, 3, b)
    P(-1, -6, 3, 1, a, true)
  }
  P(7, -1, 5, 1, STEEL, true)                               // dropped weapon
  paint(ctx, parts)
  ctx.globalAlpha = 1
}
