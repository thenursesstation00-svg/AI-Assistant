// main.js - Final version for both Development and Production

const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let backendProcess; // This will hold the backend server process

/**
 * This function starts the backend Node.js server.
 * It's configured to run 'node src/server.js' from the 'backend' directory.
 */
function startBackend() {
  // Define the path to the backend's main server file.
  const backendPath = path.join(__dirname, 'backend', 'src', 'server.js');
  
  // Use 'spawn' to run the node command directly. This is the correct way for production.
  backendProcess = spawn('node', [backendPath], {
    // Set the working directory for the process to the 'backend' folder.
    cwd: path.join(__dirname, 'backend'),
    // Use a shell to run the command, which helps with pathing on Windows.
    shell: true
  });

  // Log any output from the backend server to the console for debugging.
  backendProcess.stdout.on('data', (data) => {
    console.log(`Backend Output: ${data}`);
  });

  // Log any errors from the backend server.
  backendProcess.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });
}

/**
 * This function creates the main application window.
 */
function createWindow() {
  // Create a new browser window with specified dimensions.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
  });

  // The 'app.isPackaged' property is true only when the app has been built into an installer.
  if (app.isPackaged) {
    // --- PRODUCTION MODE ---
    // When the app is packaged, we load the 'index.html' file directly from the disk.
    mainWindow.loadFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  } else {
    // --- DEVELOPMENT MODE ---
    // When running in development (with 'npm start'), we load from the Vite dev server.
    mainWindow.loadURL('http://localhost:5173' );
  }
}

// This method is called once Electron is ready.
app.whenReady().then(() => {
  // In production, we need to start the backend server ourselves.
  if (app.isPackaged) {
    startBackend();
  }
  
  // Create the application window.
  createWindow();
});

// This event listener handles closing the application.
app.on('window-all-closed', () => {
  // On Windows & Linux (i.e., not macOS), quitting the app should stop everything.
  if (process.platform !== 'darwin') {
    // If the backend process exists, make sure to terminate it.
    if (backendProcess) {
      backendProcess.kill();
    }
    // Quit the main application.
    app.quit();
  }
});
