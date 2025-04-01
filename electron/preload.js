// Preload script for Electron
import { contextBridge } from 'electron';

// Expose any APIs needed by the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Add any functions you want to expose to the renderer here
  // For example: getAppVersion: () => process.env.npm_package_version
});

// Log when preload script is executed
console.log('Preload script executed');