.pragma library
.import "../valhalla/BackdropRenderer.js" as Valhalla
.import "../valhalla/Palettes.js" as Palettes

// ============================================================================
// Backdrop.js — static layer of the voyage: sky, the far coast on the horizon
// and the sea's depth gradient. Waves, ship and creatures are dynamic.
// ============================================================================

function renderBackdrop(ctx, g, env) {
  var pal = Palettes.forPhase(env && env.tod)
  var w = g.pw, h = g.ph, hz = g.waterY

  Valhalla.drawSky(ctx, w, pal)
  Valhalla.drawMountains(ctx, w, hz, pal, false)

  // Sea: depth gradient with dithered band edges
  var bands = pal.water
  var bandH = Math.ceil((h - hz) / bands.length)
  for (var b = 0; b < bands.length; b++) {
    ctx.fillStyle = bands[b]
    ctx.fillRect(0, hz + b * bandH, w, bandH)
    if (b > 0) {
      ctx.fillStyle = bands[b - 1]
      for (var dx = b % 2; dx < w; dx += 4) ctx.fillRect(dx, hz + b * bandH, 2, 1)
    }
  }
  // Haze where sea and sky meet, and a bright horizon line
  for (var y = 0; y < 14; y++) {
    ctx.fillStyle = "rgba(" + pal.glowRGB + ", " + (0.10 - y * 0.007).toFixed(3) + ")"
    ctx.fillRect(0, hz + y, w, 1)
  }
  ctx.fillStyle = "rgba(" + pal.celGlow + ", 0.22)"
  ctx.fillRect(0, hz, w, 1)
}
