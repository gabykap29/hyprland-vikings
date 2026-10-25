.pragma library
.import "Palettes.js" as Palettes

// ============================================================================
// BackdropRenderer.js
// Static 16-Bit Pixel-Art Scenery Renderer (Sky, Mountains, Forest, Mead Hall,
// Blacksmith Forge, Runestone Sanctuary, and Wooden Pier)
// ============================================================================

// Shared sky layer: gradient, Milky Way, sun/moon, clouds and horizon glow.
function drawSky(ctx, w, pal) {
  // 1. Night sky: indigo-to-teal gradient, ordered dithering between bands
  var skyYs = [0, 22, 44, 66, 86, 104, 122, 140]
  var skyBands = skyYs.map(function(y, i) { return { y: y, c: pal.sky[i] } })
  for (var sb = 0; sb < skyBands.length; sb++) {
    var bandEnd = (sb + 1 < skyBands.length) ? skyBands[sb + 1].y : 168
    ctx.fillStyle = skyBands[sb].c
    ctx.fillRect(0, skyBands[sb].y, w, bandEnd - skyBands[sb].y)
    if (sb > 0) {
      ctx.fillStyle = skyBands[sb - 1].c
      for (var dx = 0; dx < w; dx += 2) ctx.fillRect(dx + (sb % 2), skyBands[sb].y, 1, 1)
      for (var dx2 = 0; dx2 < w; dx2 += 4) ctx.fillRect(dx2 + 2, skyBands[sb].y + 1, 1, 1)
      ctx.fillStyle = skyBands[sb].c
      for (var dx3 = 0; dx3 < w; dx3 += 4) ctx.fillRect(dx3, skyBands[sb].y - 1, 1, 1)
    }
  }

  // Milky Way: faint diagonal dust of stars
  for (var mw = 0; pal.milkyWay && mw < 170; mw++) {
    var mwx = (mw * 53) % w
    var mwy = Math.floor(96 - mwx * 0.22 + (((mw * 37) % 29) - 14))
    if (mwy < 4 || mwy > 120) continue
    ctx.fillStyle = "rgba(190, 220, 235, " + (0.08 + ((mw * 13) % 5) * 0.035).toFixed(2) + ")"
    ctx.fillRect(mwx, mwy, 1, 1)
  }

  if (pal.celestial === "sun") {
    var SX = pal.celX, SY = pal.celY
    for (var gy = -20; gy <= 20; gy++) {
      for (var gx = -20; gx <= 20; gx++) {
        var gd = Math.sqrt(gx * gx + gy * gy)
        if (gd > 6 && gd < 20 && ((gx + gy) & 1) === 0) {
          ctx.fillStyle = "rgba(" + pal.celGlow + ", " + (gd < 10 ? "0.20" : (gd < 15 ? "0.10" : "0.05")) + ")"
          ctx.fillRect(SX + gx, SY + gy, 1, 1)
        }
      }
    }
    for (var uy = -6; uy <= 6; uy++) {
      for (var ux = -6; ux <= 6; ux++) {
        var ud = ux * ux + uy * uy
        if (ud <= 36) {
          ctx.fillStyle = ud <= 16 ? pal.sunCore : pal.sunEdge
          ctx.fillRect(SX + ux, SY + uy, 1, 1)
        }
      }
    }
  } else {
  // Crescent moon with halo, craters and rim light
  var MX = 57, MY = 28
  for (var hy = -22; hy <= 22; hy++) {
    for (var hx = -22; hx <= 22; hx++) {
      var hd = Math.sqrt(hx * hx + hy * hy)
      if (hd > 10.5 && hd < 21 && ((hx + hy) & 1) === 0) {
        ctx.fillStyle = "rgba(160, 210, 225, " + (hd < 14 ? "0.10" : (hd < 18 ? "0.055" : "0.025")) + ")"
        ctx.fillRect(MX + hx, MY + hy, 1, 1)
      }
    }
  }
  for (var my2 = -10; my2 <= 10; my2++) {
    for (var mx2 = -10; mx2 <= 10; mx2++) {
      var inMoon = (mx2 * mx2 + my2 * my2) <= 100
      var inBite = ((mx2 - 5) * (mx2 - 5) + (my2 + 2) * (my2 + 2)) <= 72
      if (inMoon && !inBite) {
        ctx.fillStyle = (mx2 + my2 < -6) ? "#f2fbfd" : ((mx2 < -6) ? "#a9c6d1" : "#dceef2")
        ctx.fillRect(MX + mx2, MY + my2, 1, 1)
      }
    }
  }
  ctx.fillStyle = "#9db9c4"
  ctx.fillRect(MX - 6, MY + 1, 2, 2)
  ctx.fillRect(MX - 4, MY + 5, 3, 2)
  ctx.fillRect(MX - 8, MY - 3, 1, 2)

  }

  // Drifting cloud banks, rim-lit by the moon
  var clouds = [
    { x: 6,   y: 52,  w: 54 }, { x: 96,  y: 38, w: 70 }, { x: 188, y: 60, w: 64 },
    { x: 250, y: 30,  w: 58 }, { x: 318, y: 66, w: 76 }, { x: 40,  y: 88, w: 46 },
    { x: 150, y: 96,  w: 52 }, { x: 288, y: 100, w: 40 }
  ]
  for (var ci = 0; ci < clouds.length; ci++) {
    var cl = clouds[ci]
    ctx.fillStyle = pal.cloud.body
    ctx.fillRect(cl.x + 8, cl.y, cl.w - 16, 2)
    ctx.fillRect(cl.x + 2, cl.y + 2, cl.w - 4, 3)
    ctx.fillRect(cl.x + 10, cl.y + 5, cl.w - 22, 2)
    ctx.fillStyle = pal.cloud.rim
    ctx.fillRect(cl.x + 8, cl.y, cl.w - 16, 1)
    ctx.fillRect(cl.x + 2, cl.y + 2, 6, 1)
    ctx.fillStyle = pal.cloud.under
    ctx.fillRect(cl.x + 12, cl.y + 6, cl.w - 26, 1)
  }

  // Cold horizon glow
  for (var gl = 0; gl < 28; gl++) {
    ctx.fillStyle = "rgba(" + pal.glowRGB + ", " + (0.003 * gl * pal.glowScale).toFixed(3) + ")"
    ctx.fillRect(0, 118 + gl * 2, w, 2)
  }
}

