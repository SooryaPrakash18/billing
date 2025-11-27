// electron-main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const child_process = require('child_process');

let serverProcess = null;
let win = null;

function startServer() {
  // Start your Node server as a child process so it runs inside EXE.
  // It assumes server/index.js is the entrypoint.
  const serverPath = path.join(__dirname, 'server', 'index.js');
  serverProcess = child_process.fork(serverPath, {
    env: { ...process.env, NODE_ENV: 'production', PORT: 5000 },
    silent: true
  });

  serverProcess.on('error', (err) => console.error('Server error', err));
  serverProcess.on('exit', (code) => console.log('Server exited', code));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1200, height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });
  // load the same URL our Express serves
  win.loadURL('https://billing-ki8l.onrender.com');
  // win.webContents.openDevTools();
  win.on('closed', () => (win = null));
}

app.on('ready', () => {
  startServer();
  // wait a short time for server to start, or poll it in production
  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
  if (serverProcess) serverProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
