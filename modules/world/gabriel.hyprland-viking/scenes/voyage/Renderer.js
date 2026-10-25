.pragma library
.import "../shared/Atmosphere.js" as Atmosphere
.import "../valhalla/EntityRenderer.js" as Ships
.import "../valhalla/Palettes.js" as Palettes
.import "Layout.js" as Layout

// ============================================================================
// Renderer.js — dynamic layer of the voyage, back to front: sky weather, drifting
// clouds, islands, wildlife, back swells, the drakkar with its crew, the
// water line, front swells, wake and bow spray, then rain, fog and colour grade.
// ============================================================================

var INK = "#0b0f14"
var WOOD = "#6a4529", WOOD_D = "#3f2716"

function wavePhase(t, k) { return Math.sin(2 * Math.PI * t / 48 + k * 0.12) }

// ---- Sky -------------------------------------------------------------------
function drawClouds(ctx, sim, pal) {
  for (var i = 0; i < sim.clouds.length; i++) {
    var cl = sim.clouds[i]
    var x = Math.round(cl.x), y = Math.round(cl.y)
    ctx.fillStyle = pal.cloud.body
    ctx.fillRect(x + 8, y, cl.w - 16, 2)
    ctx.fillRect(x + 2, y + 2, cl.w - 4, 3)
    ctx.fillRect(x + 10, y + 5, cl.w - 22, 2)
    ctx.fillStyle = pal.cloud.rim
    ctx.fillRect(x + 8, y, cl.w - 16, 1)
    ctx.fillRect(x + 2, y + 2, 6, 1)
    ctx.fillStyle = pal.cloud.under
    ctx.fillRect(x + 12, y + 6, cl.w - 26, 1)
  }
}

function drawIslands(ctx, sim, pal, t, hz) {
  for (var i = 0; i < sim.islands.length; i++) {
    var isl = sim.islands[i]
    var x0 = Math.round(isl.x)
    for (var dx = 0; dx < isl.w; dx++) {
      var hh = Math.round(isl.h * Math.pow(Math.sin(Math.PI * dx / isl.w), 0.7))
      if (hh <= 0) continue
      ctx.fillStyle = pal.mountainMid
      ctx.fillRect(x0 + dx, hz + 1 - hh, 1, hh)
      ctx.fillStyle = pal.midTop
      ctx.fillRect(x0 + dx, hz + 1 - hh, 1, 1)
    }
    ctx.fillStyle = pal.forestA
    for (var tr = 0; tr < isl.trees; tr++) {
      var tx = x0 + Math.round((tr + 1) * isl.w / (isl.trees + 1))
      var th = 4 + (tr * 5) % 4
      var base = hz + 1 - Math.round(isl.h * Math.pow(Math.sin(Math.PI * (tx - x0) / isl.w), 0.7))
      for (var tl = 0; tl < th; tl += 2) ctx.fillRect(tx - Math.floor(tl / 2), base - th + tl, 1 + tl, 2)
    }
    if (isl.beacon) {
      var bx = x0 + Math.floor(isl.w / 2)
      var by = hz + 1 - isl.h
      ctx.fillStyle = "#5a6068"
      ctx.fillRect(bx - 1, by - 8, 4, 8)
      ctx.fillStyle = "#3c434a"
      ctx.fillRect(bx - 2, by - 9, 6, 2)
      var fl = 2 + Math.floor(Math.abs(Math.sin(t * 0.3)) * 3)
      ctx.fillStyle = "rgba(255, 150, 60, 0.14)"             // cross-shaped glow, no hard box
      ctx.fillRect(bx - 4, by - 14, 10, 3)
      ctx.fillRect(bx - 1, by - 18, 4, 11)
      ctx.fillStyle = "#e0561f"
      ctx.fillRect(bx, by - 9 - fl, 2, fl)
      ctx.fillStyle = "#ffd35c"
      ctx.fillRect(bx, by - 9 - Math.floor(fl / 2), 2, Math.floor(fl / 2))
    }
  }
}

function drawGull(ctx, g, t) {
  var x = Math.round(g.x), y = Math.round(g.y)
  var up = Math.floor(t * 0.2 + g.phase) % 2 === 0
  ctx.fillStyle = "#e6edf0"
  ctx.fillRect(x, y, 1, 1)
  ctx.fillRect(x - 1, y + (up ? -1 : 1), 1, 1)
  ctx.fillRect(x + 1, y + (up ? -1 : 1), 1, 1)
  ctx.fillRect(x - 2, y + (up ? -2 : 1), 1, 1)
  ctx.fillRect(x + 2, y + (up ? -2 : 1), 1, 1)
}

