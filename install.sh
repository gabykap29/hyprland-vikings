#!/usr/bin/env bash
# ============================================================================
# ᛟ OMARCHY VALHALLA — Modular Installer for Omarchy + Hyprland
# ============================================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULES_DIR="$PROJECT_ROOT/modules"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

DO_BACKUP=1
INSTALL_THEME=0
INSTALL_BAR=0
INSTALL_MENU=0
INSTALL_WORLD=0
INSTALL_CONFIGS=0
ANY_SELECTED=0

usage() {
  cat <<EOF
╔══════════════════════════════════════════════════════════════════════╗
║        ᛟ  OMARCHY VALHALLA — INSTALADOR MODULAR VIKINGO  ᛟ          ║
╚══════════════════════════════════════════════════════════════════════╝

Uso:
  ./install.sh [OPCIONES]

Si no se especifican opciones de módulo, se instalan TODOS los módulos (--all).

Opciones de Módulos:
  --all          Instala todos los módulos (por defecto)
  --theme        Instala el tema nórdico 'valhalla' y sus fondos
  --bar          Instala la barra HUD estilo AC Valhalla y los 9 Reinos
  --menu         Instala el menú con medallones rúnicos Elder Futhark
  --world        Instala el Live Wallpaper 16-bit Pixel Art Viking World
  --configs      Instala configuraciones de Hyprland, Hyprlock, Fastfetch y Omarchy

Opciones Generales:
  --no-backup    Omite el respaldo previo a la instalación
  --uninstall    Desinstala Omarchy Valhalla y restaura el backup previo
  -h, --help     Muestra esta ayuda
EOF
}

install_module_theme() {
  echo "🎨 [Módulo: Theme] Instalando tema 'valhalla' en ~/.config/omarchy/themes/valhalla..."
  mkdir -p "$HOME/.config/omarchy/themes"
  rm -rf "$HOME/.config/omarchy/themes/valhalla"
  cp -r "$MODULES_DIR/theme/valhalla" "$HOME/.config/omarchy/themes/valhalla"
  if command -v omarchy-theme-set >/dev/null 2>&1; then
    omarchy-theme-set valhalla || true
  fi
}

install_module_bar() {
  echo "🧭 [Módulo: HUD Bar & Workspaces] Instalando gabriel.bar y gabriel.workspaces..."
  mkdir -p "$HOME/.config/omarchy/plugins"
  rm -rf "$HOME/.config/omarchy/plugins/gabriel.bar"
  rm -rf "$HOME/.config/omarchy/plugins/gabriel.workspaces"
  cp -r "$MODULES_DIR/bar/gabriel.bar" "$HOME/.config/omarchy/plugins/gabriel.bar"
  cp -r "$MODULES_DIR/bar/gabriel.workspaces" "$HOME/.config/omarchy/plugins/gabriel.workspaces"
}

install_module_menu() {
  echo "ᛟ  [Módulo: Rune Menu] Instalando gabriel.menu con medallones rúnicos y AppLibrary..."
  mkdir -p "$HOME/.config/omarchy/plugins"
  rm -rf "$HOME/.config/omarchy/plugins/gabriel.menu"
  cp -r "$MODULES_DIR/menu/gabriel.menu" "$HOME/.config/omarchy/plugins/gabriel.menu"
}

install_module_world() {
  echo "🌧️  [Módulo: Pixel Viking World] Instalando motor 16-bit gabriel.valhalla-world..."
  mkdir -p "$HOME/.config/omarchy/plugins"
  rm -rf "$HOME/.config/omarchy/plugins/gabriel.valhalla-world"
  cp -r "$MODULES_DIR/world/gabriel.valhalla-world" "$HOME/.config/omarchy/plugins/gabriel.valhalla-world"
  chmod +x "$HOME/.config/omarchy/plugins/gabriel.valhalla-world/valhalla-world-ctl"
}

