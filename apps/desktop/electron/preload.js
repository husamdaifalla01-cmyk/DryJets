/**
 * Electron Preload Script for DryJetsOS
 *
 * Exposes safe IPC methods to renderer process via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Exposed API for renderer process
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform detection
  platform: process.platform,
  isElectron: true,

  // Storage operations
  storage: {
    save: (entity, data) => ipcRenderer.invoke('storage:save', entity, data),
    update: (entity, id, data) => ipcRenderer.invoke('storage:update', entity, id, data),
    delete: (entity, id) => ipcRenderer.invoke('storage:delete', entity, id),
    getById: (entity, id) => ipcRenderer.invoke('storage:getById', entity, id),
    list: (entity, options) => ipcRenderer.invoke('storage:list', entity, options),
    listPending: (entity) => ipcRenderer.invoke('storage:listPending', entity),
    getPendingCount: () => ipcRenderer.invoke('storage:getPendingCount'),
    triggerSync: () => ipcRenderer.invoke('storage:triggerSync'),
  },

  // Window operations
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // App info
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getPath: (name) => ipcRenderer.invoke('app:getPath', name),
  },

  // Deep link listener
  onDeepLink: (callback) => {
    ipcRenderer.on('deep-link', (event, url) => callback(url));
  },

  // Remove deep link listener
  offDeepLink: () => {
    ipcRenderer.removeAllListeners('deep-link');
  },
});

console.log('[Preload] Electron API exposed to renderer');