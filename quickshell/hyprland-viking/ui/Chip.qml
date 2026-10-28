import QtQuick

Rectangle {
  id: chip
  property string text: ""
  property string rune: ""
  property bool selected: false
  property bool enabled: true
  signal clicked()

  implicitHeight: 34
  implicitWidth: label.implicitWidth + 28
  radius: 4
  opacity: chip.enabled ? 1.0 : 0.4
  color: chip.selected ? Theme.accentSoft : (mouse.containsMouse && chip.enabled ? Theme.surfaceHover : Theme.surface)
  border.width: 1
  border.color: chip.selected ? Theme.accent : Theme.border

  Text {
    id: label
    anchors.centerIn: parent
    text: (chip.rune.length > 0 ? chip.rune + "  " : "") + chip.text
    color: chip.selected ? Theme.accent : Theme.text
    font.family: Theme.font
    font.pixelSize: 13
  }

  MouseArea {
    id: mouse
    anchors.fill: parent
    hoverEnabled: true
    enabled: chip.enabled
    cursorShape: Qt.PointingHandCursor
    onClicked: chip.clicked()
  }
}
