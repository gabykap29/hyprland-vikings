.pragma library

// ============================================================================
// EntityRenderer.js
// Dynamic 16-Bit Pixel-Art Renderer (Aurora, Lightning, Bobbing Drakkar,
// Campfire, Vikings + Elder Futhark Speech Bubbles, Ravens, Water, Rain & Snow)
// ============================================================================

function drawPixelViking(ctx, vk, tickCount, groundY) {
  var x = Math.round(vk.x)
  var y = groundY - 14
  var step = (vk.state === "walk") ? (Math.floor(tickCount * 0.25) % 4) : 0
  var bob = (vk.state === "walk" && (step === 1 || step === 3)) ? -1 : 0
  var vy = y + bob

  // Ground shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)"
  ctx.fillRect(x - 4, groundY - 1, 8, 2)

  // Legs
  ctx.fillStyle = "#1c1612"
  if (vk.state === "walk") {
    var l1 = (step === 0) ? -2 : (step === 2 ? 2 : 0)
    var l2 = -l1
    ctx.fillRect(x - 2 + l1, y + 10, 2, 4)
    ctx.fillRect(x + 1 + l2, y + 10, 2, 4)
  } else {
    ctx.fillRect(x - 2, y + 10, 2, 4)
    ctx.fillRect(x + 1, y + 10, 2, 4)
  }

  // Cloak
  ctx.fillStyle = vk.cloakColor
  var cloakX = vk.dir > 0 ? x - 4 : x + 1
  ctx.fillRect(cloakX, vy + 4, 3, 8)

  // Tunic & Belt
  ctx.fillStyle = vk.tunicColor
  ctx.fillRect(x - 2, vy + 4, 5, 6)
  ctx.fillStyle = vk.trimColor
  ctx.fillRect(x - 2, vy + 8, 5, 1)

  // Head, Hair & Beard
  ctx.fillStyle = "#e0b18c"
  ctx.fillRect(x - 1, vy + 1, 3, 3)
  ctx.fillStyle = vk.hairColor
  ctx.fillRect(x - 2, vy + 1, 1, 3)
  if (vk.role !== "guard" && vk.role !== "seer") {
    ctx.fillRect(x - 1 + (vk.dir > 0 ? 1 : -1), vy + 3, 2, 2)
  }

  // Helmet / Hood
  ctx.fillStyle = vk.role === "seer" ? vk.cloakColor : "#7c8d96"
  ctx.fillRect(x - 2, vy, 5, 2)
  if (vk.role === "jarl" || vk.role === "skald") {
    ctx.fillStyle = "#f0ba65"
    ctx.fillRect(x - 1, vy, 3, 1)
  }

  // Round Shield
  if (vk.role === "jarl" || vk.role === "guard") {
    ctx.fillStyle = vk.shieldColor
    ctx.fillRect(cloakX, vy + 4, 4, 4)
    ctx.fillStyle = "#f0ba65"
    ctx.fillRect(cloakX + 1, vy + 5, 2, 2)
  }

  // Weapon / Tool
  var armSwing = 0
  if (vk.state === "forge") armSwing = (Math.floor(tickCount * 0.35) % 2 === 0) ? -3 : 2
  else if (vk.state === "cheer" || vk.state === "chat") armSwing = (Math.floor(tickCount * 0.15) % 2 === 0) ? -3 : -1

  var handX = vk.dir > 0 ? x + 3 : x - 3
  var handY = vy + 5 + armSwing

  if (vk.weapon === "axe") {
    ctx.fillStyle = "#6e4c2e"
    ctx.fillRect(handX, handY - 3, 1, 6)
    ctx.fillStyle = "#a8bbc4"
    ctx.fillRect(handX + (vk.dir > 0 ? 1 : -2), handY - 3, 2, 3)
  } else if (vk.weapon === "spear") {
    ctx.fillStyle = "#6e4c2e"
    ctx.fillRect(handX, vy - 2 + Math.min(0, armSwing), 1, 13)
    ctx.fillStyle = "#c7dce6"
    ctx.fillRect(handX, vy - 4 + Math.min(0, armSwing), 1, 2)
  } else if (vk.weapon === "hammer") {
    ctx.fillStyle = "#6e4c2e"
    ctx.fillRect(handX, handY - 2, 1, 4)
    ctx.fillStyle = "#7c8d96"
    ctx.fillRect(handX - 1, handY - 3, 3, 2)
  } else if (vk.weapon === "horn") {
    ctx.fillStyle = "#f0ba65"
    ctx.fillRect(handX, handY - 1, 2, 2)
    ctx.fillRect(handX + (vk.dir > 0 ? 1 : -1), handY - 2, 1, 1)
  } else if (vk.weapon === "staff") {
    ctx.fillStyle = "#4d3320"
    ctx.fillRect(handX, vy + 1, 1, 11)
    ctx.fillStyle = "#4ecdc4"
    ctx.fillRect(handX, vy - 1, 2, 2)
  }

  // Elder Futhark Rune Speech Bubble
  if ((vk.state === "chat" || vk.state === "pray" || vk.state === "cheer") && vk.bubbleRune.length > 0) {
    var bx = x - 5
    var by = vy - 13
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
  var shipBob = Math.round(Math.sin(t * 0.06) * 1.4)
  var sy = 152 + shipBob
  ctx.fillStyle = "#422c1b"
  ctx.fillRect(46, sy - 28, 2, 30)
  ctx.fillRect(32, sy - 20, 30, 2)
  for (var sx = 33; sx < 61; sx += 4) {
    ctx.fillStyle = (sx % 8 === 3) ? "#8f2a24" : "#d49b4b"
    ctx.fillRect(sx, sy - 18, 4, 4)
  }
  var waveFlag = Math.round(Math.sin(t * 0.2) * 1)
  ctx.fillStyle = "#4ecdc4"
  ctx.fillRect(48, sy - 28, 7, 3)
  ctx.fillStyle = "#f0ba65"
  ctx.fillRect(55, sy - 28 + waveFlag, 4, 2)

  ctx.fillStyle = "#3b2618"
  ctx.fillRect(22, sy + 2, 48, 6)
  ctx.fillRect(18, sy, 56, 3)
  ctx.fillStyle = "#543824"
  ctx.fillRect(15, sy - 6, 4, 7)
  ctx.fillRect(12, sy - 9, 5, 4)
  ctx.fillStyle = "#f0ba65"
  ctx.fillRect(13, sy - 8, 2, 1)
  ctx.fillStyle = "#543824"
  ctx.fillRect(72, sy - 5, 3, 6)
  ctx.fillRect(74, sy - 8, 3, 4)

  for (var dsh = 24; dsh <= 64; dsh += 7) {
    ctx.fillStyle = (dsh % 14 === 3) ? "#f0ba65" : "#38b2a6"
    ctx.fillRect(dsh, sy, 4, 4)
  }

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

  // 10. Animated Fjord Water & Reflections
  ctx.fillStyle = "#07131c"
  ctx.fillRect(0, waterY, w, h - waterY)

  for (var wy = waterY; wy < h; wy += 2) {
    var depth = (wy - waterY) / (h - waterY)
    var shift = Math.round(Math.sin(wy * 0.35 + t * 0.12) * 2.5)

    ctx.fillStyle = "rgba(56, 178, 166, " + ((1.0 - depth) * 0.16 * weather.auroraIntensity).toFixed(2) + ")"
    for (var wx = (wy * 7) % 16; wx < w; wx += 18) {
      ctx.fillRect(wx + shift, wy, 6 + (wy % 4), 1)
    }

    ctx.fillStyle = "rgba(240, 186, 101, " + ((1.0 - depth * 0.8) * 0.24).toFixed(2) + ")"
    ctx.fillRect(81 + shift, wy, 4, 1)
    ctx.fillRect(133 + shift, wy, 4, 1)
    ctx.fillRect(238 + shift, wy, 8 - Math.floor(depth * 5), 1)
    ctx.fillRect(276 + shift, wy, 5, 1)
    ctx.fillRect(334 + shift, wy, 5, 1)
  }

  ctx.fillStyle = "rgba(140, 210, 220, 0.35)"
  for (var fx = 124; fx < w; fx += 8) {
    var fOffset = Math.round(Math.sin(t * 0.08 + fx) * 1)
    ctx.fillRect(fx + fOffset, waterY, 4, 1)
  }

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
