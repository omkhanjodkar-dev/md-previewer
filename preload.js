const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onFileOpened: (callback) => ipcRenderer.on('open-file-from-main', (event, filePath) => callback(filePath)),
  readFileContent: (filePath) => ipcRenderer.invoke('read-file-content', filePath),
});
