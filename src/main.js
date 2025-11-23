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

  // Load the appropriate HTML file based on environment
  if (app.isPackaged) {
    // In packaged app, frontend/dist is included in the package
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    // In development, try to load from built frontend first, fallback to dev server
    const distPath = path.join(__dirname, 'frontend', 'dist', 'index.html');
    if (require('fs').existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      mainWindow.loadURL('http://localhost:5173');
    }
  }
  
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

  // Auto-updater configuration
  autoUpdater.autoDownload = true; // Enable automatic download
  autoUpdater.autoInstallOnAppQuit = true; // Install update when app quits
  
  // Auto-updater events -> forward to renderer via IPC
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for updates...');
    mainWindow.webContents.send('update-checking');
  });
  
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    mainWindow.webContents.send('update-available', info);
  });
  
  autoUpdater.on('update-not-available', (info) => {
    console.log('No updates available');
    mainWindow.webContents.send('update-not-available', info);
  });
  
  autoUpdater.on('download-progress', (progress) => {
    console.log(`Download progress: ${progress.percent}%`);
    mainWindow.webContents.send('update-download-progress', progress);
  });
  
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);
    mainWindow.webContents.send('update-downloaded', info);
  });
  
  autoUpdater.on('error', (err) => {
    console.error('Update error:', err);
    mainWindow.webContents.send('update-error', { message: err && err.message });
  });

  // IPC handlers for manual update control
  ipcMain.on('apply-update', () => {
    console.log('Installing update...');
    autoUpdater.quitAndInstall();
  });
  
  ipcMain.on('check-for-updates', () => {
    console.log('Manual update check requested');
    autoUpdater.checkForUpdates();
  });
  
  ipcMain.on('download-update', () => {
    console.log('Manual download requested');
    autoUpdater.downloadUpdate();
  });

  // Check for updates on startup (only in production)
  if (app.isPackaged) {
    setTimeout(() => {
      console.log('Auto-checking for updates on startup...');
      autoUpdater.checkForUpdates();
    }, 3000); // Wait 3 seconds after app loads
  }

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

app.whenReady().then(async () => {
  // Auto-configure backend API key on first run
  if (keytar) {
    try {
      const existingKey = await keytar.getPassword('ai-assistant', 'backend_api_key');
      if (!existingKey) {
        // Set default backend API key from environment or hardcoded value
        const defaultKey = process.env.BACKEND_API_KEY || 'test-key-12345';
        await keytar.setPassword('ai-assistant', 'backend_api_key', defaultKey);
        console.log('✅ Auto-configured backend API key on first run');
      }
    } catch (err) {
      console.warn('Failed to auto-configure backend API key:', err);
    }
  }
  
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
