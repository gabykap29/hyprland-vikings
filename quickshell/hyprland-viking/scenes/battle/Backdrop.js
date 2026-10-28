.pragma library
.import "../valhalla/BackdropRenderer.js" as Valhalla
.import "../valhalla/EntityRenderer.js" as Ships
.import "Palettes.js" as Palettes

// ============================================================================
// Backdrop.js — static layer of the battle: smoky sky, beached drakkar on the
// left, the trampled field in the middle and the burning Saxon stockade on the
// right. Flames, smoke and fighters are drawn by Renderer.js on top.
// ============================================================================

function disc(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color
  for (var dy = -ry; dy <= ry; dy++) {
    var half = Math.round(rx * Math.sqrt(1 - (dy * dy) / (ry * ry + 0.0001)))
    ctx.fillRect(cx - half, cy + dy, half * 2 + 1, 1)
  }
}

function drawSea(ctx, pal) {
  ctx.fillStyle = pal.sea
  ctx.fillRect(0, 146, 118, 28)
  ctx.fillStyle = pal.seaLight
  for (var y = 148; y < 172; y += 3) {
    for (var x = (y * 7) % 11; x < 112; x += 13) ctx.fillRect(x, y, 5, 1)
  }
  ctx.fillStyle = "rgba(255, 140, 70, 0.14)"             // fire light on the water
  for (var fy = 148; fy < 172; fy += 2) ctx.fillRect(60 + ((fy * 3) % 20), fy, 28 - (fy - 148), 1)
}

function drawShip(ctx, pal) {
  Ships.drawDrakkar(ctx, 0)
  ctx.fillStyle = pal.sea                                 // keel sits in the shallows
  ctx.globalAlpha = 0.55
  ctx.fillRect(8, 157, 96, 13)
  ctx.globalAlpha = 1.0
  ctx.fillStyle = "rgba(220, 240, 248, 0.45)"
  for (var fx = 12; fx < 100; fx += 6) ctx.fillRect(fx, 160 + (fx % 2), 3, 1)
}

function drawBeachAndField(ctx, w, h, groundY, pal) {
  // Sand and shingle where the Norse landed
  ctx.fillStyle = pal.sand
  ctx.fillRect(0, 170, 124, h - 170)
  for (var y = 160; y < 170; y++) {
    var sx = 118 - Math.floor((y - 160) * 1.2)
    ctx.fillRect(sx, y, 14, 1)
  }
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)"
  for (var px = 4; px < 120; px += 7) ctx.fillRect(px, 174 + ((px * 5) % 36), 2, 1)
  ctx.fillStyle = "rgba(220, 240, 248, 0.5)"              // foam line
  for (var fx = 0; fx < 118; fx += 4) ctx.fillRect(fx, 169 + (fx % 3 === 0 ? 1 : 0), 3, 1)

  // Field
  ctx.fillStyle = pal.field
  ctx.fillRect(116, groundY, w - 116, h - groundY)
  for (var ey = groundY; ey < h; ey += 3) {
    var edge = 114 + ((ey * 5) % 9)
    ctx.fillStyle = pal.sand
    ctx.fillRect(edge - 4, ey, 6, 3)
  }
  ctx.fillStyle = pal.fieldLight
  for (var gy = groundY + 1; gy < h; gy += 4) {
    for (var gx = 120 + ((gy * 11) % 7); gx < w; gx += 7) ctx.fillRect(gx, gy, 2, 1)
  }
  ctx.fillStyle = pal.fieldLight
  ctx.fillRect(116, groundY, w - 116, 1)

  // Churned mud where the lines meet
  var mud = [
    { x: 168, y: 182, rx: 22, ry: 5 }, { x: 212, y: 190, rx: 26, ry: 6 },
    { x: 150, y: 196, rx: 16, ry: 4 }, { x: 238, y: 178, rx: 18, ry: 4 },
    { x: 192, y: 172, rx: 14, ry: 3 }, { x: 258, y: 198, rx: 20, ry: 5 }
  ]
  for (var m = 0; m < mud.length; m++) {
    disc(ctx, mud[m].x, mud[m].y, mud[m].rx, mud[m].ry, pal.mud)
    disc(ctx, mud[m].x - 2, mud[m].y - 1, mud[m].rx - 4, Math.max(1, mud[m].ry - 2), pal.mudLight)
  }
  // Puddles that mirror the burning sky
  ctx.fillStyle = "rgba(255, 150, 80, 0.20)"
  ctx.fillRect(176, 184, 10, 1)
  ctx.fillRect(220, 192, 12, 1)
  ctx.fillRect(244, 180, 8, 1)
}

