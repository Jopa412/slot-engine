const { app, BrowserWindow } = require('electron');
const path = require('path');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Slot Engine',
    icon: path.join(__dirname, isDevelopment ? 'static' : '', 'favicon.ico'),
    backgroundColor: '#000000',
    autoHideMenuBar: isDevelopment ? false : true,
    resizable: isDevelopment ? true : false,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      contextIsolation: false,
    },
  });

  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
