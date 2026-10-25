.pragma library

// ============================================================================
// TimeOfDay.js
// Resolves the configured time-of-day mode into a concrete phase.
// ============================================================================

// hour is a fractional local hour, e.g. 18.5 = 18:30.
function phaseForHour(hour) {
  if (hour >= 5 && hour < 7.5) return "dawn"
  if (hour >= 7.5 && hour < 17.5) return "day"
  if (hour >= 17.5 && hour < 20) return "dusk"
  return "night"
}

function resolve(mode, hour) {
  if (mode === "auto") return phaseForHour(hour)
  if (mode === "dawn" || mode === "day" || mode === "dusk" || mode === "night") return mode
  return "night"
}

function currentHour(date) {
  var d = date || new Date()
  return d.getHours() + d.getMinutes() / 60
}
