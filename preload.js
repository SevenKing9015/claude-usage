const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('overlay', {
  onData: (cb) => ipcRenderer.on('usage-data', (_e, data) => cb(data)),
  onConfig: (cb) => ipcRenderer.on('hud-config', (_e, c) => cb(c)),
  openLogin: () => ipcRenderer.send('open-login'),
  refresh: () => ipcRenderer.send('refresh-now'),
  fitHeight: (px) => ipcRenderer.send('fit-height', px),
  listThemes: () => ipcRenderer.invoke('list-themes')
})
