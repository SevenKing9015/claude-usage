#!/usr/bin/env bash
# Set up GNOME custom keyboard shortcuts that drive the overlay via `overlayctl`.
#
# Why: Electron's globalShortcut only grabs system-wide hotkeys on X11. On Wayland
# the in-app hotkeys only fire while the HUD has focus, so we bind GNOME custom
# shortcuts to overlayctl (which talks to the overlay's control socket) instead.
#
# Paths are resolved at runtime from this script's own location, so it works no
# matter where the project lives — just run it once per Wayland machine:
#   ./setup-wayland-hotkeys.sh          # install / refresh the shortcuts
#   ./setup-wayland-hotkeys.sh --remove # tear them back down
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")" && pwd)"
CTL="$SCRIPT_DIR/overlayctl"
NODE="$(command -v node || true)"

SCHEMA=org.gnome.settings-daemon.plugins.media-keys
ITEM="$SCHEMA.custom-keybinding"
BASE=/org/gnome/settings-daemon/plugins/media-keys/custom-keybindings

# our shortcuts live under a dedicated prefix so re-running is idempotent and we
# never clobber unrelated custom0/custom1/... shortcuts the user already has.
PREFIX=claude-overlay
KEYS=(toggle cycle op+ op- login refresh quit)

# stable per-action ids (op+/op- aren't path-safe), names, and GNOME bindings
declare -A ID=(   [toggle]=toggle [cycle]=cycle [op+]=opacity-up [op-]=opacity-down [login]=login [refresh]=refresh [quit]=quit )
declare -A NAME=( [toggle]="Overlay Toggle" [cycle]="Overlay Cycle Corner" [op+]="Overlay Opacity Up" [op-]="Overlay Opacity Down" [login]="Overlay Login" [refresh]="Overlay Refresh" [quit]="Overlay Quit" )
declare -A BIND=( [toggle]="<Control><Alt>u" [cycle]="<Control><Alt>c" [op+]="<Control><Alt>bracketright" [op-]="<Control><Alt>bracketleft" [login]="<Control><Alt>l" [refresh]="<Control><Alt>r" [quit]="<Control><Alt>q" )

# current list of registered custom-keybinding paths -> bash array
read_list() {
  local raw; raw="$(gsettings get "$SCHEMA" custom-keybindings)"
  raw="${raw#@as }"                                 # drop the '@as ' type tag gsettings emits for empty lists
  raw="${raw//[\[\]\' ]/}"                          # strip [ ] ' and spaces (NOT letters!)
  IFS=',' read -r -a _LIST <<< "$raw"
  local out=(); for p in "${_LIST[@]}"; do [ -n "$p" ] && out+=("$p"); done
  printf '%s\n' "${out[@]}"
}

# join a bash array into a gsettings 'as' literal: ['a', 'b']
to_literal() {
  local s="["; local first=1
  for p in "$@"; do [ "$first" = 1 ] && first=0 || s+=", "; s+="'$p'"; done
  echo "$s]"
}

mapfile -t LIST < <(read_list)
# drop any of our own paths first (so install refreshes cleanly, remove clears them)
KEPT=(); for p in "${LIST[@]}"; do [[ "$p" == *"/$PREFIX-"* ]] || KEPT+=("$p"); done

if [ "${1:-}" = "--remove" ]; then
  gsettings set "$SCHEMA" custom-keybindings "$(to_literal "${KEPT[@]}")"
  echo "Removed overlay shortcuts. Kept ${#KEPT[@]} other custom shortcut(s)."
  exit 0
fi

[ -x "$CTL" ] || { echo "error: overlayctl not found/executable at $CTL" >&2; exit 1; }
[ -n "$NODE" ] || { echo "error: node not found in PATH" >&2; exit 1; }

NEW=("${KEPT[@]}")
for k in "${KEYS[@]}"; do
  path="$BASE/$PREFIX-${ID[$k]}/"
  gsettings set "$ITEM:$path" name "${NAME[$k]}"
  gsettings set "$ITEM:$path" command "$NODE $CTL $k"
  gsettings set "$ITEM:$path" binding "${BIND[$k]}"
  NEW+=("$path")
done
gsettings set "$SCHEMA" custom-keybindings "$(to_literal "${NEW[@]}")"

echo "Installed ${#KEYS[@]} overlay shortcuts -> $CTL"
echo "  Ctrl+Alt+U toggle   Ctrl+Alt+C cycle   Ctrl+Alt+] / [ opacity"
echo "  Ctrl+Alt+L login    Ctrl+Alt+R refresh Ctrl+Alt+Q quit"
