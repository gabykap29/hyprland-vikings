import QtQuick
import QtQuick.Layouts
import Quickshell.Hyprland
import qs.Commons
import qs.Ui

BarWidget {
  id: root
  moduleName: "omarchy.workspaces"

  function workspaceById(id) {
    var values = Hyprland.workspaces.values
    for (var i = 0; i < values.length; i++) {
      if (values[i].id === id) return values[i]
    }
    return null
  }

  function workspaceIds() {
    var ids = [1, 2, 3, 4, 5]
    var values = Hyprland.workspaces.values

    for (var i = 0; i < values.length; i++) {
      var id = values[i].id
      if (id > 0 && id <= 10 && ids.indexOf(id) === -1) ids.push(id)
    }

    ids.sort(function(left, right) { return left - right })
    return ids
  }

  function realmName(id) {
    var realms = {
      1: "I · MIDGARD",
      2: "II · ASGARD",
      3: "III · VALHALLA",
      4: "IV · JOTUNHEIM",
      5: "V · VANAHEIM",
      6: "VI · ALFHEIM",
      7: "VII · SVARTALF",
      8: "VIII · MUSPEL",
      9: "IX · NIFLHEIM",
      10: "X · BIFROST"
    }
    return realms[id] || String(id)
  }

  function romanNumeral(id) {
    var numerals = {
      1: "I", 2: "II", 3: "III", 4: "IV", 5: "V",
      6: "VI", 7: "VII", 8: "VIII", 9: "IX", 10: "X"
    }
    return numerals[id] || String(id)
  }

  function focusWorkspace(id) {
    if (!root.bar) return
    root.bar.run("hyprctl dispatch " + Util.shellQuote("hl.dsp.focus({ workspace = \"" + id + "\" })"))
  }

  readonly property real trailingGap: root.vertical ? 0 : Style.spaceReal(2)

  implicitWidth: grid.implicitWidth + trailingGap
  implicitHeight: grid.implicitHeight

  GridLayout {
    id: grid
    anchors.fill: parent
    anchors.rightMargin: root.trailingGap
    columns: root.vertical ? 1 : root.workspaceIds().length
    columnSpacing: root.vertical ? 0 : 3
    rowSpacing: root.vertical ? Style.space(2) : 0

    Repeater {
      model: root.workspaceIds()

      Item {
        required property int modelData

        readonly property var workspace: root.workspaceById(modelData)
        readonly property bool occupied: workspace !== null && workspace.toplevels.values.length > 0
        readonly property bool focused: Hyprland.focusedWorkspace !== null && Hyprland.focusedWorkspace.id === modelData

        implicitWidth: wsButton.implicitWidth
        implicitHeight: wsButton.implicitHeight

        Rectangle {
          anchors.fill: parent
          anchors.topMargin: 3
          anchors.bottomMargin: 3
          radius: 4
          color: parent.focused ? "#33d49b4b" : (parent.occupied ? "#1a38b2a6" : "transparent")
          border.width: parent.focused || parent.occupied ? 1 : 0
          border.color: parent.focused ? "#f0ba65" : "#664ecdc4"

          Rectangle {
            visible: parent.parent.focused
            anchors.bottom: parent.bottom
            anchors.horizontalCenter: parent.horizontalCenter
            width: Math.max(12, parent.width - 10)
            height: 2
            radius: 1
            color: "#f0ba65"
          }
        }

        WidgetButton {
          id: wsButton
          bar: root.bar
          text: parent.focused
            ? ("◆ " + root.realmName(parent.modelData))
            : (parent.occupied ? ("◆ " + root.romanNumeral(parent.modelData)) : ("◇ " + root.romanNumeral(parent.modelData)))
          foreground: parent.focused ? "#f0ba65" : (parent.occupied ? "#4ecdc4" : "#7b8b94")
          fontSize: parent.focused ? 11.5 : 11
          opacity: parent.occupied || parent.focused ? 1.0 : 0.72
          horizontalMargin: parent.focused ? 9 : 6.5
          verticalPadding: 6
          fixedHeight: root.barSize
          tooltipText: "Reino " + root.realmName(parent.modelData)
          onPressed: function() { root.focusWorkspace(parent.modelData) }
        }
      }
    }
  }
}
