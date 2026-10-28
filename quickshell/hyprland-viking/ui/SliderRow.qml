import QtQuick

Item {
  id: row
  property string label: ""
  property real value: 1.0
  property real from: 0
  property real to: 1
  property string unit: "%"       // "%" shows value*100; anything else shows the raw value
  readonly property real fraction: (row.value - row.from) / (row.to - row.from)
  signal moved(real value)

  width: parent ? parent.width : 0
  implicitHeight: 42

  Text {
    id: title
    text: row.label
    color: Theme.text
    font.family: Theme.font
    font.pixelSize: 13
  }
  Text {
    anchors.right: parent.right
    text: row.unit === "%" ? Math.round(row.value * 100) + "%" : Math.round(row.value) + " " + row.unit
    color: Theme.accent
    font.family: Theme.font
    font.pixelSize: 12
  }

  Rectangle {
    id: track
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.bottomMargin: 6
    height: 6
    radius: 3
    color: Theme.surface
    border.width: 1
    border.color: Theme.border

    Rectangle {
      width: Math.max(6, parent.width * row.fraction)
      height: parent.height
      radius: 3
      color: Theme.teal
    }
    Rectangle {
      width: 14
      height: 14
      radius: 7
      anchors.verticalCenter: parent.verticalCenter
      x: Math.max(0, Math.min(parent.width - width, parent.width * row.fraction - width / 2))
      color: Theme.accent
    }
  }

  MouseArea {
    anchors.fill: parent
    cursorShape: Qt.PointingHandCursor
    function update(mx) {
      var f = Math.max(0, Math.min(1, mx / width))
      if (row.unit === "%") row.moved(Math.round(f * 20) / 20)
      else row.moved(Math.round(row.from + f * (row.to - row.from)))
    }
    onPressed: function(mouse) { update(mouse.x) }
    onPositionChanged: function(mouse) { if (pressed) update(mouse.x) }
  }
}