function drawLitter(ctx, pal) {
  var STEEL = "#9fb3bd", WOOD = "#6a4529"
  // Fallen shields lying flat (Raven Clan navy/bone and Saxon red)
  var shields = [
    { x: 150, y: 190, a: "#141c28", b: "#cfd8dc" }, { x: 232, y: 196, a: "#9a3b2e", b: "#d9a441" },
    { x: 204, y: 178, a: "#141c28", b: "#cfd8dc" }, { x: 256, y: 186, a: "#c2872f", b: "#7a3b24" },
    { x: 134, y: 200, a: "#9a3b2e", b: "#d9a441" }
  ]
  for (var s = 0; s < shields.length; s++) {
    disc(ctx, shields[s].x, shields[s].y, 5, 2, "#0b0f14")
    disc(ctx, shields[s].x, shields[s].y, 4, 1, shields[s].b)
    ctx.fillStyle = shields[s].a
    ctx.fillRect(shields[s].x - 2, shields[s].y, 5, 1)
  }
  // Spears and arrows stuck in the ground
  var spears = [[160, 176], [188, 194], [226, 174], [246, 190], [142, 184], [272, 196]]
  for (var p = 0; p < spears.length; p++) {
    ctx.fillStyle = WOOD
    ctx.fillRect(spears[p][0], spears[p][1] - 9, 1, 10)
    ctx.fillStyle = STEEL
    ctx.fillRect(spears[p][0], spears[p][1] - 11, 1, 3)
  }
  ctx.fillStyle = WOOD
  for (var a = 0; a < 14; a++) {
    var ax = 128 + ((a * 37) % 150), ay = 174 + ((a * 13) % 26)
    ctx.fillRect(ax, ay - 4, 1, 4)
    ctx.fillStyle = "#d8d0b8"
    ctx.fillRect(ax, ay - 5, 1, 1)
    ctx.fillStyle = WOOD
  }
  // Broken axe head
  ctx.fillStyle = STEEL
  ctx.fillRect(176, 188, 3, 2)
  ctx.fillStyle = WOOD
  ctx.fillRect(179, 189, 5, 1)
}

