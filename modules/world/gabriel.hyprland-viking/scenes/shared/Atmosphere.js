.pragma library

// ============================================================================
// Atmosphere.js — sky and weather particles any scene can reuse:
// stars, aurora, lightning bolts, rain with splashes, snow and drifting fog.
// ============================================================================

function create(pw, ph) {
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
  return { stars: stars, raindrops: raindrops, splashes: [], snowflakes: snowflakes }
}

// Jagged bolt from the top of the sky down to `groundY`.
function makeBolt(x, groundY) {
  var segs = []
  var cx = x
  var cy = 0
  while (cy < groundY) {
    var nx = cx + Math.floor((Math.random() - 0.45) * 14)
    var ny = cy + 8 + Math.floor(Math.random() * 10)
    segs.push({ x1: cx, y1: cy, x2: nx, y2: ny })
    cx = nx
    cy = ny
  }
  return segs
}

// Advances rain/snow. Rain lands at a random y inside [landMin, landMax].
function step(a, weather, tick, pw, ph, landMin, landMax) {
  var activeRain = Math.floor(a.raindrops.length * weather.rainIntensity)
  var splashes = []
  for (var s = 0; s < a.splashes.length; s++) {
    var sp = a.splashes[s]
    sp.age += 1
    if (sp.age < 5) splashes.push(sp)
  }
  for (var i = 0; i < activeRain; i++) {
    var d = a.raindrops[i]
    d.x += weather.windSpeed * 0.85
    d.y += d.speed
    var hitY = landMin + Math.floor(Math.random() * (landMax - landMin))
    if (d.y >= hitY) {
      if (splashes.length < 45 && Math.random() < 0.45) {
        splashes.push({ x: Math.floor(d.x), y: Math.floor(hitY), age: 0 })
      }
      d.y = -5 - Math.random() * 20
      d.x = Math.random() * (pw + 60) - 30
    }
    if (d.x > pw + 20) d.x = -10
    if (d.x < -20) d.x = pw + 10
  }
  a.splashes = splashes

  var activeSnow = Math.floor(a.snowflakes.length * weather.snowIntensity)
  for (var n = 0; n < activeSnow; n++) {
    var sf = a.snowflakes[n]
    sf.x += weather.windSpeed * 0.25 + Math.sin(tick * 0.04 + sf.phase) * 0.25
    sf.y += sf.speed
    if (sf.y > ph) {
      sf.y = -4
      sf.x = Math.random() * pw
    }
    if (sf.x > pw) sf.x = 0
    if (sf.x < 0) sf.x = pw
  }
}

// ---- Drawing ----------------------------------------------------------------

function drawStars(ctx, a, t, alpha, rainIntensity) {
  if (alpha <= 0) return
  for (var i = 0; i < a.stars.length; i++) {
    var st = a.stars[i]
    var tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.03 + st.phase))
    ctx.fillStyle = "rgba(220, 240, 250, " + (tw * alpha * (1.0 - rainIntensity * 0.45)).toFixed(2) + ")"
    ctx.fillRect(st.x, st.y, st.size, st.size)
  }
}

function drawAurora(ctx, w, t, intensity) {
  if (intensity <= 0.05) return
  for (var ax = 0; ax < w; ax += 3) {
    var wave1 = Math.sin(ax * 0.022 + t * 0.025) * 10 + Math.cos(ax * 0.05 - t * 0.018) * 5
    var ay = Math.floor(26 + wave1)
    var ah = Math.floor(14 + Math.sin(ax * 0.04 + t * 0.03) * 8)
    var alpha = (0.14 + 0.14 * Math.sin(ax * 0.03 + t * 0.02)) * intensity
    ctx.fillStyle = "rgba(78, 205, 196, " + alpha.toFixed(3) + ")"
    ctx.fillRect(ax, ay, 2, ah)
    ctx.fillStyle = "rgba(240, 186, 101, " + (alpha * 0.55).toFixed(3) + ")"
    ctx.fillRect(ax, ay - 3, 2, 3)
  }
}

function drawLightning(ctx, sim, w, flashH) {
  if (!(sim.lightningFlash > 0)) return
  ctx.fillStyle = "rgba(210, 240, 255, " + (sim.lightningFlash * 0.35).toFixed(2) + ")"
  ctx.fillRect(0, 0, w, flashH)
  for (var i = 0; i < sim.lightningSegments.length; i++) {
    var seg = sim.lightningSegments[i]
    var h = Math.max(2, seg.y2 - seg.y1)
    ctx.fillStyle = "#e8faff"
    ctx.fillRect(seg.x1, seg.y1, 2, h)
    ctx.fillStyle = "#4ecdc4"
    ctx.fillRect(seg.x1 - 1, seg.y1, 1, h)
  }
}

function drawFog(ctx, w, t, density, baseY) {
  if (density <= 0.05) return
  for (var fg = 0; fg < 6; fg++) {
    var fgX = Math.round(((fg * 75 + t * (0.2 + fg * 0.04)) % (w + 90)) - 45)
    var fgY = baseY + (fg % 3) * 8
    ctx.fillStyle = "rgba(140, 185, 198, " + (density * 0.14).toFixed(2) + ")"
    ctx.fillRect(fgX, fgY, 64, 5)
    ctx.fillRect(fgX + 10, fgY - 2, 44, 2)
  }
}

function drawRain(ctx, a, weather) {
  var count = Math.floor(a.raindrops.length * weather.rainIntensity)
  if (count <= 0) return
  ctx.fillStyle = "rgba(165, 215, 235, 0.52)"
  for (var r = 0; r < count; r++) {
    var drop = a.raindrops[r]
    var dx = Math.round(drop.x)
    var dy = Math.round(drop.y)
    for (var s = 0; s < drop.len; s++) {
      ctx.fillRect(dx + Math.round(s * weather.windSpeed * 0.25), dy + s, 1, 1)
    }
  }
  ctx.fillStyle = "rgba(195, 235, 250, 0.68)"
  for (var i = 0; i < a.splashes.length; i++) {
    var sp = a.splashes[i]
    if (sp.age < 2) {
      ctx.fillRect(sp.x, sp.y - 1, 1, 1)
    } else {
      ctx.fillRect(sp.x - 2, sp.y - 1, 1, 1)
      ctx.fillRect(sp.x + 2, sp.y - 1, 1, 1)
      ctx.fillRect(sp.x - 1, sp.y, 3, 1)
    }
  }
}

function drawSnow(ctx, a, weather) {
  var count = Math.floor(a.snowflakes.length * weather.snowIntensity)
  if (count <= 0) return
  ctx.fillStyle = "rgba(235, 248, 255, 0.82)"
  for (var i = 0; i < count; i++) {
    var f = a.snowflakes[i]
    ctx.fillRect(Math.round(f.x), Math.round(f.y), 2, 2)
  }
}
