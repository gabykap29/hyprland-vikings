import QtQuick

Rectangle {
  id: field
  property string text: ""
  property string placeholder: ""
  signal accepted(string value)

  implicitHeight: 36
  radius: 4
  color: Theme.surface
  border.width: 1
  border.color: input.activeFocus ? Theme.teal : Theme.border

  // Keep the box in sync with the saved value unless the user is typing.
  onTextChanged: if (!input.activeFocus) input.text = field.text

  TextInput {
    id: input
    anchors.fill: parent
    anchors.leftMargin: 12
    anchors.rightMargin: 12
    verticalAlignment: TextInput.AlignVCenter
    color: Theme.text
    selectionColor: Theme.teal
    selectedTextColor: Theme.bg
    font.family: Theme.font
    font.pixelSize: 13
    clip: true
    maximumLength: 80
    text: field.text
    onAccepted: field.accepted(input.text)
    onActiveFocusChanged: if (!activeFocus) field.accepted(input.text)
  }

  Text {
    anchors.fill: input
    anchors.leftMargin: 0
    verticalAlignment: Text.AlignVCenter
    visible: input.text.length === 0
    text: field.placeholder
    color: Theme.muted
    font.family: Theme.font
    font.pixelSize: 13
  }

  MouseArea {
    anchors.fill: parent
    cursorShape: Qt.IBeamCursor
    onPressed: function(mouse) { input.forceActiveFocus(); mouse.accepted = false }
  }
}
