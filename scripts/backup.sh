#!/usr/bin/env bash
# ============================================================================
# backup.sh — Crea un respaldo seguro de la configuración actual de Omarchy/Hyprland
# ============================================================================
set -euo pipefail

BACKUP_BASE="${1:-$HOME/.config/omarchy-backup-pre-valhalla}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [[ -d "$BACKUP_BASE" ]]; then
  BACKUP_DIR="${BACKUP_BASE}-${TIMESTAMP}"
else
  BACKUP_DIR="$BACKUP_BASE"
fi

echo "🛡️  [Backup] Creando respaldo en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"/{omarchy,hypr,fastfetch}

[[ -f "$HOME/.config/omarchy/shell.json" ]] && cp -a "$HOME/.config/omarchy/shell.json" "$BACKUP_DIR/omarchy/"
[[ -d "$HOME/.config/omarchy/extensions" ]] && cp -a "$HOME/.config/omarchy/extensions" "$BACKUP_DIR/omarchy/"
[[ -d "$HOME/.config/omarchy/branding" ]] && cp -a "$HOME/.config/omarchy/branding" "$BACKUP_DIR/omarchy/"
[[ -d "$HOME/.config/omarchy/current" ]] && cp -a "$HOME/.config/omarchy/current" "$BACKUP_DIR/omarchy/"

[[ -f "$HOME/.config/hypr/looknfeel.lua" ]] && cp -a "$HOME/.config/hypr/looknfeel.lua" "$BACKUP_DIR/hypr/"
[[ -f "$HOME/.config/hypr/hyprlock.conf" ]] && cp -a "$HOME/.config/hypr/hyprlock.conf" "$BACKUP_DIR/hypr/"
[[ -d "$HOME/.config/hypr/extra" ]] && cp -a "$HOME/.config/hypr/extra" "$BACKUP_DIR/hypr/"

[[ -d "$HOME/.config/fastfetch" ]] && cp -a "$HOME/.config/fastfetch/." "$BACKUP_DIR/fastfetch/"

echo "✅ [Backup] Respaldo completado exitosamente en: $BACKUP_DIR"
