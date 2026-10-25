import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Wayland
import "core/WeatherController.js" as WeatherController
import "core/WorldSimulation.js" as WorldSimulation
import "render/BackdropRenderer.js" as BackdropRenderer
import "render/EntityRenderer.js" as EntityRenderer

Scope {
  id: root

  property var host: null

  // ========================================================================
  // MODULAR WEATHER STATE (Ready for External Real-Time Weather API)
  // ========================================================================
  property bool enabled: true
  property string weatherCondition: "rain"
  property real rainIntensity: 0.85
  property real snowIntensity: 0.0
  property real windSpeed: 1.25
  property real fogDensity: 0.45
  property real thunderFrequency: 0.35
  property real auroraIntensity: 0.85
  property real temperatureC: 6
  property string locationName: "Kattegat · Midgard"

  readonly property string weatherFilePath: (root.host && root.host.homePath)
    ? (root.host.homePath + "/.config/omarchy/plugins/gabriel.valhalla-world/weather.json")
    : (Quickshell.env("HOME") + "/.config/omarchy/plugins/gabriel.valhalla-world/weather.json")

  // Low-res 16-bit Pixel Grid Constants (384x216 -> 5x crisp integer scaling on 1920x1080)
  readonly property int pw: 384
  readonly property int ph: 216
  readonly property int groundY: 158
  readonly property int waterY: 168

  // Simulation State Object (managed by core/WorldSimulation.js)
  property var sim: null
  property int renderTick: 0

  function currentWeatherObject() {
    return {
      enabled: root.enabled,
      condition: root.weatherCondition,
      rainIntensity: root.rainIntensity,
      snowIntensity: root.snowIntensity,
      windSpeed: root.windSpeed,
      fogDensity: root.fogDensity,
      thunderFrequency: root.thunderFrequency,
      auroraIntensity: root.auroraIntensity,
      temperatureC: root.temperatureC,
      location: root.locationName
    }
  }

  function applyNormalizedWeather(next) {
    if (!next) return
    root.enabled = next.enabled
    root.weatherCondition = next.condition
    root.rainIntensity = next.rainIntensity
    root.snowIntensity = next.snowIntensity
    root.windSpeed = next.windSpeed
    root.fogDensity = next.fogDensity
    root.thunderFrequency = next.thunderFrequency
    root.auroraIntensity = next.auroraIntensity
    root.temperatureC = next.temperatureC
    root.locationName = next.location
  }

  function applyPreset(name) {
    var preset = WeatherController.presetFor(name)
    var next = WeatherController.parseWeatherPayload(JSON.stringify(preset), root.currentWeatherObject())
    root.applyNormalizedWeather(next)
    if (name === "storm" || name === "thunderstorm") {
      WorldSimulation.triggerLightning(root.sim)
    }
    return "Preset applied: " + preset.condition + " (" + preset.location + ")"
  }

  FileView {
    id: weatherFile
    path: root.weatherFilePath
    watchChanges: true
    onFileChanged: reload()
    onLoaded: {
      var parsed = WeatherController.parseWeatherPayload(weatherFile.text(), root.currentWeatherObject())
      root.applyNormalizedWeather(parsed)
    }
  }

  IpcHandler {
    target: "gabriel.valhalla-world"

    function setWeather(jsonPayload: string): string {
      var parsed = WeatherController.parseWeatherPayload(jsonPayload, root.currentWeatherObject())
      if (!parsed) return "Invalid JSON payload"
      root.applyNormalizedWeather(parsed)
      return "Weather updated: " + root.weatherCondition
    }

    function preset(conditionName: string): string {
      return root.applyPreset(conditionName)
    }

    function toggle(): string {
      root.enabled = !root.enabled
      return root.enabled ? "Valhalla Live World enabled" : "Valhalla Live World disabled"
    }

    function thunder(): string {
      WorldSimulation.triggerLightning(root.sim)
      return "Thor's lightning triggered!"
    }

    function status(): string {
      return JSON.stringify(root.currentWeatherObject())
    }
  }

  Component.onCompleted: {
    root.sim = WorldSimulation.createInitialState(root.pw, root.ph)
    weatherFile.reload()
  }

  Timer {
    id: simTimer
    interval: 42 // ~24 FPS authentic pixel-art animation cadence
    running: root.enabled
    repeat: true
    onTriggered: {
      WorldSimulation.stepSimulation(
        root.sim,
        root.currentWeatherObject(),
        root.pw,
        root.ph,
        root.groundY,
        root.waterY
      )
      root.renderTick = root.sim ? root.sim.tick : (root.renderTick + 1)
    }
  }

  // ========================================================================
  // WAYLAND BACKGROUND LAYER (Renders behind all Hyprland windows & HUD bar)
  // ========================================================================
  Variants {
    model: Quickshell.screens

    PanelWindow {
      id: bgWindow

      required property ShellScreen modelData
      screen: modelData
      visible: root.enabled
      color: "transparent"

      WlrLayershell.namespace: "omarchy-valhalla-world"
      WlrLayershell.layer: WlrLayer.Background
      WlrLayershell.exclusionMode: ExclusionMode.Ignore
      WlrLayershell.keyboardFocus: WlrKeyboardFocus.None

      anchors {
        top: true
        bottom: true
        left: true
        right: true
      }

      Item {
        id: pixelViewport
        anchors.fill: parent

        // Static Pixel Art Backdrop (Sky, Mountains, Forest, Pier, Mead Hall, Forge, Runestone)
        Canvas {
          id: staticBackdropCanvas
          x: 0
          y: 0
          width: root.pw
          height: root.ph
          smooth: false
          antialiasing: false

          transform: Scale {
            origin.x: 0
            origin.y: 0
            xScale: pixelViewport.width / root.pw
            yScale: pixelViewport.height / root.ph
          }

          Component.onCompleted: requestPaint()

          onPaint: {
            var ctx = getContext("2d")
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, root.pw, root.ph)
            BackdropRenderer.renderBackdrop(ctx, root.pw, root.ph, root.groundY, root.waterY)
          }
        }

        // Dynamic Pixel Art Entities & Weather Layer
        Canvas {
          id: dynamicWorldCanvas
          x: 0
          y: 0
          width: root.pw
          height: root.ph
          smooth: false
          antialiasing: false

          transform: Scale {
            origin.x: 0
            origin.y: 0
            xScale: pixelViewport.width / root.pw
            yScale: pixelViewport.height / root.ph
          }

          property int frameTrigger: root.renderTick
          onFrameTriggerChanged: requestPaint()

          onPaint: {
            var ctx = getContext("2d")
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, root.pw, root.ph)
            EntityRenderer.renderDynamicWorld(
              ctx,
              root.sim,
              root.currentWeatherObject(),
              root.pw,
              root.ph,
              root.groundY,
              root.waterY
            )
          }
        }

        // Interactive Desktop Click: Left-click on empty desktop summons Thor's Lightning
        MouseArea {
          anchors.fill: parent
          acceptedButtons: Qt.LeftButton
          onClicked: function(mouse) {
            var px = Math.floor((mouse.x / width) * root.pw)
            WorldSimulation.triggerLightning(root.sim, px)
          }
        }
      }
    }
  }
}
