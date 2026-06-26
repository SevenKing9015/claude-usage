// One-off diagnostic: scrape the LIVE usage page using the saved login session.
const { app, BrowserWindow } = require('electron')
const scrapeInPage = require('./scraper')
const SCRAPE_JS = '(' + scrapeInPage.toString() + ')()'

app.setPath('userData', '/home/tbduser/.config/claude-usage-overlay') // reuse persist:claude login
app.commandLine.appendSwitch('no-sandbox')
app.disableHardwareAcceleration()

const URL = 'https://claude.ai/settings/usage'
const sleep = ms => new Promise(r => setTimeout(r, ms))

app.whenReady().then(async () => {
  const w = new BrowserWindow({ show: false, webPreferences: { partition: 'persist:claude' } })
  await w.loadURL(URL)
  let data
  for (let i = 0; i < 15; i++) {
    await sleep(1500)
    data = await w.webContents.executeJavaScript(SCRAPE_JS, true)
    const firstLabel = data && data.sections[0] && data.sections[0].rows[0] && data.sections[0].rows[0].label
    if (firstLabel) break  // wait until labels have rendered, not just the bars
  }
  console.log('FINAL_URL ' + (data && data.href))
  console.log(JSON.stringify(data, null, 2))
  app.exit(0)
})
