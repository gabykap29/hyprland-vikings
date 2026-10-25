import QtQuick
import Quickshell
import Quickshell.Wayland

// Full-screen overlay hosting the settings card. All edits are emitted as
// changeRequested(path, value); Service.qml validates, applies and persists them.
PanelWindow {
  id: win

  property bool open: false
  property var config: ({})
  property var scenes: []
  property string timeNow: "night"
  property string weatherSummary: ""
  property string tab: "scene"

  signal changeRequested(string path, var value)
  signal closeRequested()

  readonly property var effectLabels: ({
    aurora: { label: "Aurora boreal", hint: "Cintas de luz en el cielo nocturno." },
    lightning: { label: "Relámpagos de Thor", hint: "Rayos aleatorios en tormenta y con clic en el escritorio." },
    ravens: { label: "Cuervos de Odín", hint: "Huginn y Muninn sobrevolando la escena." },
    vikings: { label: "Vikingos", hint: "Habitantes autónomos del asentamiento." },
    stars: { label: "Estrellas", hint: "Cielo estrellado (solo visible de noche)." },
    fire: { label: "Incendios", hint: "Llamas, humo y brasas en los edificios en llamas." },
    arrows: { label: "Flechas", hint: "Los arqueros disparan; sin esto solo hay combate cuerpo a cuerpo." }
  })

  readonly property var timeLabels: ({
    auto: "Automático", night: "Noche", dawn: "Amanecer", day: "Día", dusk: "Atardecer"
  })

  function currentScene() {
    for (var i = 0; i < scenes.length; i++) if (scenes[i].id === config.scene) return scenes[i]
    return scenes.length ? scenes[0] : null
  }

  visible: open
  color: "transparent"

  WlrLayershell.namespace: "hyprland-viking-settings"
  WlrLayershell.layer: WlrLayer.Overlay
  WlrLayershell.exclusionMode: ExclusionMode.Ignore
  WlrLayershell.keyboardFocus: win.open ? WlrKeyboardFocus.Exclusive : WlrKeyboardFocus.None

  anchors {
    top: true
    bottom: true
    left: true
    right: true
  }

  FocusScope {
    anchors.fill: parent
    focus: true
    Keys.onEscapePressed: win.closeRequested()

    Rectangle {
      anchors.fill: parent
      color: Theme.scrim
      MouseArea {
        anchors.fill: parent
        onClicked: win.closeRequested()
      }
    }

    Rectangle {
      id: card
      anchors.centerIn: parent
      width: Math.min(860, parent.width - 64)
      height: Math.min(600, parent.height - 64)
      radius: 8
      color: Theme.bg
      border.width: 1
      border.color: Theme.border

      MouseArea { anchors.fill: parent }   // swallow clicks so the scrim doesn't close the card

      // ---- Header -----------------------------------------------------------
      Item {
        id: header
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        height: 64

        Text {
          id: logo
          anchors.left: parent.left
          anchors.leftMargin: 24
          anchors.verticalCenter: parent.verticalCenter
          text: "ᛟ"
          color: Theme.accent
          font.family: Theme.runeFont
          font.pixelSize: 30
        }
        Column {
          anchors.left: logo.right
          anchors.leftMargin: 14
          anchors.verticalCenter: parent.verticalCenter
          spacing: 2
          Text {
            text: "HYPRLAND VIKING"
            color: Theme.text
            font.family: Theme.font
            font.pixelSize: 16
            font.bold: true
            font.letterSpacing: 2
          }
          Text {
            text: "Configuración del mundo pixel art"
            color: Theme.muted
            font.family: Theme.font
            font.pixelSize: 11
          }
        }
        Chip {
          anchors.right: parent.right
          anchors.rightMargin: 20
          anchors.verticalCenter: parent.verticalCenter
          text: "Esc · Cerrar"
          onClicked: win.closeRequested()
        }
        Rectangle {
          anchors.left: parent.left
          anchors.right: parent.right
          anchors.bottom: parent.bottom
          height: 1
          color: Theme.border
        }
      }

      // ---- Left rail --------------------------------------------------------
      Rectangle {
        id: rail
        anchors.left: parent.left
        anchors.top: header.bottom
        anchors.bottom: parent.bottom
        width: 190
        color: Theme.rail
        radius: 8

        Column {
          anchors.fill: parent
          anchors.margins: 14
          spacing: 8

          Repeater {
            model: [
              { id: "scene", rune: "ᛟ", text: "Visualización" },
              { id: "weather", rune: "ᚦ", text: "Clima y ciudad" },
              { id: "time", rune: "ᛞ", text: "Hora del día" },
              { id: "effects", rune: "ᛉ", text: "Efectos" },
              { id: "perf", rune: "ᚱ", text: "Rendimiento" }
            ]
            Chip {
              required property var modelData
              width: rail.width - 28
              rune: modelData.rune
              text: modelData.text
              selected: win.tab === modelData.id
              onClicked: win.tab = modelData.id
            }
          }
        }
      }

      // ---- Content ----------------------------------------------------------
      Flickable {
        id: scroller
        anchors.left: rail.right
        anchors.right: parent.right
        anchors.top: header.bottom
        anchors.bottom: parent.bottom
        anchors.margins: 24
        clip: true
        contentWidth: width
        contentHeight: pages.height
        boundsBehavior: Flickable.StopAtBounds

        Column {
          id: pages
          width: scroller.width
          spacing: 18

          // -- Visualización --
          Column {
            width: parent.width
            spacing: 14
            visible: win.tab === "scene"

            SectionTitle {
              title: "Visualización"
              hint: "Elegí el mundo que se dibuja como fondo de escritorio. Las nuevas escenas aparecerán aquí."
            }
            Flow {
              width: parent.width
              spacing: 14
              Repeater {
                model: win.scenes
                SceneCard {
                  required property var modelData
                  name: modelData.name
                  description: modelData.description
                  swatches: modelData.swatches
                  selected: win.config.scene === modelData.id
                  onClicked: win.changeRequested("scene", modelData.id)
                }
              }
            }
          }

          // -- Clima y ciudad --
          Column {
            width: parent.width
            spacing: 14
            visible: win.tab === "weather"

            SectionTitle {
              title: "Clima"
              hint: "Ahora: " + win.weatherSummary
            }
            Flow {
              width: parent.width
              spacing: 8
              Chip {
                text: "Manual"
                selected: win.config.weather.mode === "manual"
                onClicked: win.changeRequested("weather.mode", "manual")
              }
              Chip {
                text: "Automático (por ciudad)"
                selected: win.config.weather.mode === "auto"
                onClicked: win.changeRequested("weather.mode", "auto")
              }
            }

            SectionTitle {
              title: "Condición"
              hint: win.config.weather.mode === "manual"
                ? "El clima que verás en el fondo."
                : "En modo automático la condición la define el proveedor de clima."
            }
            Flow {
              width: parent.width
              spacing: 8
              Repeater {
                model: [
                  { id: "clear", rune: "ᛞ", text: "Despejado" },
                  { id: "rain", rune: "ᛚ", text: "Lluvia" },
                  { id: "storm", rune: "ᛋ", text: "Tormenta" },
                  { id: "snow", rune: "ᛁ", text: "Nieve" }
                ]
                Chip {
                  required property var modelData
                  rune: modelData.rune
                  text: modelData.text
                  enabled: win.config.weather.mode === "manual"
                  selected: win.config.weather.condition === modelData.id
                  onClicked: win.changeRequested("weather.condition", modelData.id)
                }
              }
            }

            SectionTitle {
              title: "Tu ciudad"
              hint: "Se guarda para el modo automático. Todavía no hay un proveedor de clima configurado, así que por ahora solo se muestra como ubicación."
            }
            TextField {
              width: parent.width
              text: win.config.weather.city
              placeholder: "Ej: Buenos Aires"
              onAccepted: function(value) {
                if (value !== win.config.weather.city) win.changeRequested("weather.city", value)
              }
            }
          }

          // -- Hora del día --
          Column {
            width: parent.width
            spacing: 14
            visible: win.tab === "time"

            SectionTitle {
              title: "Hora del día"
              hint: "Ahora se está mostrando: " + (win.timeLabels[win.timeNow] || win.timeNow)
                + ". En automático sigue la hora real de tu equipo."
            }
            Flow {
              width: parent.width
              spacing: 8
              Repeater {
                model: ["auto", "night", "dawn", "day", "dusk"]
                Chip {
                  required property string modelData
                  text: win.timeLabels[modelData]
                  selected: win.config.timeOfDay.mode === modelData
                  onClicked: win.changeRequested("timeOfDay.mode", modelData)
                }
              }
            }
          }

          // -- Efectos --
          Column {
            width: parent.width
            spacing: 6
            visible: win.tab === "effects"

            SectionTitle {
              title: "Efectos"
              hint: "Activá o desactivá cada elemento de la escena."
            }
            Repeater {
              model: win.currentScene() ? win.currentScene().supports.effects : []
              ToggleRow {
                required property string modelData
                label: win.effectLabels[modelData] ? win.effectLabels[modelData].label : modelData
                hint: win.effectLabels[modelData] ? win.effectLabels[modelData].hint : ""
                checked: win.config.effects[modelData] === true
                onToggled: function(value) { win.changeRequested("effects." + modelData, value) }
              }
            }
            Item { width: 1; height: 8 }
            SliderRow {
              label: "Intensidad de la aurora"
              value: win.config.effects.auroraStrength
              onMoved: function(v) { win.changeRequested("effects.auroraStrength", v) }
            }
            SliderRow {
              label: "Intensidad de lluvia y nieve"
              value: win.config.effects.precipitation
              onMoved: function(v) { win.changeRequested("effects.precipitation", v) }
            }
          }

          // -- Rendimiento --
          Column {
            width: parent.width
            spacing: 14
            visible: win.tab === "perf"

            SectionTitle {
              title: "Rendimiento"
              hint: "Menos fotogramas por segundo consume menos CPU/GPU. La velocidad de la animación no cambia."
            }
            Flow {
              width: parent.width
              spacing: 8
              Repeater {
                model: [
                  { fps: 8, text: "Ahorro · 8 fps" },
                  { fps: 12, text: "Equilibrado · 12 fps" },
                  { fps: 24, text: "Fluido · 24 fps" }
                ]
                Chip {
                  required property var modelData
                  text: modelData.text
                  selected: win.config.performance.fps === modelData.fps
                  onClicked: win.changeRequested("performance.fps", modelData.fps)
                }
              }
            }
            ToggleRow {
              label: "Fondo animado activo"
              hint: "Apagarlo oculta el mundo y detiene la simulación."
              checked: win.config.enabled
              onToggled: function(value) { win.changeRequested("enabled", value) }
            }
          }
        }
      }
    }
  }
}
