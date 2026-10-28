import QtQuick

// Swatch palette plus a hex field. Emits picked("#rrggbb") for either.
Item {
  id: row
  property string label: ""
  property string value: "#38b2a6"
  signal picked(string value)

  readonly property var palette: [
    "#38b2a6", "#d49b4b", "#4ecdc4", "#9d6bff", "#5b9dff",
    "#6fcf6f", "#e5543c", "#f1f1f1", "#8a96a0", "#1b2630"
  ]

  width: parent ? parent.width : 0
  implicitHeight: col.implicitHeight

  Column {
    id: col
    width: parent.width
    spacing: 10

    Text {
      text: row.label
      color: Theme.text
      font.family: Theme.font
      font.pixelSize: 13
    }
    Flow {
      width: parent.width
      spacing: 8
      Repeater {
        model: row.palette
        Rectangle {
          required property string modelData
          width: 30
          height: 30
          radius: 15
          color: modelData
          border.width: row.value.toLowerCase() === modelData ? 3 : 1
          border.color: row.value.toLowerCase() === modelData ? Theme.text : Theme.border
          MouseArea {
            anchors.fill: parent
            cursorShape: Qt.PointingHandCursor
            onClicked: row.picked(modelData)
          }
        }
      }
    }
    Row {
      spacing: 10
      Rectangle {
        width: 36
        height: 36
        radius: 4
        color: row.value
        border.width: 1
        border.color: Theme.border
      }
      TextField {
        width: 160
        text: row.value
        placeholder: "#rrggbb"
        onAccepted: function(v) {
          var t = v.trim()
          if (t.length > 0 && t[0] !== "#") t = "#" + t
          if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(t)) row.picked(t)
        }
      }
    }
  }
}
