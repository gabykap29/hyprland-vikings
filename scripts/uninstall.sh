#!/usr/bin/env bash
# ============================================================================
# uninstall.sh — Desinstala los módulos de Valhalla y restaura el backup previo
# ============================================================================
set -euo pipefail

BACKUP_DIR="${1:-$HOME/.config/omarchy-backup-pre-valhalla}"

echo "⚔️  [Uninstall] Desinstalando plugins de Omarchy Valhalla..."
rm -rf "$HOME/.config/omarchy/plugins/gabriel.bar"
rm -rf "$HOME/.config/omarchy/plugins/gabriel.workspaces"
rm -rf "$HOME/.config/omarchy/plugins/gabriel.menu"
rm -rf "$HOME/.config/omarchy/plugins/gabriel.valhalla-world"

if [[ -f "$BACKUP_DIR/restore.sh" ]]; then
  echo "🔄 [Uninstall] Ejecutando script de restauración original ($BACKUP_DIR/restore.sh)..."
  bash "$BACKUP_DIR/restore.sh"
elif [[ -d "$BACKUP_DIR" ]]; then
  echo "🔄 [Uninstall] Restaurando archivos desde $BACKUP_DIR..."
  [[ -f "$BACKUP_DIR/omarchy/shell.json" ]] && cp -a "$BACKUP_DIR/omarchy/shell.json" "$HOME/.config/omarchy/shell.json"
  [[ -f "$BACKUP_DIR/hypr/looknfeel.lua" ]] && cp -a "$BACKUP_DIR/hypr/looknfeel.lua" "$HOME/.config/hypr/looknfeel.lua"
  [[ -f "$BACKUP_DIR/hypr/hyprlock.conf" ]] && cp -a "$BACKUP_DIR/hypr/hyprlock.conf" "$HOME/.config/hypr/hyprlock.conf"
  command -v omarchy-restart-shell >/dev/null 2>&1 && omarchy-restart-shell || true
  command -v hyprctl >/dev/null 2>&1 && hyprctl reload || true
else
  echo "⚠️  [Uninstall] No se encontró backup en $BACKUP_DIR. Reiniciando shell con valores por defecto..."
  rm -f "$HOME/.config/omarchy/shell.json"
  command -v omarchy-restart-shell >/dev/null 2>&1 && omarchy-restart-shell || true
fi

echo "✅ [Uninstall] Entorno restaurado."
