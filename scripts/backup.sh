#!/usr/bin/env bash
# ============================================================================
# backup.sh — Respalda los archivos que el instalador puede sobrescribir
# ============================================================================
set -euo pipefail

BACKUP_BASE="${1:-$HOME/.config/hyprland-viking-backup}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [[ -d "$BACKUP_BASE" ]]; then
  BACKUP_DIR="${BACKUP_BASE}-${TIMESTAMP}"
else
  BACKUP_DIR="$BACKUP_BASE"
fi

echo "🛡️  [Backup] Creando respaldo en: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"/{hypr,fastfetch}

[[ -f "$HOME/.config/hypr/hyprlock.conf" ]] && cp -a "$HOME/.config/hypr/hyprlock.conf" "$BACKUP_DIR/hypr/"
[[ -d "$HOME/.config/hypr/extra" ]] && cp -a "$HOME/.config/hypr/extra" "$BACKUP_DIR/hypr/"
[[ -d "$HOME/.config/fastfetch" ]] && cp -a "$HOME/.config/fastfetch/." "$BACKUP_DIR/fastfetch/"

echo "✅ [Backup] Respaldo completado en: $BACKUP_DIR"
