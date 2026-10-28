#!/usr/bin/env bash
# ============================================================================
# ᛟ HYPRLAND VIKING — Installer (Hyprland + Quickshell, any distro)
# ============================================================================
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$PROJECT_ROOT/scripts"

QS_DST="$HOME/.config/quickshell/hyprland-viking"
BIN_DIR="$HOME/.local/bin"
DATA_DIR="$HOME/.local/share/hyprland-viking"
USER_DIR="$HOME/.config/hyprland-viking"

DO_BACKUP=1
INSTALL_WORLD=0
INSTALL_LOCK=0
INSTALL_FETCH=0
INSTALL_LOOK=0
ANY_SELECTED=0

usage() {
  cat <<EOF2
╔══════════════════════════════════════════════════════════════════════╗
║        ᛟ  HYPRLAND VIKING — INSTALADOR  ᛟ                           ║
╚══════════════════════════════════════════════════════════════════════╝

Requiere Hyprland y Quickshell (comando 'qs').

Uso:
  ./install.sh [OPCIONES]

Sin opciones de módulo se instalan: world, hyprlock y fastfetch.

Módulos:
  --world        Live wallpaper pixel art + panel de configuración (Quickshell)
  --hyprlock     Pantalla de bloqueo (hyprlock) y fondos
  --fastfetch    Configuración de fastfetch con ASCII vikingo
  --looknfeel    Bordes, gaps y blur (hypr/looknfeel.lua, opcional; ver README)

General:
  --no-backup    Omite el respaldo previo
  --uninstall    Desinstala y restaura el respaldo
  -h, --help     Muestra esta ayuda
EOF2
}

check_requirements() {
  if ! command -v qs >/dev/null 2>&1; then
    echo "❌ No se encontró Quickshell ('qs'). El live wallpaper y su panel lo necesitan."
    echo "   Instálalo: CachyOS/Arch → sudo pacman -S quickshell · Nix → nixpkgs#quickshell"
    echo "   o compílalo: https://quickshell.org/docs/guide/install-setup/"
    echo "   Puedes instalar solo los demás módulos con --hyprlock / --fastfetch."
    return 1
  fi
}

install_world() {
  echo "🌧️  [world] Instalando en $QS_DST..."
  mkdir -p "$(dirname "$QS_DST")" "$USER_DIR" "$BIN_DIR"
  rm -rf "$QS_DST"
  cp -r "$PROJECT_ROOT/quickshell/hyprland-viking" "$QS_DST"
  chmod +x "$QS_DST/hyprland-viking-ctl"
  ln -sf "$QS_DST/hyprland-viking-ctl" "$BIN_DIR/hyprland-viking-ctl"

  # Launcher entry (rofi, wofi, fuzzel...). Absolute Exec: launchers often lack ~/.local/bin in PATH.
  mkdir -p "$HOME/.local/share/applications"
  sed "s|^Exec=.*|Exec=$BIN_DIR/hyprland-viking-ctl settings|" "$PROJECT_ROOT/desktop/hyprland-viking-settings.desktop" \
    > "$HOME/.local/share/applications/hyprland-viking-settings.desktop"

  # Settings live outside the shell dir so reinstalling never resets them.
  [[ -f "$USER_DIR/weather.json" ]] || cp "$QS_DST/config/weather.default.json" "$USER_DIR/weather.json"
  # config.json is created by the shell on first run with its defaults.
}

install_backgrounds() {
  mkdir -p "$DATA_DIR"
  rm -rf "$DATA_DIR/backgrounds"
  cp -r "$PROJECT_ROOT/assets/backgrounds" "$DATA_DIR/backgrounds"
}

install_hyprlock() {
  echo "🔒 [hyprlock] Instalando hyprlock.conf y fondos..."
  mkdir -p "$HOME/.config/hypr/extra"
  install_backgrounds
  cp "$PROJECT_ROOT/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
  cp "$PROJECT_ROOT/hypr/extra/hyprlock-colors.conf" "$HOME/.config/hypr/extra/hyprlock-colors.conf"
}

install_fastfetch() {
  echo "📜 [fastfetch] Instalando configuración..."
  mkdir -p "$HOME/.config/fastfetch/ascii"
  cp "$PROJECT_ROOT/fastfetch/config.jsonc" "$HOME/.config/fastfetch/config.jsonc"
  cp "$PROJECT_ROOT/fastfetch/ascii/valhalla.txt" "$HOME/.config/fastfetch/ascii/valhalla.txt"
}

install_looknfeel() {
  echo "🎨 [looknfeel] Copiando hypr/looknfeel.lua a ~/.config/hypr/viking-looknfeel.lua (no se activa solo)..."
  mkdir -p "$HOME/.config/hypr"
  cp "$PROJECT_ROOT/hypr/looknfeel.lua" "$HOME/.config/hypr/viking-looknfeel.lua"
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --world)      INSTALL_WORLD=1; ANY_SELECTED=1 ;;
    --hyprlock)   INSTALL_LOCK=1; ANY_SELECTED=1 ;;
    --fastfetch)  INSTALL_FETCH=1; ANY_SELECTED=1 ;;
    --looknfeel)  INSTALL_LOOK=1; ANY_SELECTED=1 ;;
    --no-backup)  DO_BACKUP=0 ;;
    --uninstall)  bash "$SCRIPTS_DIR/uninstall.sh"; exit 0 ;;
    -h|--help)    usage; exit 0 ;;
    *) echo "❌ Opción desconocida: $1"; usage; exit 1 ;;
  esac
  shift
done

if [[ "$ANY_SELECTED" -eq 0 ]]; then
  INSTALL_WORLD=1; INSTALL_LOCK=1; INSTALL_FETCH=1
fi

echo "⚔️  INICIANDO INSTALACIÓN DE HYPRLAND VIKING"

if [[ "$INSTALL_WORLD" -eq 1 ]]; then
  check_requirements || exit 1
fi

[[ "$DO_BACKUP" -eq 1 ]] && bash "$SCRIPTS_DIR/backup.sh"

[[ "$INSTALL_WORLD" -eq 1 ]] && install_world
[[ "$INSTALL_LOCK" -eq 1 ]]  && install_hyprlock
[[ "$INSTALL_FETCH" -eq 1 ]] && install_fastfetch
[[ "$INSTALL_LOOK" -eq 1 ]]  && install_looknfeel

echo ""
echo "✨ ¡SKÅL! Instalación terminada."
if [[ "$INSTALL_WORLD" -eq 1 ]]; then
  echo "   • Arranque: añade a tu hyprland.conf →  exec-once = qs -c hyprland-viking"
  echo "     (o pruébalo ya con:  qs -c hyprland-viking &)"
  echo "   • Panel de configuración:  hyprland-viking-ctl settings"
  echo "     (asegúrate de tener $BIN_DIR en tu PATH)"
  echo "   • Clima real (Open-Meteo): ./scripts/weather-api-sync.sh"
fi
[[ "$INSTALL_LOOK" -eq 1 ]] && echo "   • looknfeel: ver el README para incluir ~/.config/hypr/viking-looknfeel.lua"
