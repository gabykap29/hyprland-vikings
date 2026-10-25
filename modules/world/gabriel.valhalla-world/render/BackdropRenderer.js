.pragma library

// ============================================================================
// BackdropRenderer.js
// Static 16-Bit Pixel-Art Scenery Renderer (Sky, Mountains, Forest, Mead Hall,
// Blacksmith Forge, Runestone Sanctuary, and Wooden Pier)
// ============================================================================

function renderBackdrop(ctx, w, h, groundY, waterY) {
  // 1. Night Sky Bands with Dithering
  var skyBands = [
    { y: 0,   h: 28, c: "#04080d" },
    { y: 28,  h: 28, c: "#071019" },
    { y: 56,  h: 28, c: "#0b1924" },
    { y: 84,  h: 32, c: "#102330" },
    { y: 116, h: 52, c: "#152d3b" }
  ]
  for (var sb = 0; sb < skyBands.length; sb++) {
    ctx.fillStyle = skyBands[sb].c
    ctx.fillRect(0, skyBands[sb].y, w, skyBands[sb].h)
    if (sb > 0) {
      ctx.fillStyle = skyBands[sb - 1].c
      for (var dx = (sb % 2); dx < w; dx += 2) {
        ctx.fillRect(dx, skyBands[sb].y, 1, 1)
      }
    }
  }

  // Crescent Moon
  ctx.fillStyle = "#dceef2"
  ctx.fillRect(52, 22, 10, 10)
  ctx.fillRect(50, 24, 14, 6)
  ctx.fillRect(54, 20, 6, 14)
  ctx.fillStyle = "#071019"
  ctx.fillRect(55, 21, 9, 9)

  // 2. Far Fjord Mountains
  ctx.fillStyle = "#0c1822"
  var m1 = [95,90,84,78,72,68,73,79,85,80,74,66,60,55,61,68,75,82,77,70,63,58,64,71,78,84,88,82,75,69,64,70,76,82,87,92,86,79,74,80,86,91,95,98,94,89,85,90,94]
  for (var i = 0; i < m1.length; i++) {
    var mx = i * 8
    var my = m1[i]
    ctx.fillRect(mx, my, 8, waterY - my)
    if (my < 72) {
      ctx.fillStyle = "#486878"
      ctx.fillRect(mx, my, 5, 4)
      ctx.fillRect(mx + 2, my + 4, 3, 3)
      ctx.fillStyle = "#0c1822"
    }
  }

  // Mid Fjord Cliffs
  ctx.fillStyle = "#11222e"
  for (var x2 = 0; x2 < w; x2 += 4) {
    var h2 = Math.floor(104 + Math.sin(x2 * 0.035) * 14 + Math.cos(x2 * 0.08) * 7)
    ctx.fillRect(x2, h2, 4, waterY - h2)
    ctx.fillStyle = "#1a3140"
    ctx.fillRect(x2, h2, 2, 3)
    ctx.fillStyle = "#11222e"
  }

  // Distant Pine Forest
  for (var tx = 120; tx < w; tx += 5) {
    var th = 10 + ((tx * 17) % 12)
    var ty = groundY - th
    ctx.fillStyle = (tx % 10 === 0) ? "#0a1c20" : "#071418"
    for (var tier = 0; tier < th; tier += 2) {
      var tw = 1 + Math.floor(tier * 0.45)
      ctx.fillRect(tx - Math.floor(tw / 2), ty + tier, tw, 2)
    }
  }

  // 3. Viking Settlement Shoreline & Ground
  ctx.fillStyle = "#121a1d"
  ctx.fillRect(126, groundY, w - 126, 12)
  ctx.fillStyle = "#1c282c"
  ctx.fillRect(130, groundY - 2, w - 130, 3)
  for (var gx = 132; gx < w; gx += 3) {
    ctx.fillStyle = (gx % 6 === 0) ? "#1f3b34" : "#273338"
    ctx.fillRect(gx, groundY - 1 + (gx % 2), 2, 2)
  }
  ctx.fillStyle = "#1b3b48"
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

  // 7. The Great Viking Mead Hall (Longhouse)
  ctx.fillStyle = "#253036"
  ctx.fillRect(256, 152, 104, 6)
  ctx.fillStyle = "#362316"
  ctx.fillRect(258, 128, 100, 24)
  ctx.fillStyle = "#4d3320"
  for (var wx = 258; wx <= 356; wx += 14) {
    ctx.fillRect(wx, 128, 3, 24)
  }
  for (var ry = 0; ry < 28; ry++) {
    var inset = Math.floor(ry * 0.45)
    ctx.fillStyle = (ry % 4 === 0) ? "#1c2b33" : "#152229"
    ctx.fillRect(250 + inset, 128 - ry, 116 - inset * 2, 1)
  }
  ctx.fillStyle = "#6e4c2e"
  ctx.fillRect(260, 100, 96, 2)
  ctx.fillStyle = "#f0ba65"
  // Dragon-head roof finials
  ctx.fillRect(256, 95, 4, 6)
  ctx.fillRect(253, 93, 4, 3)
  ctx.fillRect(251, 95, 2, 2)
  ctx.fillRect(356, 95, 4, 6)
  ctx.fillRect(359, 93, 4, 3)
  ctx.fillRect(363, 95, 2, 2)

  // Grand Oak Door
  ctx.fillStyle = "#21140c"
  ctx.fillRect(301, 135, 14, 23)
  ctx.fillStyle = "#5c3d26"
  ctx.fillRect(300, 134, 16, 2)
  ctx.fillStyle = "#f0ba65"
  ctx.fillRect(306, 145, 2, 2)
  ctx.fillRect(309, 145, 2, 2)

  // Glowing Windows
  ctx.fillStyle = "#f0ba65"
  ctx.fillRect(274, 138, 10, 7)
  ctx.fillRect(332, 138, 10, 7)
  ctx.fillStyle = "#ffdf9e"
  ctx.fillRect(276, 139, 6, 5)
  ctx.fillRect(334, 139, 6, 5)
  ctx.fillStyle = "#362316"
  ctx.fillRect(278, 138, 2, 7)
  ctx.fillRect(336, 138, 2, 7)

  // Raven Clan Shields on Facade
  var shieldXs = [266, 290, 324, 348]
  for (var sh = 0; sh < shieldXs.length; sh++) {
    ctx.fillStyle = (sh % 2 === 0) ? "#38b2a6" : "#d49b4b"
    ctx.fillRect(shieldXs[sh], 130, 5, 5)
    ctx.fillStyle = "#f0ba65"
    ctx.fillRect(shieldXs[sh] + 2, 132, 1, 1)
  }

  // Campfire Stone Ring
  ctx.fillStyle = "#38464d"
  ctx.fillRect(236, 157, 12, 3)
  ctx.fillStyle = "#52646e"
  ctx.fillRect(237, 158, 3, 2)
  ctx.fillRect(244, 158, 3, 2)
}