function drawRaven(ctx, x, y, t, phase) {
  var wingY = (Math.floor(t * 0.3 + phase) % 2 === 0) ? -2 : 1
  ctx.fillStyle = "#0b1116"
  ctx.fillRect(x - 2, y, 4, 2)
  ctx.fillRect(x - 3, y + wingY, 2, 2)
  ctx.fillRect(x + 1, y + wingY, 2, 2)
}

// ---- Whale -------------------------------------------------------------------
function drawWhale(ctx, ev) {
  var p = ev.t / ev.T
  var rise = p < 0.2 ? p / 0.2 : (p > 0.75 ? (1 - p) / 0.25 : 1)
  var wy = ev.y
  var rx = 12
  var ry = Math.round(5 * rise)
  var i
  if (ry > 0) {
    for (var dy = 0; dy < ry; dy++) {
      var half = Math.round(rx * Math.sqrt(1 - Math.pow(1 - (dy + 1) / ry, 2)))
      ctx.fillStyle = dy === 0 ? "#3a5566" : "#1b2a35"
      ctx.fillRect(ev.x - half, wy - ry + dy, half * 2 + 1, 1)
    }
    ctx.fillStyle = "#1b2a35"
    ctx.fillRect(ev.x + 5, wy - ry - 2, 2, 2)
    ctx.fillRect(ev.x + 6, wy - ry - 3, 1, 1)
    ctx.fillStyle = "#4a6577"
    ctx.fillRect(ev.x - rx + 3, wy - 1, rx, 1)                    // pale belly line
  }
  ctx.fillStyle = "rgba(225, 242, 248, 0.6)"
  ctx.fillRect(ev.x - rx - 2, wy, rx * 2 + 5, 1)
  if (p > 0.25 && p < 0.58) {                                       // the spout
    var sp = (p - 0.25) / 0.33
    var height = Math.round(10 * Math.sin(Math.PI * Math.min(1, sp * 1.2)))
    for (i = 0; i < height; i += 2) {
      ctx.fillStyle = "rgba(235, 248, 255, " + (0.85 - i * 0.05).toFixed(2) + ")"
      ctx.fillRect(ev.x - 6, wy - ry - 1 - i, 1, 2)
    }
    ctx.fillStyle = "rgba(235, 248, 255, 0.7)"
    ctx.fillRect(ev.x - 8, wy - ry - height + 1, 1, 1)
    ctx.fillRect(ev.x - 4, wy - ry - height + 2, 1, 1)
    ctx.fillRect(ev.x - 7, wy - ry - height + 4, 1, 1)
    ctx.fillRect(ev.x - 5, wy - ry - height + 5, 1, 1)
  }
  if (p > 0.78) {                                                   // flukes as it dives
    var f = (p - 0.78) / 0.22
    var fy = wy - Math.round(7 * Math.sin(Math.PI * Math.min(1, f * 1.1)))
    ctx.fillStyle = "#1b2a35"
    ctx.fillRect(ev.x + rx, fy, 2, 4)
    ctx.fillRect(ev.x + rx - 2, fy - 1, 6, 2)
  }
}

// ---- Water ----------------------------------------------------------------------
function drawWaves(ctx, t, w, y0, y1, hz, h, swell, pal) {
  for (var y = y0; y < y1; y += 2) {
    var d = (y - hz) / (h - hz)
    var len = 3 + Math.floor(d * 14)
    var gap = 16 + Math.floor(d * 30)
    var off = Math.floor(y * 13 + t * (0.12 + d * 0.9)) % gap
    var amp = swell * (0.4 + d)
    var a = 0.10 + 0.16 * d
    for (var x = off - gap; x < w; x += gap) {
      var yy = y + Math.round(Math.sin(x * 0.06 + t * 0.05 + y) * amp * 0.6)
      ctx.fillStyle = "rgba(0, 0, 0, " + (a * 0.8).toFixed(2) + ")"
      ctx.fillRect(x + 1, yy + 1, len, 1)
      ctx.fillStyle = "rgba(205, 235, 245, " + a.toFixed(2) + ")"
      ctx.fillRect(x, yy, len, 1)
      if (len > 8) {
        ctx.fillStyle = "rgba(235, 248, 255, " + (a * 0.9).toFixed(2) + ")"
        ctx.fillRect(x + 2, yy - 1, len - 4, 1)
      }
    }
  }
}

