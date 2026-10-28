.pragma library

// ============================================================================
// Config.js
// User settings for Hyprland Viking: defaults, validation and path helpers.
// The settings panel, the IPC handler and the ctl script all go through here,
// so a hand-edited config.json can never put the renderer in a broken state.
// ============================================================================

var SCHEMA_VERSION = 1

var DEFAULTS = {
  schemaVersion: SCHEMA_VERSION,
  enabled: true,
  scene: "valhalla",
  performance: { fps: 24 },
  frame: { enabled: true, radius: 10, width: 2, margin: 0, color: "#38b2a6", attachToBar: true },
  timeOfDay: { mode: "night" },
  weather: { mode: "manual", condition: "rain", city: "" },
  effects: {
    aurora: true,
    lightning: true,
    ravens: true,
    vikings: true,
    stars: true,
    fire: true,
    arrows: true,
    wildlife: true,
    auroraStrength: 1.0,
    precipitation: 1.0
  }
}

var FPS_CHOICES = [8, 12, 24]
var TIME_MODES = ["auto", "night", "dawn", "day", "dusk"]
var WEATHER_MODES = ["manual", "auto"]
var CONDITIONS = ["clear", "rain", "storm", "snow"]

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function oneOf(value, allowed, fallback) {
  return allowed.indexOf(value) >= 0 ? value : fallback
}

function bool(value, fallback) {
  return typeof value === "boolean" ? value : fallback
}

function int(value, min, max, fallback) {
  var n = Math.round(Number(value))
  if (isNaN(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

// Accepts "#rgb" / "#rrggbb" (case-insensitive); anything else falls back.
function hexColor(value, fallback) {
  var v = typeof value === "string" ? value.trim() : ""
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase()
  if (/^#[0-9a-fA-F]{3}$/.test(v)) return ("#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toLowerCase()
  return fallback
}

function unit(value, fallback) {
  var n = Number(value)
  if (isNaN(n)) return fallback
  return Math.max(0, Math.min(1, n))
}

// Returns a complete, valid config from any (possibly partial or garbage) input.
function normalize(raw, sceneIds) {
  var d = clone(DEFAULTS)
  var r = (raw && typeof raw === "object") ? raw : {}
  var perf = r.performance || {}
  var fr = r.frame || {}
  var tod = r.timeOfDay || {}
  var wx = r.weather || {}
  var fx = r.effects || {}
  var ids = sceneIds && sceneIds.length ? sceneIds : [d.scene]

  var city = typeof wx.city === "string" ? wx.city.replace(/[\r\n\t]+/g, " ").trim().slice(0, 80) : ""

  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: bool(r.enabled, d.enabled),
    scene: oneOf(r.scene, ids, ids[0]),
    performance: { fps: oneOf(Number(perf.fps), FPS_CHOICES, d.performance.fps) },
    frame: {
      enabled: bool(fr.enabled, d.frame.enabled),
      radius: int(fr.radius, 0, 40, d.frame.radius),
      width: int(fr.width, 0, 8, d.frame.width),
      margin: int(fr.margin, 0, 40, d.frame.margin),
      color: hexColor(fr.color, d.frame.color),
      attachToBar: bool(fr.attachToBar, d.frame.attachToBar)
    },
    timeOfDay: { mode: oneOf(tod.mode, TIME_MODES, d.timeOfDay.mode) },
    weather: {
      mode: oneOf(wx.mode, WEATHER_MODES, d.weather.mode),
      condition: oneOf(wx.condition, CONDITIONS, d.weather.condition),
      city: city
    },
    effects: {
      aurora: bool(fx.aurora, d.effects.aurora),
      lightning: bool(fx.lightning, d.effects.lightning),
      ravens: bool(fx.ravens, d.effects.ravens),
      vikings: bool(fx.vikings, d.effects.vikings),
      stars: bool(fx.stars, d.effects.stars),
      fire: bool(fx.fire, d.effects.fire),
      arrows: bool(fx.arrows, d.effects.arrows),
      wildlife: bool(fx.wildlife, d.effects.wildlife),
      auroraStrength: unit(fx.auroraStrength, d.effects.auroraStrength),
      precipitation: unit(fx.precipitation, d.effects.precipitation)
    }
  }
}

function parse(text, sceneIds) {
  var raw = null
  try { raw = JSON.parse(String(text || "")) } catch (e) { raw = null }
  return normalize(raw, sceneIds)
}

// Sets a dotted path ("effects.aurora") on a copy of cfg and re-validates it.
function withValue(cfg, path, value, sceneIds) {
  var next = clone(cfg)
  var parts = String(path).split(".")
  var node = next
  for (var i = 0; i < parts.length - 1; i++) {
    if (typeof node[parts[i]] !== "object" || node[parts[i]] === null) node[parts[i]] = {}
    node = node[parts[i]]
  }
  node[parts[parts.length - 1]] = value
  return normalize(next, sceneIds)
}

function serialize(cfg) {
  return JSON.stringify(cfg, null, 2) + "\n"
}
