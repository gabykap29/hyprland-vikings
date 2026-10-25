import QtQuick

Column {
  id: root
  property string title: ""
  property string hint: ""
  width: parent ? parent.width : 0
  spacing: 4

  Text {
    text: root.title
    color: Theme.accent
    font.family: Theme.font
    font.pixelSize: 15
    font.bold: true
  }
  Text {
    visible: root.hint.length > 0
    width: root.width
    text: root.hint
    color: Theme.muted
    font.family: Theme.font
    font.pixelSize: 12
    wrapMode: Text.WordWrap
  }
}
