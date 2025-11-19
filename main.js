const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess;

function startBackend() {
  const backendPath = path.join(__dirname, 'backend', 'src', 'server.js');
  backendProcess = spawn('node', [backendPath], {
    cwd: path.join(__dirname, 'backend'),
    shell: true
  });
  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));
}

function createWindow() {
  const mainWindow = new BrowserWindow({ width: 1200, height: 800 });
  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:5173' );
  }
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    startBackend();
  }
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
