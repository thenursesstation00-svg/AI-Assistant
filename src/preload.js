const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal runtime config to the renderer in a safe way.
// Read BACKEND_API_KEY from the environment (set by the packager or runtime).
const APP_CONFIG = {
  BACKEND_API_KEY: process.env.BACKEND_API_KEY || null,
  VITE_API_URL: process.env.VITE_API_URL || null
};

contextBridge.exposeInMainWorld('__APP_CONFIG__', APP_CONFIG);

// Expose a limited updater interface to the renderer
contextBridge.exposeInMainWorld('electronUpdater', {
  checkForUpdates: () => ipcRenderer.send('check-for-updates'),
  downloadUpdate: () => ipcRenderer.send('download-update'),
  applyUpdate: () => ipcRenderer.send('apply-update'),
  on: (channel, cb) => {
    const allowed = [
      'update-checking',
      'update-available',
      'update-not-available',
      'update-download-progress',
      'update-downloaded',
      'update-error'
    ];
    if(!allowed.includes(channel)) return;
    ipcRenderer.on(channel, (event, data) => cb(data));
  },
  removeListener: (channel, cb) => {
    ipcRenderer.removeListener(channel, cb);
  }
});

// Expose secure backend key store methods (backed by keytar in main)
contextBridge.exposeInMainWorld('backendKeyStore', {
  getKey: async () => {
    try {
      return await ipcRenderer.invoke('secure-backend-key-get');
    } catch (e) { return null; }
  },
  setKey: async (key) => {
    try { return await ipcRenderer.invoke('secure-backend-key-set', key); } catch (e) { return false; }
  },
  deleteKey: async () => {
    try { return await ipcRenderer.invoke('secure-backend-key-delete'); } catch (e) { return false; }
  }
});