function drawGlow(ctx, t, pal, y0, y1, hz, h) {
  for (var y = y0; y < y1; y += 2) {
    var d = (y - hz) / (h - hz)
    var shift = Math.round(Math.sin(y * 0.5 + t * 0.1) * (2 + d * 3))
    var width = Math.max(2, Math.floor(10 - d * 4)) + ((y >> 1) % 3)
    var shimmer = 0.55 + 0.45 * Math.sin(y * 0.9 + t * 0.15)
    ctx.fillStyle = "rgba(" + pal.celGlow + ", " + ((1.0 - d * 0.7) * 0.32 * shimmer).toFixed(2) + ")"
    ctx.fillRect(pal.celX - Math.floor(width / 2) + shift, y, width, 1)
  }
}

// ---- The ship ----------------------------------------------------------------------
function drawBubble(ctx, x, y, rune) {
  ctx.fillStyle = "rgba(9, 15, 21, 0.88)"
  ctx.fillRect(x, y, 11, 10)
  ctx.fillStyle = "#4ecdc4"
  ctx.fillRect(x, y, 11, 1)
  ctx.fillRect(x, y + 9, 11, 1)
  ctx.fillRect(x, y, 1, 10)
  ctx.fillRect(x + 10, y, 1, 10)
  ctx.fillRect(x + 5, y + 10, 2, 2)
  ctx.fillStyle = "#f0ba65"
  ctx.font = "8px 'Noto Sans Runic'"
  ctx.fillText(rune, x + 2, y + 8)
}

function drawShip(ctx, sim, weather, fx, t) {
  var S = Layout.SHIP
  var swell = Math.min(3, 0.6 + weather.rainIntensity * 1.2 + Math.abs(weather.windSpeed) * 0.4 + weather.thunderFrequency * 0.5)
  var bob = Math.round(Math.sin(t * 0.05) * (1 + swell * 0.6))
  var sy = S.baseSy + bob

  ctx.save()
  ctx.translate(S.tx, S.ty)
  ctx.scale(S.scale, S.scale)

  Ships.drawDrakkar(ctx, t, { sy: sy, noOars: true })

  // Oars: shaft from the oarlock into the water; the blade sweeps toward the stern on the pull
  for (var k = 0; k < 6; k++) {
    var ox = 26 + k * 8
    var bx = ox + 6 + Math.round(wavePhase(t, k) * 4)
    ctx.fillStyle = WOOD
    for (var i = 0; i <= 8; i++) ctx.fillRect(ox + Math.round((bx - ox) * i / 8), sy + 1 + i, 1, 1)
    ctx.fillStyle = INK
    ctx.fillRect(ox - 1, sy + 1, 2, 1)
  }

  if (fx.vikings !== false) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 80, 120, (sy - 3) - 80)                    // crew shows above the shield rack
    ctx.clip()
    for (var m = 0; m < Layout.CREW.length; m++) {
      var c = Layout.CREW[m]
      var st = sim.crew[m]
      var pull = c.job === "rower" && wavePhase(t, c.stroke) > 0 ? 1 : 0
      var vk = {
        x: c.x, dir: -1, role: c.role, weapon: c.weapon,
        state: (c.job === "lookout" && st.cheer > 0) ? "cheer" : c.state,
        cloakColor: "#14202e", tunicColor: c.tunic, trimColor: "#f0ba65",
        hairColor: c.hair, shieldColor: "#4ecdc4", bubbleRune: ""
      }
      Ships.drawPixelViking(ctx, vk, t, sy + 1 + pull)
    }
    ctx.restore()

    // Steering oar at the stern
    ctx.fillStyle = WOOD
    for (var s = 0; s < 16; s++) ctx.fillRect(74 + Math.floor(s * 0.5), sy - 8 + s, 1, 1)
    ctx.fillStyle = WOOD_D
    ctx.fillRect(81, sy + 6, 2, 4)

    for (var b = 0; b < sim.crew.length; b++) {
      if (sim.crew[b].bubbleTimer > 0 && sim.crew[b].bubbleRune.length > 0) {
        drawBubble(ctx, Layout.CREW[b].x - 5, sy - 31, sim.crew[b].bubbleRune)
      }
    }
  }

  if (fx.ravens !== false) {
    if (sim.mastRaven.state === "perch") {
      ctx.fillStyle = "#0b1116"
      ctx.fillRect(46, sy - 34, 4, 2)
      ctx.fillRect(47, sy - 35, 2, 2)
      ctx.fillStyle = "#4ecdc4"
      ctx.fillRect(47, sy - 35, 1, 1)
    } else {
      var away = 260 - sim.mastRaven.timer
      drawRaven(ctx, 47 - Math.floor(away * 0.35), sy - 36 - Math.floor(away * 0.12), t, 1)
    }
  }
  ctx.restore()
}

