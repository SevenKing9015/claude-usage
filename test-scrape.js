// Verifies scraper.js against a faithful slice of the real usage-page markup.
const { app, BrowserWindow } = require('electron')
const scrapeInPage = require('./scraper')
const SCRAPE_JS = '(' + scrapeInPage.toString() + ')()'

const row = (label, reset, now, value) => `
  <div class="flex w-full flex-row flex-wrap items-center justify-between gap-x-lg">
    <div class="flex w-[13rem] shrink-0 flex-col gap-xs">
      <span class="text-body text-primary">${label}</span>
      <span class="text-footnote text-secondary">${reset}</span>
    </div>
    <div class="flex flex-1 items-center gap-3 pl-6 md:max-w-xl">
      <div class="min-w-[200px] flex-1">
        <div class="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-alpha-2" role="progressbar" aria-valuenow="${now}" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <span class="min-w-[5.5rem] text-right text-footnote text-secondary">${value}</span>
    </div>
  </div>`

const HTML = `<!doctype html><html><body>
<section>
  <h3 class="settings-row-title"><span class="flex"><span>Plan usage limits</span>
    <span class="text-sm font-medium text-text-300">Max (5x)</span></span></h3>
  ${row('Current session', 'Resets in 2 hr 54 min', 18, '18% used')}
</section>
<section>
  <h3 class="settings-row-title">Weekly limits</h3>
  ${row('All models', 'Resets Fri 4:00 PM', 10, '10% used')}
  ${row('Sonnet only', "You haven't used Sonnet yet", 0, '0% used')}
</section>
<section>
  <h3 class="settings-row-title">Additional features</h3>
  <div class="flex w-full flex-row flex-wrap items-center justify-between gap-x-lg">
    <div class="flex w-[13rem] shrink-0 flex-col gap-xs">
      <span class="text-body text-primary">Daily included routine runs</span>
      <span class="text-footnote text-secondary">You haven't run any routines yet</span>
    </div>
    <div class="flex flex-1 items-center gap-3 pl-6 md:max-w-xl">
      <div class="min-w-[200px] flex-1">
        <div class="relative flex h-2 w-full items-center overflow-hidden rounded-full bg-alpha-2" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
      <span class="text-right text-footnote text-secondary"><span class="tabular-nums">0 / 15</span></span>
    </div>
  </div>
</section>
<section><div class="flex"><span class="text-footnote text-secondary">Last updated: just now</span></div></section>
</body></html>`

app.disableHardwareAcceleration()
app.commandLine.appendSwitch('no-sandbox')
app.whenReady().then(async () => {
  const w = new BrowserWindow({ show: false })
  await w.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(HTML))
  const data = await w.webContents.executeJavaScript(SCRAPE_JS, true)
  console.log(JSON.stringify(data, null, 2))
  app.exit(0)
})
