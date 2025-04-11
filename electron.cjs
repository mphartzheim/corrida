const { app, BrowserWindow, shell, Tray, Menu, ipcMain, Notification } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 775,
        height: 860,
        minWidth: 375, // iPhone standard width
        minHeight: 667, // iPhone standard height
        maxWidth: 775, // Fixed maximum width
        maxHeight: 860, // Fixed maximum height
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs')
        },
        icon: path.join(__dirname, 'src/assets/tray_icon.ico')
    });

    // In development, load from the dev server
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile('dist/index.html');
    }

    // Handle external links
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });

    // Only minimize to tray when explicitly choosing that option
    // Clicking X should close the app completely
    mainWindow.on('close', () => {
        // Allow the default close behavior (app will quit)
        app.quit();
    });

    // Add listener for minimize event
    mainWindow.on('minimize', (event) => {
        event.preventDefault();
        mainWindow.hide();
    });
}

function createTray() {
    // Use different icon paths based on platform
    const iconPath = process.platform === 'win32'
        ? path.join(__dirname, 'src/assets/tray_icon.ico')
        : path.join(__dirname, 'src/assets/tray_icon.png');

    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open Corrida',
            click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { type: 'separator' },
        {
            label: 'Exit',
            click: () => {
                app.isQuitting = true;
                app.quit();
            }
        }
    ]);

    tray.setToolTip('Corrida - F1 Race Information');
    tray.setContextMenu(contextMenu);

    // Double-click on the tray icon to show the app
    tray.on('double-click', () => {
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();

    // Register IPC handlers
    ipcMain.on('minimize-to-tray', () => {
        if (mainWindow) {
            mainWindow.hide();
        }
    });

    ipcMain.on('show-notification', (event, { title, body }) => {
        const notification = {
            title: title || 'Corrida',
            body: body || '',
            icon: path.join(__dirname, 'src/assets/tray_icon.png')
        };

        new Notification(notification).show();
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('before-quit', () => {
    // Mark the app as quitting
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});