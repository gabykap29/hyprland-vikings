#!/usr/bin/env bash
# ============================================================================
# weather-api-sync.sh — Conector de API de Clima Real (Open-Meteo) para
# gabriel.valhalla-world (Sin necesidad de API Key)
#
# Uso:
#   ./scripts/weather-api-sync.sh [LAT] [LON] [NOMBRE_CIUDAD]
# Ejemplo:
#   ./scripts/weather-api-sync.sh -34.6037 -58.3816 "Buenos Aires · Midgard"
# ============================================================================
set -euo pipefail

LAT="${1:--34.6037}"
LON="${2:--58.3816}"
LOCATION_NAME="${3:-Midgard · Clima Real}"
WEATHER_FILE="$HOME/.config/omarchy/plugins/gabriel.valhalla-world/weather.json"

API_URL="https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,precipitation,rain,snowfall,weather_code,wind_speed_10m"

echo "🌩️  Consultando clima real desde Open-Meteo (${LAT}, ${LON})..."
RESPONSE="$(curl -fsSL "$API_URL")"

PAYLOAD="$(python3 -c '
import json, sys

raw = json.loads(sys.argv[1])
loc = sys.argv[2]
cur = raw.get("current", {})

code = int(cur.get("weather_code", 0))
temp = float(cur.get("temperature_2m", 8.0))
wind_kmh = float(cur.get("wind_speed_10m", 12.0))

# Mapeo de códigos WMO a parámetros del motor Pixel Art Valhalla
condition = "clear"
rain_intensity = 0.0
snow_intensity = 0.0
fog_density = 0.2
thunder_freq = 0.0
aurora_intensity = 0.9

if code in (95, 96, 99):
    condition = "thunderstorm"
    rain_intensity = 1.0
    fog_density = 0.65
    thunder_freq = 0.9
    aurora_intensity = 0.55
elif code in (51, 53, 55, 61, 63, 65, 80, 81, 82):
    condition = "rain"
    rain_intensity = 0.85 if code in (63, 65, 81, 82) else 0.55
    fog_density = 0.45
    thunder_freq = 0.25 if rain_intensity > 0.7 else 0.05
    aurora_intensity = 0.75
elif code in (71, 73, 75, 77, 85, 86):
    condition = "snow"
    snow_intensity = 0.9
    fog_density = 0.55
    aurora_intensity = 0.95
elif code in (45, 48):
    condition = "fog"
    fog_density = 0.85
    aurora_intensity = 0.6
elif code in (1, 2, 3):
    condition = "cloudy"
    fog_density = 0.35
    aurora_intensity = 0.8

wind_norm = max(-3.0, min(3.0, round(wind_kmh / 12.0, 2)))

out = {
    "enabled": True,
    "condition": condition,
    "rainIntensity": rain_intensity,
    "snowIntensity": snow_intensity,
    "windSpeed": wind_norm,
    "fogDensity": fog_density,
    "thunderFrequency": thunder_freq,
    "auroraIntensity": aurora_intensity,
    "temperatureC": round(temp, 1),
    "location": loc,
    "apiSource": "open-meteo"
}
print(json.dumps(out, ensure_ascii=False, indent=2))
' "$RESPONSE" "$LOCATION_NAME")"

mkdir -p "$(dirname "$WEATHER_FILE")"
printf '%s\n' "$PAYLOAD" > "$WEATHER_FILE"

if command -v omarchy-shell >/dev/null 2>&1; then
  omarchy-shell gabriel.valhalla-world setWeather "$(printf '%s' "$PAYLOAD" | tr -d '\n')" >/dev/null 2>&1 || true
fi

echo "✅ Clima sincronizado en $WEATHER_FILE:"
printf '%s\n' "$PAYLOAD"