// Distant ridge line and (optionally) the mid cliffs, filled down to `baseY`.
function drawMountains(ctx, w, baseY, pal, withCliffs) {
  // 2. Far Fjord Mountains
  ctx.fillStyle = pal.mountainFar
  var m1 = [95,90,84,78,72,68,73,79,85,80,74,66,60,55,61,68,75,82,77,70,63,58,64,71,78,84,88,82,75,69,64,70,76,82,87,92,86,79,74,80,86,91,95,98,94,89,85,90,94]
  for (var i = 0; i < m1.length; i++) {
    var mx = i * 8
    var my = m1[i]
    ctx.fillRect(mx, my, 8, baseY - my)
    if (my < 72) {
      ctx.fillStyle = pal.snow
      ctx.fillRect(mx, my, 5, 4)
      ctx.fillRect(mx + 2, my + 4, 3, 3)
      ctx.fillStyle = pal.mountainFar
    }
  }

  if (!withCliffs) return
  // Mid Fjord Cliffs
  ctx.fillStyle = pal.mountainMid
  for (var x2 = 0; x2 < w; x2 += 4) {
    var h2 = Math.floor(104 + Math.sin(x2 * 0.035) * 14 + Math.cos(x2 * 0.08) * 7)
    ctx.fillRect(x2, h2, 4, baseY - h2)
    ctx.fillStyle = pal.midTop
    ctx.fillRect(x2, h2, 2, 3)
    ctx.fillStyle = pal.mountainMid
  }
}

// Pine silhouettes standing on `groundY`, starting at x = fromX.
function drawForest(ctx, w, groundY, pal, fromX) {
  // Distant Pine Forest
  for (var tx = fromX; tx < w; tx += 5) {
    var th = 10 + ((tx * 17) % 12)
    var ty = groundY - th
    ctx.fillStyle = (tx % 10 === 0) ? pal.forestA : pal.forestB
    for (var tier = 0; tier < th; tier += 2) {
      var tw = 1 + Math.floor(tier * 0.45)
      ctx.fillRect(tx - Math.floor(tw / 2), ty + tier, tw, 2)
    }
  }
}

