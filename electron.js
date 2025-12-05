import { app, BrowserWindow, protocol, ipcMain } from 'electron';
import path from 'path';
import url from 'url';
import fs from 'fs/promises'; // Use fs.promises for async operations
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract markdown file path from arguments
function getMarkdownFilePath(args) {
  // In a packaged app, the first few arguments are usually electron executable path, app path, etc.
  // We're looking for the first argument that ends with .md
  // On Windows, when associated, the file path might be quoted.
  const filePath = args.find(arg => arg.endsWith('.md') || arg.endsWith('.markdown'));
  return filePath;
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, // Disable Node.js integration
      contextIsolation: true, // Enable context isolation
      webSecurity: false // Disable for local file serving, enable for remote content
    },
    show: false, // Don't show until ready
  });

  const appURL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:5173' // Vite dev server URL
    : url.format({
        pathname: path.join(__dirname, 'dist', 'index.html'),
        protocol: 'file:',
        slashes: true
      });

  mainWindow.loadURL(appURL);

  // Handle file association arguments if the app is already open
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      const filePath = getMarkdownFilePath(commandLine);
      if (filePath) {
          mainWindow.webContents.send('open-file-from-main', filePath);
      }
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // Open the DevTools.
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Handle file association arguments on initial launch
    const filePath = getMarkdownFilePath(process.argv);
    if (filePath) {
        // Send the file path to the renderer process to be displayed
        mainWindow.webContents.send('open-file-from-main', filePath);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Set as default protocol handler for .md files on Windows
if (process.platform === 'win32') {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const appPath = isDevelopment ? app.getPath('exe') : app.getPath('exe'); // During development, use exe path

  if (app.isPackaged) {
    // For packaged app, the handler is usually registered by the installer
    // For un-packaged, we might need to register it for dev purposes
    // app.setAsDefaultProtocolClient('md'); // This registers a custom protocol, not file type
  } else {
    // For development, manually associate .md files if not already done
    // This is complex and usually done by an installer.
    // Electron's setAsDefaultProtocolClient is for custom protocols, not file types.
    // File associations on Windows are typically managed via the registry.
    // For dev, it's easier to manually set "Open with" or a .reg file.
  }
}

// IPC handler for reading file content
ipcMain.handle('read-file-content', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error('Failed to read file:', filePath, error);
    return `Error reading file: ${error.message}`;
  }
});


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

// Register a custom file protocol for loading local files (optional, but good practice)
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, bypassCSP: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true } }
]);