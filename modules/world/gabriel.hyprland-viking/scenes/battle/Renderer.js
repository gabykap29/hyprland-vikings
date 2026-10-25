.pragma library
.import "../shared/Atmosphere.js" as Atmosphere
.import "Fighters.js" as Fighters
.import "Palettes.js" as Palettes
.import "Layout.js" as Layout

// ============================================================================
// Renderer.js — dynamic layer of the battle: flames and smoke, corpses, the
// fighters (depth-sorted by lane), arrows, ravens, sparks and the weather.
// ============================================================================

function drawFlames(ctx, t, fx) {
  for (var fi = 0; fi < Layout.FIRES.length; fi++) {
    var f = Layout.FIRES[fi]
    ctx.fillStyle = "rgba(255, 140, 40, " + (0.10 + 0.03 * Math.sin(t * 0.3 + fi)).toFixed(2) + ")"
    ctx.fillRect(f.x - 6, f.y - 14, f.w + 12, 18)
    for (var i = 0; i < f.w; i += 2) {
      var h = Math.round((3 + Math.abs(Math.sin(t * 0.32 + i * 1.7 + fi * 2.1)) * 6) * f.power)
      ctx.fillStyle = "#c9301c"
      ctx.fillRect(f.x + i, f.y - h, 2, h + 1)
      ctx.fillStyle = "#f08a24"
      ctx.fillRect(f.x + i, f.y - Math.round(h * 0.7), 2, Math.round(h * 0.7))
      ctx.fillStyle = "#ffd35c"
      ctx.fillRect(f.x + i, f.y - Math.round(h * 0.38), 1 + (i % 4 === 0 ? 1 : 0), Math.round(h * 0.38))
    }
  }
}

function drawSmoke(ctx, sim) {
  for (var i = 0; i < sim.smokePuffs.length; i++) {
    var p = sim.smokePuffs[i]
    ctx.fillStyle = "rgba(60, 56, 56, " + ((1.0 - p.age) * 0.42).toFixed(2) + ")"
    var size = 3 + Math.floor(p.age * 8)
    ctx.fillRect(Math.round(p.x), Math.round(p.y), size, size)
  }
}

function drawEmbers(ctx, sim) {
  for (var i = 0; i < sim.sparks.length; i++) {
    var e = sim.sparks[i]
    ctx.fillStyle = e.life > 0.5 ? "#ffea9f" : "#e67e22"
    ctx.fillRect(Math.round(e.x), Math.round(e.y), 1, 1)
  }
}

function drawArrow(ctx, a, fire, t) {
  var dx = a.x - a.px, dy = a.y - a.py
  var x = Math.round(a.x), y = Math.round(a.y)
  var sx = dx >= 0 ? -1 : 1
  ctx.fillStyle = "#3a2517"
  ctx.fillRect(x + sx, y - (dy > 0.4 ? sx * -1 : 0) , 1, 1)
  ctx.fillRect(x + sx * 2, y - (dy > 0.4 ? sx * -2 : 0), 1, 1)
  ctx.fillStyle = "#e6edf0"
  ctx.fillRect(x, y, 1, 1)
  if (fire) {
    ctx.fillStyle = (Math.floor(t / 2) % 2 === 0) ? "#ffd35c" : "#f08a24"
    ctx.fillRect(x - sx, y - 1, 1, 1)
    ctx.fillStyle = "rgba(255, 140, 40, 0.30)"
    ctx.fillRect(x - 2, y - 2, 5, 5)
  }
}

function drawRaven(ctx, rv, t, idx) {
  var rx = Math.round(rv.x), ry = Math.round(rv.y)
  ctx.fillStyle = "#0b1116"
  ctx.fillRect(rx - 2, ry, 4, 2)
  if (rv.state === "perch") {
    ctx.fillRect(rx - 1, ry - 1, 2, 2)
    ctx.fillStyle = "#4ecdc4"
    ctx.fillRect(rx, ry - 1, 1, 1)
    if (Math.floor(t / 14 + idx) % 4 === 0) {              // peck
      ctx.fillStyle = "#0b1116"
      ctx.fillRect(rx + 1, ry + 1, 1, 1)
    }
  } else {
    var wingY = (Math.floor(t * 0.35 + idx) % 2 === 0) ? -2 : 1
    ctx.fillRect(rx - 3, ry + wingY, 2, 2)
    ctx.fillRect(rx + 1, ry + wingY, 2, 2)
  }
}

function drawFx(ctx, sim) {
  for (var i = 0; i < sim.fx.length; i++) {
    var p = sim.fx[i]
    if (p.kind === "spark") {
      ctx.fillStyle = p.life > 0.6 ? "#ffffff" : (p.life > 0.3 ? "#ffe9a8" : "#e67e22")
    } else {
      ctx.fillStyle = "rgba(122, 31, 31, " + Math.min(1, p.life * 1.4).toFixed(2) + ")"
    }
    ctx.fillRect(Math.round(p.x), Math.round(p.y), 1, 1)
  }
}

function drawSeaGlints(ctx, t) {
  ctx.fillStyle = "rgba(190, 225, 235, 0.35)"
  for (var i = 0; i < 9; i++) {
    var x = Math.round((i * 13 + t * 0.15) % 110)
    ctx.fillRect(x, 150 + (i * 7) % 20, 3, 1)
  }
}

function renderDynamic(ctx, sim, weather, g, env) {
  if (!sim) return
  var t = sim.tick
  var pal = Palettes.forPhase(env && env.tod)
  var fx = (env && env.effects) || {}
  var i

  var starAlpha = (fx.stars === false) ? 0 : pal.starFactor
  Atmosphere.drawStars(ctx, sim, t, starAlpha, weather.rainIntensity)
  Atmosphere.drawAurora(ctx, g.pw, t, weather.auroraIntensity * pal.auroraFactor)
  Atmosphere.drawLightning(ctx, sim, g.pw, Layout.LANE_MAX)

  drawSeaGlints(ctx, t)
  if (fx.fire !== false) {
    drawFlames(ctx, t, fx)
    drawSmoke(ctx, sim)
  }

  // Fallen warriors, then arrows stuck in the ground
  for (i = 0; i < sim.corpses.length; i++) Fighters.drawCorpse(ctx, sim.corpses[i], t)
  ctx.fillStyle = "#6a4529"
  for (i = 0; i < sim.stuck.length; i++) {
    var st = sim.stuck[i]
    ctx.fillRect(st.x, st.y - 4, 1, 4)
    ctx.fillStyle = "#d8d0b8"
    ctx.fillRect(st.x, st.y - 5, 1, 1)
    ctx.fillStyle = "#6a4529"
  }

  // Living fighters, banners included, back to front
  var order = sim.fighters.slice().sort(function(a, b) { return a.lane - b.lane })
  for (i = 0; i < order.length; i++) Fighters.drawFighter(ctx, order[i], t)

  for (i = 0; i < sim.arrows.length; i++) drawArrow(ctx, sim.arrows[i], sim.arrows[i].fire && fx.fire !== false, t)

  if (fx.fire !== false) drawEmbers(ctx, sim)
  drawFx(ctx, sim)

  if (fx.ravens !== false) {
    for (i = 0; i < sim.ravens.length; i++) drawRaven(ctx, sim.ravens[i], t, i)
  }

  Atmosphere.drawFog(ctx, g.pw, t, weather.fogDensity, 150)
  Atmosphere.drawRain(ctx, sim, weather)
  Atmosphere.drawSnow(ctx, sim, weather)

  if (pal.tint) {
    ctx.fillStyle = pal.tint
    ctx.fillRect(0, 0, g.pw, g.ph)
  }
}