function renderBackdrop(ctx, w, h, groundY, waterY, env) {
  var pal = Palettes.forPhase(env && env.tod)
  drawSky(ctx, w, pal)
  drawMountains(ctx, w, waterY, pal, true)
  drawForest(ctx, w, groundY, pal, 120)

  // 3. Viking Settlement Shoreline & Ground
  ctx.fillStyle = pal.ground
  ctx.fillRect(126, groundY, w - 126, 12)
  ctx.fillStyle = pal.groundTop
  ctx.fillRect(130, groundY - 2, w - 130, 3)
  for (var gx = 132; gx < w; gx += 3) {
    ctx.fillStyle = (gx % 6 === 0) ? pal.tuftA : pal.tuftB
    ctx.fillRect(gx, groundY - 1 + (gx % 2), 2, 2)
  }
  ctx.fillStyle = pal.puddle
  ctx.fillRect(172, groundY + 3, 14, 2)
  ctx.fillRect(222, groundY + 4, 18, 2)
  ctx.fillRect(276, groundY + 3, 16, 2)

  // 4. Wooden Pier / Dock
  ctx.fillStyle = "#2b1d14"
  for (var px = 80; px <= 132; px += 12) {
    ctx.fillRect(px, 156, 3, 15)
  }
  ctx.fillStyle = "#473121"
  ctx.fillRect(76, 155, 60, 3)
  ctx.fillStyle = "#5e412c"
  for (var pk = 78; pk < 134; pk += 4) {
    ctx.fillRect(pk, 155, 2, 1)
  }

  // 5. Ancient Carved Runestone
  ctx.fillStyle = "#1f2b30"
  ctx.fillRect(144, 153, 22, 5)
  ctx.fillStyle = "#2b3a42"
  ctx.fillRect(149, 125, 12, 29)
  ctx.fillRect(151, 122, 8, 3)
  ctx.fillStyle = "#3d525c"
  ctx.fillRect(149, 125, 2, 28)
  ctx.fillStyle = "#236b66"
  ctx.fillRect(151, 127, 8, 1)
  ctx.fillRect(151, 150, 8, 1)

  // 6. Blacksmith Forge & Anvil
  ctx.fillStyle = "#263036"
  ctx.fillRect(186, 136, 14, 22)
  ctx.fillRect(190, 125, 7, 12)
  ctx.fillStyle = "#141a1d"
  ctx.fillRect(189, 145, 8, 8)
  ctx.fillStyle = "#3b281b"
  ctx.fillRect(184, 134, 40, 3)
  ctx.fillRect(220, 137, 2, 21)
  ctx.fillStyle = "#523826"
  ctx.fillRect(182, 132, 44, 2)
  ctx.fillStyle = "#4a5861"
  ctx.fillRect(205, 152, 6, 6)
  ctx.fillStyle = "#738691"
  ctx.fillRect(203, 150, 10, 2)

  // 7. The Great Hall (Langhús / Mead Hall) of the Raven Clan
  function mirror(x, w) { return 616 - x - w }                      // hall axis is x = 308
  function R(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h) }
  function RM(x, y, w, h, c) { R(x, y, w, h, c); R(mirror(x, w), y, w, h, c) }

  // Stone foundation
  R(254, 152, 108, 6, "#222d33")
  for (var fx = 254; fx < 362; fx += 6) {
    R(fx, 152 + ((fx / 6) % 2), 5, 2, "#33434b")
    R(fx + 2, 155, 4, 2, "#2b393f")
  }

  // Log walls
  R(258, 128, 100, 24, "#35221a")
  for (var lx = 258; lx < 358; lx += 2) R(lx, 128, 1, 24, "#2b1a12")
  for (var ly = 131; ly < 152; ly += 5) R(258, ly, 100, 1, "#24160f")
  // Timber frame posts with highlight
  for (var wx = 258; wx <= 356; wx += 14) {
    R(wx, 128, 3, 24, "#5a3b24")
    R(wx, 128, 1, 24, "#7a5233")
    R(wx + 2, 128, 1, 24, "#3b2616")
  }

  // Roof: night-blue shingles with scale pattern
  for (var ry = 0; ry < 28; ry++) {
    var inset = Math.floor(ry * 0.45)
    var rx = 250 + inset, rw = 116 - inset * 2
    R(rx, 128 - ry, rw, 1, (ry % 4 < 2) ? "#1c2b33" : "#152229")
    for (var sx = rx + ((ry % 2) * 3); sx < rx + rw; sx += 6) R(sx, 128 - ry, 2, 1, "#2b4350")
    R(rx, 128 - ry, 1, 1, "#3a5a69")                                // lit left rake
    R(rx + rw - 1, 128 - ry, 1, 1, "#0d171c")
  }
  // Eave overhang, shadow on walls
  R(247, 128, 122, 3, "#2a1b11")
  R(247, 128, 122, 1, "#5a3b24")
  R(258, 131, 100, 3, "rgba(0, 0, 0, 0.38)")

  // Ridge beam + crossed gable ends
  R(260, 99, 96, 3, "#6e4c2e")
  R(260, 99, 96, 1, "#8a6540")
  for (var rb = 266; rb < 352; rb += 10) R(rb, 101, 2, 1, "#3b2616")

  // Glowing smoke-hole louver
  R(302, 106, 12, 6, "#2a1b11")
  R(303, 107, 10, 4, "#f0ba65")
  R(303, 109, 10, 1, "#c4812f")
  R(304, 107, 1, 4, "#2a1b11")
  R(308, 107, 1, 4, "#2a1b11")
  R(312, 107, 1, 4, "#2a1b11")

  // Carved dragon-head finials (bronze), mirrored
  RM(256, 95, 4, 7, "#b88236")                                     // neck post
  RM(256, 95, 1, 7, "#d9a655")
  RM(252, 91, 6, 4, "#c9923f")                                     // head
  RM(248, 92, 5, 2, "#d9a655")                                     // snout
  RM(248, 94, 4, 1, "#efe4cc")                                     // teeth
  RM(253, 92, 1, 1, "#0d171c")                                     // eye
  RM(256, 88, 1, 4, "#c9923f")                                     // horn
  RM(257, 87, 2, 1, "#c9923f")

  // Grand arched oak door with iron bands and stone steps
  R(299, 156, 18, 2, "#33434b")
  R(297, 158, 22, 1, "#2b393f")
  R(298, 133, 20, 25, "#4a3020")                                   // frame
  R(300, 135, 16, 23, "#1b110a")
  R(301, 134, 14, 1, "#1b110a")
  R(302, 133, 12, 1, "#1b110a")
  for (var dp = 301; dp < 315; dp += 3) R(dp, 136, 1, 22, "#2a1a0f")
  R(300, 140, 16, 1, "#5f6e76")
  R(300, 149, 16, 1, "#5f6e76")
  R(306, 144, 4, 4, "#f0ba65")                                     // ring knocker
  R(307, 145, 2, 2, "#1b110a")
  R(300, 131, 16, 2, "#3b2616")                                    // lintel
  R(303, 131, 1, 1, "#4ecdc4")
  R(306, 131, 1, 1, "#4ecdc4")
  R(309, 131, 1, 1, "#4ecdc4")
  R(312, 131, 1, 1, "#4ecdc4")

  // Windows with shutters and warm glow
  RM(270, 135, 18, 14, "rgba(240, 186, 101, 0.10)")
  RM(272, 137, 14, 10, "#2a1a0f")                                  // frame
  RM(274, 138, 10, 8, "#f0ba65")
  RM(276, 139, 6, 6, "#ffdf9e")
  RM(278, 138, 2, 8, "#2a1a0f")
  RM(274, 141, 10, 1, "#2a1a0f")
  RM(270, 137, 2, 10, "#1b110a")                                   // shutters
  RM(286, 137, 2, 10, "#1b110a")

  // Raven Clan banners flanking the door
  var banners = [287, 323]
  for (var bn = 0; bn < banners.length; bn++) {
    var bx = banners[bn]
    R(bx - 1, 131, 9, 1, "#5a3b24")                                // rod
    R(bx, 132, 7, 15, "#10161f")                                   // cloth
    R(bx, 132, 1, 15, "#1d2a38")
    R(bx, 132, 7, 1, "#aebcc4")
    R(bx, 146, 3, 2, "#10161f")                                    // swallowtail
    R(bx + 4, 146, 3, 2, "#10161f")
    R(bx + 3, 146, 1, 1, "#0a0e14")
    R(bx, 147, 3, 1, "#4ecdc4")
    R(bx + 4, 147, 3, 1, "#4ecdc4")
    // mini raven
    R(bx + 1, 135, 1, 1, "#eef3f4"); R(bx + 5, 135, 1, 1, "#eef3f4")
    R(bx + 1, 136, 5, 1, "#eef3f4")
    R(bx + 2, 137, 3, 2, "#eef3f4")
    R(bx + 3, 137, 1, 1, "#4ecdc4")
    R(bx + 3, 139, 1, 1, "#f0ba65")
    R(bx + 2, 140, 3, 2, "#9fb0b9")
  }

  // Shield row under the eaves
  var shieldXs = [263, 269, 345, 351]
  var shieldCs = ["#38b2a6", "#8f2a24", "#d49b4b", "#2f6f9b"]
  for (var sh = 0; sh < shieldXs.length; sh++) {
    R(shieldXs[sh], 130, 5, 5, shieldCs[sh])
    R(shieldXs[sh], 130, 5, 1, "rgba(255, 255, 255, 0.25)")
    R(shieldXs[sh] + 2, 132, 1, 1, "#e8e8e0")
  }

  // Wall braziers beside the door
  RM(295, 150, 2, 7, "#2a1a0f")
  RM(294, 148, 4, 2, "#5a6870")
  RM(295, 146, 2, 2, "#e67e22")
  RM(295, 145, 2, 1, "#ffdf80")

  // Campfire Stone Ring
  ctx.fillStyle = "#38464d"
  ctx.fillRect(236, 157, 12, 3)
  ctx.fillStyle = "#52646e"
  ctx.fillRect(237, 158, 3, 2)
  ctx.fillRect(244, 158, 3, 2)
}