// ---- Main -------------------------------------------------------------------------------
function renderDynamic(ctx, sim, weather, g, env) {
  if (!sim) return
  var t = sim.tick
  var pal = Palettes.forPhase(env && env.tod)
  var fx = (env && env.effects) || {}
  var w = g.pw, h = g.ph, hz = g.waterY, W = g.groundY
  var night = (env && env.tod) === "night"
  var swell = Math.min(3, 0.6 + weather.rainIntensity * 1.2 + Math.abs(weather.windSpeed) * 0.4 + weather.thunderFrequency * 0.5)
  var i

  Atmosphere.drawStars(ctx, sim, t, (fx.stars === false) ? 0 : pal.starFactor, weather.rainIntensity)
  Atmosphere.drawAurora(ctx, w, t, weather.auroraIntensity * pal.auroraFactor)
  Atmosphere.drawLightning(ctx, sim, w, hz)

  drawClouds(ctx, sim, pal)
  drawIslands(ctx, sim, pal, t, hz)

  if (fx.wildlife !== false) {
    if (!night) for (i = 0; i < sim.gulls.length; i++) drawGull(ctx, sim.gulls[i], t)
  }
  if (fx.ravens !== false) {
    for (i = 0; i < sim.ravens.length; i++) drawRaven(ctx, Math.round(sim.ravens[i].x), Math.round(sim.ravens[i].y), t, sim.ravens[i].phase)
  }
  if (fx.wildlife !== false && sim.event) drawWhale(ctx, sim.event)

  drawGlow(ctx, t, pal, hz + 1, W, hz, h)
  drawWaves(ctx, t, w, hz + 2, W, hz, h, swell, pal)

  drawShip(ctx, sim, weather, fx, t)

  // Water line: hide the keel, then the front swells, glow, wake and bow spray
  var S = Layout.SHIP
  var band = pal.water[Math.min(pal.water.length - 1, Math.floor((W - hz) / Math.ceil((h - hz) / pal.water.length)))]
  ctx.fillStyle = band
  ctx.fillRect(S.tx + 4 * S.scale, W, 80 * S.scale, 8 * S.scale)
  drawGlow(ctx, t, pal, W, h, hz, h)
  drawWaves(ctx, t, w, W, h, hz, h, swell, pal)

  var wakeLen = 70 + 35 * S.scale
  var wakeX = S.tx + S.scale * 79
  for (i = 0; i < 20; i++) {
    var wx = wakeX + ((i * 7 + Math.floor(t * 0.7)) % wakeLen)
    var fade = 1 - (wx - wakeX) / wakeLen
    ctx.fillStyle = "rgba(225, 242, 248, " + (0.55 * fade).toFixed(2) + ")"
    ctx.fillRect(wx, W + 1 + (i % 3) * 2, 4 + (i % 3), 1)
  }
  var bowX = S.tx + S.scale * 9
  for (i = 0; i < 9; i++) {
    var sprayY = W - 3 + ((t + i * 3) % 5) - 2
    ctx.fillStyle = "rgba(235, 248, 255, " + (0.45 + 0.4 * ((i + t) % 2)).toFixed(2) + ")"
    ctx.fillRect(bowX - 8 + i * 2, sprayY, 2, 1)
  }

  Atmosphere.drawFog(ctx, w, t, weather.fogDensity, 130)
  Atmosphere.drawRain(ctx, sim, weather)
  Atmosphere.drawSnow(ctx, sim, weather)

  if (pal.tint) {
    ctx.fillStyle = pal.tint
    ctx.fillRect(0, 0, w, h)
  }
}
