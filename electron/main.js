const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const http = require('http');
const handler = require('serve-handler');
const fs = require('fs');

// Ensure Chromium sandbox is disabled even when launched from desktop/menu
// Equivalent to running with --no-sandbox
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
app.commandLine.appendSwitch('enable-logging');

// Optional: reduces black/blank windows on some Linux drivers
app.disableHardwareAcceleration();

// Enforce single instance so our chosen port remains stable
const singleInstanceLock = app.requestSingleInstanceLock();
if (!singleInstanceLock) {
  app.quit();
}

let mainWindow;
let server;

// Use a fixed local port so the origin stays constant and localStorage persists
const STATIC_PORT = Number(process.env.HABIT_TRACKER_PORT || 43110);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0b0f12',
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
  });

  const startUrl = process.env.ELECTRON_START_URL;
  if (startUrl) {
    mainWindow.loadURL(startUrl);
  } else {
    // In production, serve the static export over HTTP to satisfy absolute asset paths
    // Check both possible locations for unpacked files
    const possibleOutDirs = [
      path.join(__dirname, '..', 'out'), // Development
      path.join(process.resourcesPath, 'app.asar.unpacked', 'out'), // Production unpacked
      path.join(__dirname, '..', 'app.asar.unpacked', 'out') // Alternative production path
    ];
    
    let outDir = null;
    for (const dir of possibleOutDirs) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        // Verify it's actually a directory with our files
        const indexPath = path.join(dir, 'index.html');
        if (fs.existsSync(indexPath)) {
          outDir = dir;
          console.log('Found static files at:', dir);
          break;
        }
      }
    }
    
    if (!outDir) {
      console.error('Static export directory not found in any of:', possibleOutDirs);
      app.quit();
      return;
    }
    
    server = http.createServer((req, res) => {
      // Handle Next.js static assets with proper routing
      const url = req.url;
      
      // If it's a Next.js asset path, serve from _next directory
      if (url.startsWith('/_next/')) {
        const filePath = path.join(outDir, url);
        if (fs.existsSync(filePath)) {
          const ext = path.extname(filePath);
          const contentType = {
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.woff2': 'font/woff2',
            '.ico': 'image/x-icon',
            '.svg': 'image/svg+xml'
          }[ext] || 'text/plain';
          
          res.writeHead(200, { 'Content-Type': contentType });
          fs.createReadStream(filePath).pipe(res);
        } else {
          console.error('File not found:', filePath);
          res.writeHead(404);
          res.end('Not found');
        }
      } else {
        // Use serve-handler for other files
        handler(req, res, { public: outDir });
      }
    });
    
    // Prefer a fixed port to keep the origin stable for localStorage persistence.
    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${STATIC_PORT} already in use. Assuming another instance or service is serving. Loading anyway for persistence origin...`);
        mainWindow.loadURL(`http://127.0.0.1:${STATIC_PORT}`);
      } else {
        console.error('HTTP server error:', err);
        app.quit();
      }
    });

    server.listen(STATIC_PORT, '127.0.0.1', () => {
      console.log('Serving static files on port:', STATIC_PORT);
      mainWindow.loadURL(`http://127.0.0.1:${STATIC_PORT}`);
    });
  }

  // Enable DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow.isVisible()) mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Log any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('unresponsive', () => {
    console.error('Renderer became unresponsive');
  });

  mainWindow.webContents.on('render-process-gone', (_event, details) => {
    console.error('Renderer process gone:', details);
  });
}

// Focus existing window if a second instance is launched
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Handle X11 display issues when running as root
if (process.getuid && process.getuid() === 0) {
  console.log('Running as root, setting X11 display permissions...');
  process.env.DISPLAY = process.env.DISPLAY || ':0';
  
  // Try to find the correct XAUTHORITY file
  const possibleXauthPaths = [
    process.env.XAUTHORITY,
    `/home/${process.env.SUDO_USER}/.Xauthority`,
    `/home/${process.env.USER}/.Xauthority`,
    '/root/.Xauthority'
  ];
  
  for (const xauthPath of possibleXauthPaths) {
    if (xauthPath && fs.existsSync(xauthPath)) {
      process.env.XAUTHORITY = xauthPath;
      console.log('Using XAUTHORITY:', xauthPath);
      break;
    }
  }
  
  // Set additional X11 environment variables
  process.env.XDG_RUNTIME_DIR = process.env.XDG_RUNTIME_DIR || '/run/user/1000';
  process.env.DBUS_SESSION_BUS_ADDRESS = process.env.DBUS_SESSION_BUS_ADDRESS || 'unix:path=/run/user/1000/bus';
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('quit', () => {
  if (server) {
    try { 
      server.close(); 
      console.log('HTTP server closed');
    } catch (e) {
      console.error('Error closing server:', e);
    }
  }
});

