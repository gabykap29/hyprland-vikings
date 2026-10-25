import QtQuick

Item {
  id: row
  property string label: ""
  property real value: 1.0
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
    text: Math.round(row.value * 100) + "%"
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
      width: Math.max(6, parent.width * row.value)
      height: parent.height
      radius: 3
      color: Theme.teal
    }
    Rectangle {
      width: 14
      height: 14
      radius: 7
      anchors.verticalCenter: parent.verticalCenter
      x: Math.max(0, Math.min(parent.width - width, parent.width * row.value - width / 2))
      color: Theme.accent
    }
  }

  MouseArea {
    anchors.fill: parent
    cursorShape: Qt.PointingHandCursor
    function update(mx) {
      row.moved(Math.max(0, Math.min(1, Math.round((mx / width) * 20) / 20)))
    }
    onPressed: function(mouse) { update(mouse.x) }
    onPositionChanged: function(mouse) { if (pressed) update(mouse.x) }
  }
}
