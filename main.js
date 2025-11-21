// main.js (FINAL "No Spawn" Version)

const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
let autoUpdater;
try {
  // electron-updater is optional for local/dev runs. If it's not installed, fall back to a noop implementation.
  ({ autoUpdater } = require('electron-updater'));
} catch (e) {
  console.warn('electron-updater not available; auto-update features disabled.');
  autoUpdater = {
    autoDownload: false,
    checkForUpdates: async () => ({}) ,
    quitAndInstall: () => {},
    on: () => {}
  };
}
const path = require('path');
let keytar;
try {
  keytar = require('keytar');
} catch (e) {
  console.warn('keytar not available. Secure key storage will be disabled.');
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // This version ALWAYS loads from the frontend/dist folder.
  // It assumes the backend is running separately.
  mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  
  // Optional: Uncomment the line below if you want developer tools to open.
  // mainWindow.webContents.openDevTools();

  // Simple application menu (replace default menus)
  const template = [
    {
      label: 'File',
      submenu: [
        { role: 'quit' }
      ]
    },
    {
      label: 'App',
      submenu: [
        { label: 'Check for updates', click: () => { autoUpdater.checkForUpdates(); } },
        { type: 'separator' },
        { role: 'toggledevtools' }
      ]
    }
  ];
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // Auto-updater events -> forward to renderer via IPC
  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', (info) => { mainWindow.webContents.send('update-available', info); });
  autoUpdater.on('update-not-available', () => { mainWindow.webContents.send('update-not-available'); });
  autoUpdater.on('update-downloaded', (info) => { mainWindow.webContents.send('update-downloaded', info); });
  autoUpdater.on('error', (err) => { mainWindow.webContents.send('update-error', { message: err && err.message }); });

  ipcMain.on('apply-update', () => {
    // Quit and install the update
    autoUpdater.quitAndInstall();
  });
  ipcMain.on('check-for-updates', () => {
    autoUpdater.checkForUpdates();
  });

  // Secure backend API key storage via OS keychain (if keytar is available)
  const SERVICE_NAME = 'ai-assistant';
  const ACCOUNT_NAME = 'backend_api_key';

  ipcMain.handle('secure-backend-key-get', async () => {
    try {
      if (!keytar) return null;
      const val = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      return val || null;
    } catch (err) {
      console.error('Error getting backend key from keytar', err);
      return null;
    }
  });

  ipcMain.handle('secure-backend-key-set', async (event, key) => {
    try {
      if (!keytar) return false;
      if (!key) {
        await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
        return true;
      }
      await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, key);
      return true;
    } catch (err) {
      console.error('Error setting backend key via keytar', err);
      return false;
    }
  });

  ipcMain.handle('secure-backend-key-delete', async () => {
    try {
      if (!keytar) return false;
      await keytar.deletePassword(SERVICE_NAME, ACCOUNT_NAME);
      return true;
    } catch (err) {
      console.error('Error deleting backend key via keytar', err);
      return false;
    }
  });
}

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