function drawStockade(ctx, w, groundY, pal) {
  var CHAR = "rgba(0, 0, 0, 0.28)"

  // Timber hall behind the wall
  ctx.fillStyle = pal.wood
  ctx.fillRect(322, 128, 62, groundY - 128)
  for (var px = 322; px < w; px += 4) {
    ctx.fillStyle = pal.woodDark
    ctx.fillRect(px, 128, 1, groundY - 128)
  }
  ctx.fillStyle = "#0b0f14"
  ctx.fillRect(346, 142, 9, groundY - 142)
  ctx.fillStyle = "rgba(255, 150, 60, 0.35)"              // glow inside the burning door
  ctx.fillRect(348, 146, 5, groundY - 146)
  for (var r = 0; r < 26; r++) {
    var inset = Math.floor(r * 1.15)
    ctx.fillStyle = (r % 4 < 2) ? pal.thatch : pal.thatchLight
    ctx.fillRect(314 + inset, 128 - r, 80 - inset * 2, 1)
    if (r % 3 === 0) {
      ctx.fillStyle = pal.woodDark
      for (var tx = 316 + inset; tx < 392 - inset; tx += 6) ctx.fillRect(tx + (r % 2) * 3, 128 - r, 1, 1)
    }
  }
  ctx.fillStyle = pal.woodDark                            // ridge pole
  ctx.fillRect(344, 100, 22, 2)
  ctx.fillStyle = CHAR
  ctx.fillRect(330, 106, 24, 14)                          // scorched thatch

  // Watchtower
  ctx.fillStyle = pal.woodDark
  ctx.fillRect(289, 118, 3, groundY - 118)
  ctx.fillRect(304, 118, 3, groundY - 118)
  ctx.fillStyle = pal.wood
  for (var br = 0; br < 5; br++) {
    ctx.fillRect(291 + br * 3, 124 + br * 7, 3, 2)
    ctx.fillRect(303 - br * 3, 124 + br * 7, 3, 2)
  }
  ctx.fillStyle = pal.woodLight
  ctx.fillRect(285, 113, 26, 5)                           // platform
  ctx.fillStyle = pal.woodDark
  ctx.fillRect(285, 118, 26, 1)
  for (var rl = 285; rl < 311; rl += 4) ctx.fillRect(rl, 107, 2, 6)
  ctx.fillRect(285, 107, 26, 1)
  for (var rr = 0; rr < 12; rr++) {                       // pyramid roof
    ctx.fillStyle = (rr % 3 === 0) ? pal.thatchLight : pal.thatch
    ctx.fillRect(284 + rr, 107 - rr, 28 - rr * 2, 1)
  }
  ctx.fillStyle = CHAR
  ctx.fillRect(290, 96, 12, 10)

  // Palisade with a broken gate
  for (var x = 262; x < w; x += 3) {
    if (x > 266 && x < 290) continue
    var top = 134 + ((x * 7) % 6)
    ctx.fillStyle = ((x / 3) % 2 === 0) ? pal.wood : pal.woodDark
    ctx.fillRect(x, top, 2, groundY - top)
    ctx.fillStyle = pal.woodLight
    ctx.fillRect(x, top, 1, 1)
    if ((x * 13) % 5 === 0) {
      ctx.fillStyle = CHAR
      ctx.fillRect(x, top, 2, 10)
    }
  }
  ctx.fillStyle = pal.woodDark
  ctx.fillRect(262, 146, 122, 2)
  ctx.fillRect(262, 154, 122, 2)

  // Gate posts, snapped lintel and the door lying open
  ctx.fillStyle = pal.wood
  ctx.fillRect(266, 126, 4, groundY - 126)
  ctx.fillRect(288, 126, 4, groundY - 126)
  ctx.fillStyle = pal.woodLight
  ctx.fillRect(266, 126, 1, groundY - 126)
  ctx.fillRect(288, 126, 1, groundY - 126)
  ctx.fillStyle = pal.woodDark
  ctx.fillRect(266, 126, 10, 3)
  ctx.fillRect(284, 126, 8, 3)
  ctx.fillStyle = "#0b0f14"
  ctx.fillRect(270, 138, 4, groundY - 138)                // door leaning inside
  ctx.fillStyle = pal.wood
  ctx.fillRect(271, 140, 2, groundY - 140)
}

function drawForegroundShade(ctx, w, h) {
  for (var y = 200; y < h; y++) {
    ctx.fillStyle = "rgba(0, 0, 0, " + (0.04 + (y - 200) * 0.012).toFixed(3) + ")"
    ctx.fillRect(0, y, w, 1)
  }
}

function renderBackdrop(ctx, g, env) {
  var pal = Palettes.forPhase(env && env.tod)
  var w = g.pw, h = g.ph

  Valhalla.drawSky(ctx, w, pal)
  ctx.fillStyle = pal.haze                                // smoke over the horizon
  ctx.fillRect(0, 60, w, 100)
  Valhalla.drawMountains(ctx, w, g.groundY, pal, true)
  Valhalla.drawForest(ctx, w, g.groundY, pal, 126)

  drawSea(ctx, pal)
  drawShip(ctx, pal)
  drawBeachAndField(ctx, w, h, g.groundY, pal)
  drawStockade(ctx, w, g.groundY, pal)
  drawLitter(ctx, pal)
  drawForegroundShade(ctx, w, h)
}
