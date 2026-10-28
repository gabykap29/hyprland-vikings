import QtQuick

Rectangle {
  id: card
  property string name: ""
  property string description: ""
  property var swatches: []
  property bool selected: false
  signal clicked()

  width: 240
  height: 148
  radius: 6
  color: mouse.containsMouse ? Theme.surfaceHover : Theme.surface
  border.width: card.selected ? 2 : 1
  border.color: card.selected ? Theme.accent : Theme.border

  Row {
    id: strip
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.margins: 2
    height: 34
    Repeater {
      model: card.swatches
      Rectangle {
        required property string modelData
        width: strip.width / Math.max(1, card.swatches.length)
        height: strip.height
        color: modelData
      }
    }
  }

  Column {
    anchors.left: parent.left
    anchors.right: parent.right
    anchors.top: strip.bottom
    anchors.margins: 12
    spacing: 4

    Text {
      width: parent.width
      text: card.name
      color: card.selected ? Theme.accent : Theme.text
      font.family: Theme.font
      font.pixelSize: 13
      font.bold: true
      wrapMode: Text.WordWrap
      maximumLineCount: 2
      elide: Text.ElideRight
    }
    Text {
      width: parent.width
      text: card.description
      color: Theme.muted
      font.family: Theme.font
      font.pixelSize: 11
      wrapMode: Text.WordWrap
      maximumLineCount: 3
      elide: Text.ElideRight
    }
  }

  Rectangle {
    visible: card.selected
    anchors.right: parent.right
    anchors.top: parent.top
    anchors.margins: 8
    width: tag.implicitWidth + 12
    height: 18
    radius: 3
    color: Theme.accent
    Text {
      id: tag
      anchors.centerIn: parent
      text: "ACTIVA"
      color: Theme.bg
      font.family: Theme.font
      font.pixelSize: 9
      font.bold: true
    }
  }

  MouseArea {
    id: mouse
    anchors.fill: parent
    hoverEnabled: true
    cursorShape: Qt.PointingHandCursor
    onClicked: card.clicked()
  }
}
