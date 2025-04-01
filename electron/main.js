import { app, BrowserWindow, protocol } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false // Disable web security for local file loading
    }
  });

  // Define the dist directory path
  const distPath = path.resolve(__dirname, '../dist');
  
  // Load the app using file protocol
  const startUrl = `file://${path.join(distPath, 'index.html')}?v=${Date.now()}`;
  console.log('Loading URL:', startUrl);
  console.log('Dist path:', distPath);
  
  // Load the app
  mainWindow.loadURL(startUrl);
  
  // Log loading events
  mainWindow.webContents.on('did-start-loading', () => {
    console.log('Window started loading');
  });
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Window finished loading');
    
    // Fix asset paths with a more reliable approach
    mainWindow.webContents.executeJavaScript(`
      try {
        // Check if the app is rendering
        const rootElement = document.getElementById('root');
        console.log('Root element found:', rootElement);
        console.log('Root element children:', rootElement.children.length);
        
        // Log current document state
        console.log('Document URL:', document.URL);
        console.log('Base URL:', document.baseURI);
        
        // Check if assets are loading correctly
        const links = document.querySelectorAll('link');
        console.log('CSS links:', links.length);
        links.forEach(link => console.log('Link href:', link.href));
        
        const scripts = document.querySelectorAll('script');
        console.log('Scripts:', scripts.length);
        scripts.forEach(script => console.log('Script src:', script.src));
      } catch (e) {
        console.error('Error in page script:', e);
      }
    `);
  });
  
  // Handle page load errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
    
    // Try to reload after a short delay
    setTimeout(() => {
      console.log('Attempting to reload...');
      mainWindow.loadURL(startUrl);
    }, 1000);
  });
  
  // Add DOM ready handler
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM is ready');
    
    // Inject debugging code
    mainWindow.webContents.executeJavaScript(`
      console.log('DOM is ready - from page');
      console.log('Document URL:', document.URL);
      console.log('Base URL:', document.baseURI);
      
      // Add visible content to verify rendering
      if (document.body.children.length === 0) {
        console.log('Body is empty, adding test content');
        const div = document.createElement('div');
        div.textContent = 'If you can see this text, the app is loading but React is not rendering.';
        div.style.padding = '20px';
        div.style.fontFamily = 'Arial, sans-serif';
        div.style.fontSize = '18px';
        document.body.appendChild(div);
      }
    `);
  });
  
  // Only open DevTools when in development mode with a specific flag
  // To open DevTools, run with: OPEN_DEV_TOOLS=true npm run electron:dev
  if (process.env.OPEN_DEV_TOOLS === 'true') {
    mainWindow.webContents.openDevTools();
  }

  // Emitted when the window is closed
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// Create window when Electron is ready
app.whenReady().then(() => {
  // Register protocol handler for app:// protocol
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6); // Remove 'app://'
    const filePath = path.join(__dirname, '../dist', url);
    callback({ path: filePath });
  });
  
  // Remove the custom file protocol handler as it's causing issues
  // Let Electron handle file:// protocol natively
  
  createWindow();
});

// Quit when all windows are closed
app.on('window-all-closed', function () {
  // On macOS applications keep their menu bar active until the user quits
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
  // On macOS re-create a window when dock icon is clicked and no other windows open
  if (mainWindow === null) createWindow();
});