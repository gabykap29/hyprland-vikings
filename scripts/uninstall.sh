#!/usr/bin/env bash
# ============================================================================
# uninstall.sh — Desinstala Hyprland Viking y restaura el respaldo previo
# ============================================================================
set -euo pipefail

BACKUP_DIR="${1:-$HOME/.config/hyprland-viking-backup}"

echo "⚔️  [Uninstall] Desinstalando Hyprland Viking..."
pkill -f "qs -c hyprland-viking" 2>/dev/null || true
rm -rf "$HOME/.config/quickshell/hyprland-viking"
rm -f "$HOME/.local/bin/hyprland-viking-ctl"
rm -f "$HOME/.local/share/applications/hyprland-viking-settings.desktop"
rm -rf "$HOME/.local/share/hyprland-viking"
echo "   (tu configuración en ~/.config/hyprland-viking se conserva)"

if [[ -d "$BACKUP_DIR" ]]; then
  echo "🔄 [Uninstall] Restaurando archivos desde $BACKUP_DIR..."
  [[ -f "$BACKUP_DIR/hypr/hyprlock.conf" ]] && cp -a "$BACKUP_DIR/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
  [[ -d "$BACKUP_DIR/hypr/extra" ]] && cp -a "$BACKUP_DIR/hypr/extra/." "$HOME/.config/hypr/extra/"
  [[ -d "$BACKUP_DIR/fastfetch" ]] && cp -a "$BACKUP_DIR/fastfetch/." "$HOME/.config/fastfetch/"
  command -v hyprctl >/dev/null 2>&1 && hyprctl reload || true
else
  echo "⚠️  [Uninstall] No se encontró respaldo en $BACKUP_DIR; no se restauró nada."
fi

echo "✅ [Uninstall] Listo. Quita 'exec-once = qs -c hyprland-viking' de tu hyprland.conf."
