import QtQuick
import qs.Commons
import qs.Ui

BarWidget {
  id: root
  moduleName: "omarchy.menu"

  implicitWidth: button.implicitWidth + 8
  implicitHeight: button.implicitHeight

  Rectangle {
    anchors.fill: parent
    anchors.topMargin: 3
    anchors.bottomMargin: 3
    anchors.leftMargin: 2
    anchors.rightMargin: 4
    radius: 4
    color: button.tooltipHovered ? "#38d49b4b" : "#2238b2a6"
    border.width: 1
    border.color: button.tooltipHovered ? "#f0ba65" : "#aad49b4b"

    Behavior on color { ColorAnimation { duration: 150 } }
    Behavior on border.color { ColorAnimation { duration: 150 } }
  }

  WidgetButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    text: "◆ VALHALLA ◆"
    foreground: "#f0ba65"
    fontSize: 11.5
    horizontalMargin: 10
    tooltipText: "◆ Clan del Cuervo · Menú Principal\nClick der: Crónica Vikinga (Fastfetch)"
    onPressed: function(b) {
      if (!root.bar) return
      if (b === Qt.RightButton) root.bar.run("omarchy-launch-or-focus-tui \"bash -c 'clear; fastfetch; read -n 1 -s -r'\"")
      else root.bar.run("omarchy-shell shell toggle omarchy.menu '{\"menu\":\"root\"}'")
    }
  }
}