install_module_configs() {
  echo "⚙️  [Módulo: Configs] Instalando configuraciones de Omarchy, Hyprland, Hyprlock y Fastfetch..."
  mkdir -p "$HOME/.config/omarchy/extensions" "$HOME/.config/omarchy/branding"
  mkdir -p "$HOME/.config/hypr/extra" "$HOME/.config/fastfetch/ascii"

  cp "$MODULES_DIR/configs/omarchy/shell.json" "$HOME/.config/omarchy/shell.json"
  cp "$MODULES_DIR/configs/omarchy/extensions/omarchy-menu.jsonc" "$HOME/.config/omarchy/extensions/omarchy-menu.jsonc"
  cp "$MODULES_DIR/configs/omarchy/branding/about.txt" "$HOME/.config/omarchy/branding/about.txt"
  cp "$MODULES_DIR/configs/omarchy/branding/screensaver.txt" "$HOME/.config/omarchy/branding/screensaver.txt"

  cp "$MODULES_DIR/configs/hypr/looknfeel.lua" "$HOME/.config/hypr/looknfeel.lua"
  cp "$MODULES_DIR/configs/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
  cp "$MODULES_DIR/configs/hypr/extra/hyprlock-colors.conf" "$HOME/.config/hypr/extra/hyprlock-colors.conf"

  cp "$MODULES_DIR/configs/fastfetch/config.jsonc" "$HOME/.config/fastfetch/config.jsonc"
  cp "$MODULES_DIR/configs/fastfetch/ascii/valhalla.txt" "$HOME/.config/fastfetch/ascii/valhalla.txt"
}

reload_environment() {
  echo "🔄 [Reload] Recargando Hyprland y reiniciando Omarchy Shell..."
  command -v hyprctl >/dev/null 2>&1 && hyprctl reload >/dev/null 2>&1 || true
  command -v omarchy-restart-shell >/dev/null 2>&1 && omarchy-restart-shell || true
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --all)
      INSTALL_THEME=1
      INSTALL_BAR=1
      INSTALL_MENU=1
      INSTALL_WORLD=1
      INSTALL_CONFIGS=1
      ANY_SELECTED=1
      shift
      ;;
    --theme)
      INSTALL_THEME=1
      ANY_SELECTED=1
      shift
      ;;
    --bar)
      INSTALL_BAR=1
      ANY_SELECTED=1
      shift
      ;;
    --menu)
      INSTALL_MENU=1
      ANY_SELECTED=1
      shift
      ;;
    --world)
      INSTALL_WORLD=1
      ANY_SELECTED=1
      shift
      ;;
    --configs)
      INSTALL_CONFIGS=1
      ANY_SELECTED=1
      shift
      ;;
    --no-backup)
      DO_BACKUP=0
      shift
      ;;
    --uninstall)
      bash "$SCRIPTS_DIR/uninstall.sh"
      exit 0
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "❌ Opción desconocida: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ "$ANY_SELECTED" -eq 0 ]]; then
  INSTALL_THEME=1
  INSTALL_BAR=1
  INSTALL_MENU=1
  INSTALL_WORLD=1
  INSTALL_CONFIGS=1
fi

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║        ⚔️  INICIANDO INSTALACIÓN DE OMARCHY VALHALLA  ⚔️            ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"

if [[ "$DO_BACKUP" -eq 1 ]]; then
  bash "$SCRIPTS_DIR/backup.sh"
fi

[[ "$INSTALL_THEME" -eq 1 ]]   && install_module_theme
[[ "$INSTALL_BAR" -eq 1 ]]     && install_module_bar
[[ "$INSTALL_MENU" -eq 1 ]]    && install_module_menu
[[ "$INSTALL_WORLD" -eq 1 ]]   && install_module_world
[[ "$INSTALL_CONFIGS" -eq 1 ]] && install_module_configs

reload_environment

echo ""
echo "✨ ¡SKÅL! Omarchy Valhalla se ha instalado correctamente."
echo "   • Para cambiar el clima en vivo: Super + Alt + Space -> Style -> Valhalla Live World"
echo "   • Para sincronizar con clima real (Open-Meteo): ./scripts/weather-api-sync.sh"
