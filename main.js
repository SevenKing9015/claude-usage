const { app, BrowserWindow, globalShortcut, screen, ipcMain, shell } = require('electron')

const fs = require('fs')
const net = require('net')
const path = require('path')

// ---------- config ----------
const CONFIG_PATH = path.join(__dirname, 'config.json')
const defaultConfig = {
  url: 'https://claude.ai/settings/usage',
  refreshSeconds: 45,
  opacity: 0.92,
  panelOpacity: 0.85,
  width: 300,
  height: 260,
  margin: 14,
  corner: 'top-right',
  alwaysOnTopLevel: 'screen-saver',
  hotkeys: {
    toggle: 'Control+Alt+U',
    cycleCorner: 'Control+Alt+C',
    login: 'Control+Alt+L',
    refresh: 'Control+Alt+R',
    quit: 'Control+Alt+Q'
  }
}
function loadConfig () {
  try {
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
    return { ...defaultConfig, ...raw, hotkeys: { ...defaultConfig.hotkeys, ...(raw.hotkeys || {}) } }
  } catch {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }
}

// ---------- persisted runtime state ----------
let STATE_PATH, SOCK, LAST_DATA
function loadState () { try { return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8')) } catch { return {} } }
function saveState () {
  state.opacity = opacity
  state.corner = corner
  if (hud) { const [w, h] = hud.getSize(); state.width = w; state.height = h }
  try { fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2)) } catch {}
}

const CORNERS = ['top-right', 'bottom-right', 'bottom-left', 'top-left']
let cfg, state, opacity, corner, startW, startH
let hud   // the small visible HUD card
let loader // hidden window holding the logged-in claude.ai page
let timer
let startTimer // delays the first page load until the scheduled time after a restart
let warmTimer // fast poll right after a load, until the page has rendered
let autoFit = true     // auto-size window height to content — until the user resizes by hand
let fittingUntil = 0   // timestamp guard so our own setSize isn't mistaken for a manual resize

// ---------- the scraper that runs INSIDE the claude.ai page ----------
const scrapeInPage = require('./scraper')
const SCRAPE_JS = '(' + scrapeInPage.toString() + ')()'

async function scrape () {
  if (!loader || loader.webContents.isLoading()) return null
  try {
    const data = await loader.webContents.executeJavaScript(SCRAPE_JS, true)
    if (data && data.loggedIn && data.sections && data.sections.length) {
      try { fs.writeFileSync(LAST_DATA, JSON.stringify(data)) } catch {} // cache for instant paint next launch
    }
    if (hud && !hud.isDestroyed()) hud.webContents.send('usage-data', data)
    return data
  } catch (e) {
    if (hud && !hud.isDestroyed()) hud.webContents.send('usage-data', { error: String(e), loggedIn: false })
    return null
  }
}

// Right after a page load, poll quickly until the data has actually rendered,
// then fall back to the slow refresh interval. Avoids the "blank until next
// refreshSeconds tick" lag when the first scrape lands before the SPA renders.
function warmUp () {
  if (warmTimer) clearInterval(warmTimer)
  let tries = 0
  warmTimer = setInterval(async () => {
    tries++
    const d = await scrape()
    const ready = d && d.loggedIn && d.sections && d.sections.length &&
      d.sections[0].rows[0] && d.sections[0].rows[0].label
    if (ready || tries >= 20) { clearInterval(warmTimer); warmTimer = null }
  }, 1500)
}

// ---------- positioning / opacity ----------
function place () {
  if (!hud) return
  const a = screen.getDisplayMatching(hud.getBounds()).workArea
  const [w, h] = hud.getSize()
  const m = cfg.margin
  let x = a.x + m
  let y = a.y + m
  if (corner.includes('right')) x = a.x + a.width - w - m
  if (corner.includes('bottom')) y = a.y + a.height - h - m
  hud.setPosition(Math.round(x), Math.round(y))
}

// ---------- actions ----------
function toggle () {
  if (!hud) return
  if (hud.isVisible()) hud.hide()
  else { hud.show(); hud.setAlwaysOnTop(true, cfg.alwaysOnTopLevel); place() }
}
function cycleCorner () {
  corner = CORNERS[(CORNERS.indexOf(corner) + 1) % CORNERS.length]
  place(); saveState()
}
function openLogin () { if (loader) { loader.show(); loader.focus() } }
function refreshNow () { if (loader) loader.loadURL(cfg.url) } // did-finish-load triggers warmUp

