.pragma library

// ============================================================================
// WeatherController.js
// Normalized Weather State & API Adapter for Valhalla Pixel World
// Ready to consume local presets or external Weather APIs (Open-Meteo, etc.)
// ============================================================================

var PRESETS = {
  "rain": {
    condition: "rain",
    rainIntensity: 0.85,
    snowIntensity: 0.0,
    windSpeed: 1.25,
    fogDensity: 0.45,
    thunderFrequency: 0.35,
    auroraIntensity: 0.85,
    temperatureC: 6,
    location: "Kattegat · Lluvia Nórdica"
  },
  "storm": {
    condition: "thunderstorm",
    rainIntensity: 1.0,
    snowIntensity: 0.0,
    windSpeed: 2.1,
    fogDensity: 0.65,
    thunderFrequency: 0.9,
    auroraIntensity: 0.6,
    temperatureC: 4,
    location: "Midgard · Tormenta de Thor"
  },
  "thunderstorm": {
    condition: "thunderstorm",
    rainIntensity: 1.0,
    snowIntensity: 0.0,
    windSpeed: 2.1,
    fogDensity: 0.65,
    thunderFrequency: 0.9,
    auroraIntensity: 0.6,
    temperatureC: 4,
    location: "Midgard · Tormenta de Thor"
  },
  "snow": {
    condition: "snow",
    rainIntensity: 0.0,
    snowIntensity: 0.9,
    windSpeed: 0.8,
    fogDensity: 0.55,
    thunderFrequency: 0.0,
    auroraIntensity: 0.95,
    temperatureC: -5,
    location: "Jotunheim · Ventisca"
  },
  "clear": {
    condition: "clear",
    rainIntensity: 0.0,
    snowIntensity: 0.0,
    windSpeed: 0.35,
    fogDensity: 0.15,
    thunderFrequency: 0.0,
    auroraIntensity: 1.0,
    temperatureC: 9,
    location: "Asgard · Noche de Aurora"
  }
}

function clamp(val, minVal, maxVal) {
  var n = Number(val)
  if (isNaN(n)) return minVal
  return Math.max(minVal, Math.min(maxVal, n))
}

function parseWeatherPayload(rawText, currentState) {
  var txt = String(rawText || "").trim()
  if (!txt) return null
  var data
  try {
    data = JSON.parse(txt)
  } catch (e) {
    return null
  }
  if (typeof data !== "object" || data === null) return null

  var next = {
    enabled: currentState ? currentState.enabled : true,
    condition: currentState ? currentState.condition : "rain",
    rainIntensity: currentState ? currentState.rainIntensity : 0.85,
    snowIntensity: currentState ? currentState.snowIntensity : 0.0,
    windSpeed: currentState ? currentState.windSpeed : 1.25,
    fogDensity: currentState ? currentState.fogDensity : 0.45,
    thunderFrequency: currentState ? currentState.thunderFrequency : 0.35,
    auroraIntensity: currentState ? currentState.auroraIntensity : 0.85,
    temperatureC: currentState ? currentState.temperatureC : 6,
    location: currentState ? currentState.location : "Kattegat · Midgard"
  }

  if (data.enabled !== undefined) next.enabled = Boolean(data.enabled)
  if (data.condition) next.condition = String(data.condition)
  if (data.rainIntensity !== undefined) next.rainIntensity = clamp(data.rainIntensity, 0, 1)
  if (data.snowIntensity !== undefined) next.snowIntensity = clamp(data.snowIntensity, 0, 1)
  if (data.windSpeed !== undefined) next.windSpeed = clamp(data.windSpeed, -3, 3)
  if (data.fogDensity !== undefined) next.fogDensity = clamp(data.fogDensity, 0, 1)
  if (data.thunderFrequency !== undefined) next.thunderFrequency = clamp(data.thunderFrequency, 0, 1)
  if (data.auroraIntensity !== undefined) next.auroraIntensity = clamp(data.auroraIntensity, 0, 1)
  if (data.temperatureC !== undefined) next.temperatureC = Number(data.temperatureC)
  if (data.location) next.location = String(data.location)

  return next
}

function presetFor(conditionName) {
  var key = String(conditionName || "rain").toLowerCase()
  return PRESETS[key] || PRESETS["rain"]
}
