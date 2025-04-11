const { contextBridge, shell, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    "electron", {
    openExternal: (url) => {
        shell.openExternal(url);
    },
    minimizeToTray: () => {
        ipcRenderer.send('minimize-to-tray');
    },
    showNotification: (title, body) => {
        ipcRenderer.send('show-notification', { title, body });
    }
}
);