// ---------- windows ----------
// hosts the loader is allowed to navigate to: claude.ai itself plus the identity
// providers its login flow legitimately hands off to (Google SSO, etc.).
const TRUSTED_HOSTS = [/(^|\.)claude\.ai$/, /(^|\.)anthropic\.com$/, /(^|\.)google\.com$/, /(^|\.)googleusercontent\.com$/]
function isTrusted (u) {
  try { const h = new URL(u).hostname; return TRUSTED_HOSTS.some(re => re.test(h)) } catch { return false }
}
function makeLoader () {
  loader = new BrowserWindow({
    width: 980, height: 760, show: false, skipTaskbar: true,
    title: 'Claude login (usage source)',
    // nodeIntegration/contextIsolation/sandbox are left at Electron's secure
    // defaults (off/on/on) — this window renders remote claude.ai content.
    webPreferences: { partition: 'persist:claude', backgroundThrottling: true }
  })
  // This window holds a logged-in session, so don't let the page wander off or
  // spawn popups to arbitrary origins. Trusted auth hosts stay in-app (so SSO
  // keeps working); anything else is bounced to the real browser instead.
  loader.webContents.setWindowOpenHandler(({ url }) => {
    if (isTrusted(url)) return { action: 'allow' }
    if (/^https?:/i.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  loader.webContents.on('will-navigate', (e, url) => {
    if (isTrusted(url)) return
    e.preventDefault()
    if (/^https?:/i.test(url)) shell.openExternal(url)
  })
  // note: we DON'T load the page here — the first load is scheduled in whenReady so
  // frequent restarts don't hammer Claude. did-finish-load (from refreshNow/scheduled
  // load) triggers warmUp.
  loader.webContents.on('did-finish-load', warmUp)
  loader.on('close', e => { if (!app.isQuitting) { e.preventDefault(); loader.hide() } })
}
function makeHud () {
  hud = new BrowserWindow({
    width: startW,
    height: startH,
    frame: false, transparent: true, backgroundColor: '#00000000',
    alwaysOnTop: true, skipTaskbar: true, resizable: true,
    fullscreenable: false, hasShadow: false, title: 'Claude Usage',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true }
  })
  hud.setAlwaysOnTop(true, cfg.alwaysOnTopLevel)
  hud.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  hud.setHasShadow(false) // belt-and-suspenders: also kill any WM/compositor window shadow
  hud.loadFile(path.join(__dirname, 'hud.html'))
  hud.webContents.on('did-finish-load', () => {
    hud.webContents.send('hud-config', { panelOpacity: cfg.panelOpacity })
    try { // show last-known numbers instantly while the live page loads
      if (fs.existsSync(LAST_DATA)) hud.webContents.send('usage-data', JSON.parse(fs.readFileSync(LAST_DATA, 'utf8')))
    } catch {}
  })
  hud.once('ready-to-show', () => { place(); hud.setOpacity(opacity) })
  hud.on('resize', () => {
    if (Date.now() > fittingUntil) { autoFit = false; state.userSized = true } // a resize we didn't cause = manual
    saveState()
  })
  hud.on('moved', saveState)
  hud.on('close', e => { if (!app.isQuitting) { e.preventDefault(); hud.hide() } })
}

// ---------- global hotkeys (X11) ----------
function reg (accel, fn, name) {
  if (!accel) return
  if (!globalShortcut.register(accel, fn)) {
    console.warn(`[overlay] could not register ${name} (${accel}) — taken by the desktop, or you're on Wayland; use overlayctl + a GNOME custom shortcut.`)
  }
}
function registerHotkeys () {
  const h = cfg.hotkeys
  reg(h.toggle, toggle, 'toggle')
  reg(h.cycleCorner, cycleCorner, 'cycleCorner')
  reg(h.login, openLogin, 'login')
  reg(h.refresh, refreshNow, 'refresh')
  reg(h.quit, () => { app.isQuitting = true; app.quit() }, 'quit')
}

// ---------- control socket (Wayland fallback / scripting) ----------
function handleCommand (line) {
  const cmd = line.trim().split(/\s+/)[0]
  const map = {
    toggle, cycle: cycleCorner, login: openLogin, refresh: refreshNow,
    quit: () => { app.isQuitting = true; app.quit() }
  }
  if (map[cmd]) map[cmd](); else console.warn('[overlay] unknown command:', line)
}
function startControlSocket () {
  try { fs.unlinkSync(SOCK) } catch {}
  const server = net.createServer(conn => {
    let buf = ''
    conn.on('data', d => {
      buf += d.toString()
      let i
      while ((i = buf.indexOf('\n')) >= 0) { const l = buf.slice(0, i); buf = buf.slice(i + 1); if (l.trim()) handleCommand(l) }
    })
  })
  server.on('error', e => console.warn('[overlay] control socket error:', e.message))
  server.listen(SOCK)
  app.on('will-quit', () => { try { server.close() } catch {}; try { fs.unlinkSync(SOCK) } catch {} })
}

// ---------- boot ----------
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', toggle)
  ipcMain.on('open-login', openLogin)
  ipcMain.on('refresh-now', refreshNow)
  ipcMain.handle('list-themes', () => {
    try { return fs.readdirSync(path.join(__dirname, 'themes')).filter(f => f.endsWith('.js')).sort() } catch { return [] }
  })
  ipcMain.on('fit-height', (_e, h) => {
    if (!hud || hud.isDestroyed() || !autoFit) return // user resized by hand → leave their size alone
    const max = Math.round(screen.getDisplayMatching(hud.getBounds()).workArea.height * 0.85)
    const height = Math.max(120, Math.min(Math.round(h), max))
    const [w, cur] = hud.getSize()
    if (height !== cur) { fittingUntil = Date.now() + 400; hud.setSize(w, height); place() }
  })
  app.whenReady().then(() => {
    STATE_PATH = path.join(app.getPath('userData'), 'overlay-state.json')
    SOCK = path.join(app.getPath('userData'), 'overlay.sock')
    LAST_DATA = path.join(app.getPath('userData'), 'last-usage.json')
    cfg = loadConfig()
    state = loadState()
    // config wins when you've edited it since last run; otherwise keep runtime tweaks
    const seen = state.cfgSeen || {}
    const edited = k => seen[k] !== cfg[k]
    opacity = (!edited('opacity') && state.opacity != null) ? state.opacity : cfg.opacity
    corner = (!edited('corner') && state.corner) ? state.corner : cfg.corner
    startW = (!edited('width') && state.width) ? state.width : cfg.width
    startH = (!edited('height') && state.height) ? state.height : cfg.height
    state.cfgSeen = { opacity: cfg.opacity, corner: cfg.corner, width: cfg.width, height: cfg.height }
    autoFit = !state.userSized // if you've resized by hand before, keep your size; else auto-fit to content
    fittingUntil = Date.now() + 4000 // grace at startup so initial layout resizes aren't read as manual
    makeLoader()
    makeHud()
    registerHotkeys()
    startControlSocket()
    // Don't hit Claude the instant we launch. Show cached numbers, and schedule the
    // first page load for (last successful scrape + refreshSeconds). Frequent restarts
    // then reuse the cache instead of hammering the source.
    const interval = Math.max(10, cfg.refreshSeconds) * 1000
    let firstDelay = 0
    try { firstDelay = Math.max(0, interval - (Date.now() - fs.statSync(LAST_DATA).mtimeMs)) } catch { firstDelay = 0 }
    const begin = () => { refreshNow(); timer = setInterval(scrape, interval) }
    if (firstDelay > 0) {
      console.log('overlay: showing cached usage; first scrape in ' + Math.round(firstDelay / 1000) + 's')
      startTimer = setTimeout(begin, firstDelay)
    } else { begin() }
  })
  app.on('will-quit', () => { clearInterval(timer); clearInterval(warmTimer); clearTimeout(startTimer); globalShortcut.unregisterAll() })
  app.on('window-all-closed', () => {}) // stay alive; quit with the quit hotkey
}
