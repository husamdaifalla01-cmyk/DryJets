/**
 * Electron Main Process for DryJetsOS Desktop
 *
 * Features:
 * - Native window management
 * - SQLite database integration
 * - System tray icon
 * - Auto-updates
 * - Deep linking
 * - Native notifications
 */

import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { SqliteAdapter } from '../../../packages/storage/adapters/sqlite-adapter';

// Keep reference to window to prevent garbage collection
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let storageAdapter: SqliteAdapter | null = null;

// Environment
const isDev = process.env.NODE_ENV === 'development';
const isProduction = !isDev;

/**
 * Create main window
 */
function createWindow() {
  // Create browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    backgroundColor: '#0F1419', // Dark theme background
    show: false, // Show only when ready
    titleBarStyle: 'hiddenInset', // macOS modern titlebar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Security
      sandbox: true,
      webSecurity: true,
    },
  });

  // Load app
  if (isDev) {
    // Development: Load from Next.js dev server
    mainWindow.loadURL('http://localhost:3002/dashboard');

    // Open DevTools
    mainWindow.webContents.openDevTools();
  } else {
    // Production: Load from built files
    mainWindow.loadURL(
      url.format({
        pathname: path.join(__dirname, '../out/index.html'),
        protocol: 'file:',
        slashes: true,
      })
    );
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in browser
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  // Cleanup on close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * Create system tray
 */
function createTray() {
  // Create tray icon
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/tray-icon.png')
  );

  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  // Context menu
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open DryJetsOS',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        } else {
          createWindow();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Sync Now',
      click: async () => {
        if (storageAdapter) {
          try {
            await storageAdapter.triggerSync();
            // TODO: Show native notification
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('DryJetsOS');

  // Click to show window
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

/**
 * Initialize storage adapter
 */
async function initStorage() {
  const dbPath = path.join(app.getPath('userData'), 'dryjets.db');

  storageAdapter = new SqliteAdapter(
    {
      autoSyncInterval: 30000,
      batchSize: 50,
      maxRetries: 3,
      debug: isDev,
    },
    dbPath
  );

  await storageAdapter.init();

  console.log('[Main] Storage adapter initialized at:', dbPath);
}

/**
 * Setup IPC handlers
 */
function setupIPC() {
  // Storage operations
  ipcMain.handle('storage:save', async (event, entity: string, data: any) => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.saveLocal(entity, data);
  });

  ipcMain.handle('storage:update', async (event, entity: string, id: string, data: any) => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.updateLocal(entity, id, data);
  });

  ipcMain.handle('storage:delete', async (event, entity: string, id: string) => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.deleteLocal(entity, id);
  });

  ipcMain.handle('storage:getById', async (event, entity: string, id: string) => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.getById(entity, id);
  });

  ipcMain.handle('storage:list', async (event, entity: string, options: any) => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.list(entity, options);
  });

  ipcMain.handle('storage:listPending', async (event, entity: string) => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.listPending(entity);
  });

  ipcMain.handle('storage:getPendingCount', async () => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.getPendingCount();
  });

  ipcMain.handle('storage:triggerSync', async () => {
    if (!storageAdapter) throw new Error('Storage not initialized');
    return await storageAdapter.triggerSync();
  });

  // Window operations
  ipcMain.handle('window:minimize', () => {
    mainWindow?.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow?.close();
  });

  // App info
  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:getPath', (event, name: any) => {
    return app.getPath(name);
  });

  console.log('[Main] IPC handlers registered');
}

/**
 * App ready
 */
app.whenReady().then(async () => {
  try {
    // Initialize storage
    await initStorage();

    // Setup IPC
    setupIPC();

    // Create window
    createWindow();

    // Create tray (optional)
    if (isProduction) {
      createTray();
    }

    console.log('[Main] App ready');
  } catch (error) {
    console.error('[Main] Initialization error:', error);
    app.quit();
  }
});

/**
 * Activate (macOS)
 */
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/**
 * Window all closed
 */
app.on('window-all-closed', () => {
  // On macOS, keep app running in background
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * Before quit
 */
app.on('before-quit', async () => {
  // Close storage adapter
  if (storageAdapter) {
    storageAdapter.close();
  }

  console.log('[Main] App quitting');
});

/**
 * Handle deep links (e.g., dryjets://order/123)
 */
app.setAsDefaultProtocolClient('dryjets');

app.on('open-url', (event, url) => {
  event.preventDefault();

  console.log('[Main] Deep link:', url);

  // Parse URL and navigate
  if (mainWindow) {
    mainWindow.show();
    mainWindow.focus();

    // Send to renderer
    mainWindow.webContents.send('deep-link', url);
  }
});

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('[Main] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Main] Unhandled rejection:', reason);
});