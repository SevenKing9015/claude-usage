# claude-usage-overlay

A tiny, always-on-top, semi-transparent HUD that shows **just the usage block**
from `claude.ai/settings/usage`, pinned to a corner of your screen.

It does **not** embed the whole page. A hidden window stays logged into claude.ai
and is scraped every N seconds; the numbers (`Current session`, `Weekly`, `Sonnet`,
`Daily routine runs`, …) are drawn in our own minimal card. Reads `aria-valuenow`
off each progress bar, so it survives claude.ai's CSS churn.

## Setup

```bash
cd claude-usage-overlay
npm install        # downloads Electron (~150 MB, needs network)
npm start
```

First launch: a normal claude.ai window appears so you can **log in once**
(session is persisted). After that, press the toggle hotkey and the little HUD
floats in your corner. If it ever says "login needed", press `Ctrl+Alt+L`.

## Hotkeys (X11)

| Action                 | Default          |
|------------------------|------------------|
| Show / hide HUD        | `Ctrl+Alt+U`     |
| Move to next corner    | `Ctrl+Alt+C`     |
| More opaque            | `Ctrl+Alt+]`     |
| More transparent       | `Ctrl+Alt+[`     |
| Open login window      | `Ctrl+Alt+L`     |
| Refresh now            | `Ctrl+Alt+R`     |
| Quit                   | `Ctrl+Alt+Q`     |

You can also drag the HUD by its header. Everything is editable in `config.json`
(URL, refresh interval, default corner, opacity, size, hotkeys).

## Wayland / DE-bound shortcuts

Electron's global hotkeys work on **X11** (your session). On Wayland they may not
register — in that case bind GNOME custom shortcuts to `overlayctl`:

On GNOME, just run the helper once — it wires up all seven shortcuts to
`overlayctl` for you (paths resolved from its own location, so it's portable):

```bash
./setup-wayland-hotkeys.sh          # install / refresh
./setup-wayland-hotkeys.sh --remove # tear back down
```

It uses a dedicated `claude-overlay-*` keybinding prefix, so it's idempotent and
won't touch your existing custom shortcuts. Prefer to do it by hand?

```
Settings → Keyboard → Custom Shortcuts:
  node /path/to/claude-usage-overlay/overlayctl toggle
  node /path/to/claude-usage-overlay/overlayctl cycle
  node /path/to/claude-usage-overlay/overlayctl op+
```

`overlayctl` commands: `toggle | cycle | op+ | op- | login | refresh | quit`.

## Autostart

Drop a launcher in `~/.config/autostart/claude-usage-overlay.desktop`:

```ini
[Desktop Entry]
Type=Application
Name=Claude Usage Overlay
Exec=sh -c "cd /home/tbduser/claude-usage-overlay && npm start"
X-GNOME-Autostart-enabled=true
```

## Notes

- The HUD focuses on the **limit bars** (session / weekly / Sonnet / routines).
  The credits section is $-amounts + toggles; some labels there may be blank.
- Want to skip the hidden browser entirely and hit the real JSON endpoint?
  Open DevTools → Network → filter Fetch/XHR while loading the usage page, find
  the request that returns these numbers, and wire it into `scrape()`. It needs
  your `sessionKey` cookie and is undocumented/unstable — the DOM route is safer.
