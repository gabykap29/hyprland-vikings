import QtQuick

Item {
  id: row
  property string label: ""
  property string hint: ""
  property bool checked: false
  signal toggled(bool value)

  width: parent ? parent.width : 0
  implicitHeight: Math.max(36, texts.implicitHeight + 8)

  Column {
    id: texts
    anchors.left: parent.left
    anchors.right: track.left
    anchors.rightMargin: 16
    anchors.verticalCenter: parent.verticalCenter
    spacing: 2

    Text {
      text: row.label
      color: Theme.text
      font.family: Theme.font
      font.pixelSize: 13
    }
    Text {
      visible: row.hint.length > 0
      width: parent.width
      text: row.hint
      color: Theme.muted
      font.family: Theme.font
      font.pixelSize: 11
      wrapMode: Text.WordWrap
    }
  }

  Rectangle {
    id: track
    anchors.right: parent.right
    anchors.verticalCenter: parent.verticalCenter
    width: 42
    height: 22
    radius: 11
    color: row.checked ? Theme.teal : Theme.surface
    border.width: 1
    border.color: row.checked ? Theme.teal : Theme.border

    Rectangle {
      width: 16
      height: 16
      radius: 8
      y: 3
      x: row.checked ? parent.width - width - 3 : 3
      color: row.checked ? Theme.bg : Theme.muted
      Behavior on x { NumberAnimation { duration: 90 } }
    }
  }

  MouseArea {
    anchors.fill: parent
    cursorShape: Qt.PointingHandCursor
    onClicked: row.toggled(!row.checked)
  }
}
