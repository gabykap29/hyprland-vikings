import QtQuick
import Quickshell
import Quickshell.Io
import Quickshell.Hyprland
import Quickshell.Wayland
import "config/Config.js" as Config
import "core/WeatherController.js" as WeatherController
import "core/TimeOfDay.js" as TimeOfDay
import "scenes/Registry.js" as Registry
import "ui"

Scope {
  id: root

  property var host: null

  // ========================================================================
  // USER SETTINGS (~/.config/hyprland-viking/config.json, edited by the panel)
  // ========================================================================
  readonly property string homePath: (root.host && root.host.homePath) ? root.host.homePath : Quickshell.env("HOME")
  readonly property string configDir: root.homePath + "/.config/hyprland-viking"

  property bool ready: false
  property var cfg: Config.normalize(null, Registry.ids())
  property bool settingsOpen: false
  property var panelScreen: null

  readonly property var scene: Registry.get(root.cfg.scene)
  readonly property var geometry: root.scene.geometry
  readonly property int pw: root.geometry.pw
  readonly property int ph: root.geometry.ph

  property real hourNow: TimeOfDay.currentHour()
  readonly property string tod: root.scene.supports.timeOfDay
    ? TimeOfDay.resolve(root.cfg.timeOfDay.mode, root.hourNow)
    : "night"
  readonly property var env: ({ tod: root.tod, effects: root.cfg.effects })
  readonly property bool enabled: root.cfg.enabled

  // ========================================================================
  // WEATHER STATE (base values; effects/intensity are applied on top)
  // ========================================================================
  property string weatherCondition: "rain"
  property real rainIntensity: 0.85
  property real snowIntensity: 0.0
  property real windSpeed: 1.25
  property real fogDensity: 0.45
  property real thunderFrequency: 0.35
  property real auroraIntensity: 0.85
  property real temperatureC: 6
  property string locationName: "Kattegat · Midgard"

  property var sim: null
  property int renderTick: 0
  property string simSceneId: ""
  property string appliedWeatherKey: ""

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

  // What the scene actually sees: base weather scaled by the user's effect settings.
  function effectiveWeather() {
    var w = root.currentWeatherObject()
    var fx = root.cfg.effects
    w.rainIntensity *= fx.precipitation
    w.snowIntensity *= fx.precipitation
    w.auroraIntensity = fx.aurora ? w.auroraIntensity * fx.auroraStrength : 0
    w.thunderFrequency = fx.lightning ? w.thunderFrequency : 0
    return w
  }

  function applyNormalizedWeather(next) {
    if (!next) return
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

  function cityLabel(fallback) {
    return root.cfg.weather.city.length > 0 ? root.cfg.weather.city : fallback
  }

  // Manual mode: the chosen condition drives the world. Auto mode: weather.json does.
  function syncWeatherFromConfig() {
    var w = root.cfg.weather
    if (w.mode !== "manual") {
      weatherFile.reload()
      root.appliedWeatherKey = ""
      return
    }
    var key = "manual:" + w.condition
    var preset = WeatherController.presetFor(w.condition)
    var next = WeatherController.parseWeatherPayload(JSON.stringify(preset), root.currentWeatherObject())
    next.location = root.cityLabel(preset.location)
    root.applyNormalizedWeather(next)
    if (key !== root.appliedWeatherKey && root.appliedWeatherKey !== "" && w.condition === "storm") {
      Registry.get(root.cfg.scene).lightning(root.sim)
    }
    root.appliedWeatherKey = key
  }

  function syncScene() {
    // Reads cfg directly: this can run before the `scene` binding is evaluated.
    var sc = Registry.get(root.cfg.scene)
    if (root.simSceneId === sc.id && root.sim) return
    root.sim = sc.createState(sc.geometry.pw, sc.geometry.ph)
    root.simSceneId = sc.id
  }

  // ---- Config plumbing ----------------------------------------------------
  function persist() {
    if (!root.ready) return
    configFile.setText(Config.serialize(root.cfg))
  }

  function adopt(next) {
    if (JSON.stringify(next) === JSON.stringify(root.cfg)) return
    root.cfg = next
  }

  function setConfig(path, value) {
    var next = Config.withValue(root.cfg, path, value, Registry.ids())
    if (JSON.stringify(next) === JSON.stringify(root.cfg)) return false
    root.cfg = next
    root.persist()
    return true
  }

  onCfgChanged: {
    root.syncScene()
    root.syncWeatherFromConfig()
  }

  function focusedScreen() {
    var mon = Hyprland.focusedMonitor
    var name = mon ? mon.name : ""
    for (var i = 0; i < Quickshell.screens.length; i++) {
      if (Quickshell.screens[i].name === name) return Quickshell.screens[i]
    }
    return Quickshell.screens.length ? Quickshell.screens[0] : null
  }

  function openSettings() {
    root.panelScreen = root.focusedScreen()
    root.settingsOpen = true
  }

  Process {
    id: mkdirConfig
    command: ["mkdir", "-p", root.configDir]
    running: true
    onExited: root.ready = true
  }

  FileView {
    id: configFile
    path: root.ready ? (root.configDir + "/config.json") : ""
    watchChanges: true
    onFileChanged: reload()
    onLoaded: root.adopt(Config.parse(configFile.text(), Registry.ids()))
    onLoadFailed: root.persist()    // first run: write the defaults
  }

  FileView {
    id: weatherFile
    path: root.ready ? (root.configDir + "/weather.json") : ""
    printErrors: false      // optional drop-box for an external weather provider
    watchChanges: true
    onFileChanged: reload()
    onLoaded: {
      if (root.cfg.weather.mode !== "auto") return
      var parsed = WeatherController.parseWeatherPayload(weatherFile.text(), root.currentWeatherObject())
      if (parsed && root.cfg.weather.city.length > 0) parsed.location = root.cfg.weather.city
      root.applyNormalizedWeather(parsed)
    }
  }

  IpcHandler {
    target: "gabriel.hyprland-viking"

    function preset(conditionName: string): string {
      var key = String(conditionName).toLowerCase()
      if (key === "thunderstorm") key = "storm"
      if (Config.CONDITIONS.indexOf(key) < 0) return "Unknown condition: " + conditionName
      root.setConfig("weather.mode", "manual")
      root.setConfig("weather.condition", key)
      return "Preset applied: " + key
    }

    function setWeather(jsonPayload: string): string {
      if (root.cfg.weather.mode !== "auto") return "Ignored: weather mode is manual (use setWeatherMode auto)"
      var parsed = WeatherController.parseWeatherPayload(jsonPayload, root.currentWeatherObject())
      if (!parsed) return "Invalid JSON payload"
      root.applyNormalizedWeather(parsed)
      return "Weather updated: " + root.weatherCondition
    }

    function setWeatherMode(mode: string): string {
      return root.setConfig("weather.mode", mode) ? "Weather mode: " + mode : "Unchanged"
    }

    function setCity(name: string): string {
      root.setConfig("weather.city", name)
      return "City: " + root.cfg.weather.city
    }

    function setScene(id: string): string {
      root.setConfig("scene", id)
      return "Scene: " + root.cfg.scene
    }

    function setTimeOfDay(mode: string): string {
      root.setConfig("timeOfDay.mode", mode)
      return "Time of day: " + root.cfg.timeOfDay.mode + " (" + root.tod + ")"
    }

    function toggle(): string {
      root.setConfig("enabled", !root.cfg.enabled)
      return root.cfg.enabled ? "Hyprland Viking enabled" : "Hyprland Viking disabled"
    }

    function thunder(): string {
      root.scene.lightning(root.sim)
      return "Thor's lightning triggered!"
    }

    function openSettings(): string {
      root.openSettings()
      return "Settings opened"
    }

    function closeSettings(): string {
      root.settingsOpen = false
      return "Settings closed"
    }

    function toggleSettings(): string {
      if (root.settingsOpen) root.settingsOpen = false
      else root.openSettings()
      return root.settingsOpen ? "Settings opened" : "Settings closed"
    }

    function status(): string {
      return JSON.stringify({ config: root.cfg, phase: root.tod, weather: root.currentWeatherObject() })
    }
  }

  Component.onCompleted: {
    root.syncScene()
    root.syncWeatherFromConfig()
  }

  Timer {
    interval: 30000
    running: true
    repeat: true
    onTriggered: root.hourNow = TimeOfDay.currentHour()
  }

  // Simulation always advances at 24 ticks/s; lower fps just batches the ticks.
  Timer {
    id: simTimer
    interval: Math.round(1000 / root.cfg.performance.fps)
    running: root.enabled
    repeat: true
    onTriggered: {
      var steps = Math.max(1, Math.round(24 / root.cfg.performance.fps))
      var weather = root.effectiveWeather()
      for (var i = 0; i < steps; i++) root.scene.step(root.sim, weather, root.geometry, root.env)
      root.renderTick = root.sim ? root.sim.tick : (root.renderTick + steps)
    }
  }

  // ========================================================================
  // SETTINGS PANEL
  // ========================================================================
  SettingsPanel {
    id: settingsPanel
    screen: root.panelScreen
    open: root.settingsOpen && root.panelScreen !== null
    config: root.cfg
    scenes: Registry.summaries()
    timeNow: root.tod
    weatherSummary: root.weatherCondition + " · " + Math.round(root.temperatureC) + "°C · " + root.locationName
    onChangeRequested: function(path, value) { root.setConfig(path, value) }
    onCloseRequested: root.settingsOpen = false
  }

  // ========================================================================
  // WAYLAND BACKGROUND LAYER (Bottom layer: above other wallpapers so it gets the pointer, below windows & HUD bar)
  // ========================================================================
  Variants {
    model: Quickshell.screens

    PanelWindow {
      id: bgWindow

      required property ShellScreen modelData
      screen: modelData
      visible: root.enabled
      color: "transparent"

      WlrLayershell.namespace: "hyprland-viking-world"
      WlrLayershell.layer: WlrLayer.Bottom
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

        // Static backdrop: repainted only when the scene or the time of day changes.
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

          property string paintKey: root.scene.id + ":" + root.tod
          onPaintKeyChanged: requestPaint()
          Component.onCompleted: requestPaint()

          onPaint: {
            var ctx = getContext("2d")
            ctx.imageSmoothingEnabled = false
            ctx.clearRect(0, 0, root.pw, root.ph)
            root.scene.renderBackdrop(ctx, root.geometry, root.env)
          }
        }

        // Dynamic entities & weather layer
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
            root.scene.renderDynamic(ctx, root.sim, root.effectiveWeather(), root.geometry, root.env)
          }
        }

        // Pointer: drag a character (scene.grab/drag/release), or left-click on the
        // empty desktop to summon Thor's lightning (if enabled)
        MouseArea {
          id: pointer
          anchors.fill: parent
          acceptedButtons: Qt.LeftButton
          hoverEnabled: true

          property bool carrying: false
          property bool grabbed: false      // this press picked someone up, so it is not a lightning click
          property bool overCharacter: false
          readonly property bool interactive: typeof root.scene.grab === "function"

          cursorShape: carrying ? Qt.ClosedHandCursor : (overCharacter ? Qt.OpenHandCursor : Qt.ArrowCursor)

          function worldX(mouse) { return (mouse.x / width) * root.pw }
          function worldY(mouse) { return (mouse.y / height) * root.ph }

          function letGo() {
            if (!carrying) return
            carrying = false
            root.scene.release(root.sim)
          }

          onPressed: function(mouse) {
            carrying = interactive && root.scene.grab(root.sim, worldX(mouse), worldY(mouse), root.geometry, root.env)
            grabbed = carrying
          }
          onPositionChanged: function(mouse) {
            if (!interactive) return
            if (carrying) {
              root.scene.drag(root.sim, worldX(mouse), worldY(mouse), root.geometry)
              dynamicWorldCanvas.requestPaint()
            } else {
              overCharacter = root.scene.canGrab(root.sim, worldX(mouse), worldY(mouse), root.geometry, root.env)
            }
          }
          onExited: overCharacter = false
          onReleased: letGo()
          onCanceled: letGo()
          onClicked: function(mouse) {
            if (!root.cfg.effects.lightning || grabbed) return
            root.scene.lightning(root.sim, Math.floor(worldX(mouse)))
          }
        }
      }
    }
  }
}
