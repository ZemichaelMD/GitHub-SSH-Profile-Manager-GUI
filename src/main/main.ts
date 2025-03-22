import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, nativeTheme } from 'electron';
import * as path from 'path';
import { createProfile, switchProfile, listProfiles, getCurrentProfile, clearProfiles, removeProfile, showSshRsa } from './sshManager';

// Hot reload for development
if (process.env.NODE_ENV === 'development') {
  try {
    require('electron-reloader')(module, {
      debug: true,
      watchRenderer: true,
      ignore: [
        'node_modules/**/*',
        'dist/**/*'
      ]
    });
  } catch (_) { console.log('Error'); }
}

declare global {
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}

let tray: Tray;
let mainWindow: BrowserWindow;

// IPC Handlers for SSH operations
ipcMain.handle('ssh:list-profiles', async () => {
  try {
    return await listProfiles();
  } catch (error: any) {
    throw new Error(`Failed to list profiles: ${error.message}`);
  }
});

ipcMain.handle('ssh:get-current-profile', async () => {
  try {
    return await getCurrentProfile();
  } catch (error: any) {
    throw new Error(`Failed to get current profile: ${error.message}`);
  }
});

ipcMain.handle('ssh:create-profile', async (_, profileData: {
  profile: string;
  name: string;
  username: string;
  email: string;
  token?: string;
}) => {
  try {
    await createProfile(
      profileData.profile,
      profileData.name,
      profileData.username,
      profileData.email,
      profileData.token
    );
    return true;
  } catch (error: any) {
    throw new Error(`Failed to create profile: ${error.message}`);
  }
});

ipcMain.handle('ssh:switch-profile', async (_, profile: string) => {
  try {
    await switchProfile(profile);
    return true;
  } catch (error: any) {
    throw new Error(`Failed to switch profile: ${error.message}`);
  }
});

ipcMain.handle('ssh:remove-profile', async (_, profile: string) => {
  try {
    await removeProfile(profile);
    return true;
  } catch (error: any) {
    throw new Error(`Failed to remove profile: ${error.message}`);
  }
});

ipcMain.handle('ssh:clear-profiles', async () => {
  try {
    await clearProfiles();
    return true;
  } catch (error: any) {
    throw new Error(`Failed to clear profiles: ${error.message}`);
  }
});

ipcMain.handle('ssh:show-ssh-rsa', async (_, profile: string) => {
  try {
    return await showSshRsa(profile);
  } catch (error: any) {
    throw new Error(`Failed to show SSH RSA: ${error.message}`);
  }
});

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 450,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
    skipTaskbar: true,
    resizable: true,
    minWidth: 400,
    maxWidth: 400,
    backgroundColor: '#00000000',
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
};

app.on('ready', () => {
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  const darkIcon = nativeImage.createFromPath(path.join(__dirname, '../renderer/tray_icon_dark.png')).resize({ width: 16, height: 16 });
  const lightIcon = nativeImage.createFromPath(path.join(__dirname, '../renderer/tray_icon_light.png')).resize({ width: 16, height: 16 });

  tray = new Tray(lightIcon);
  
  // Set initial icon based on current theme
  nativeTheme.shouldUseDarkColors ? tray.setImage(darkIcon) : tray.setImage(lightIcon);
  
  nativeTheme.on('updated', () => {
    nativeTheme.shouldUseDarkColors ? tray.setImage(darkIcon) : tray.setImage(lightIcon);
  });
  
  // let image = nativeImage.createFromPath(path.join(__dirname, '../renderer/tray_icon.png')).resize({ width: 16, height: 16 });
  // tray = new Tray(image);

  // Update the tray menu with current profile info
  const updateTrayMenu = async () => {
    const profiles = await listProfiles();
    const currentProfile = await getCurrentProfile();
    
    // Build the entire menu from scratch each time
    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Show App', 
        click: () => mainWindow.show() 
      },
      { type: 'separator' },
      {
        label: `Current Profile: ${currentProfile || 'None'}`,
        enabled: false,
      },
      {
        label: 'Switch Profile',
        submenu: profiles.map(profile => ({
          label: profile,
          type: 'radio',
          checked: profile === currentProfile,
          click: () => switchProfile(profile)
        }))
      },
      { type: 'separator' },
      { 
        label: 'Quit', 
        click: () => app.quit() 
      },
    ]);

    tray.setContextMenu(contextMenu);
  };

  // Initial menu setup
  updateTrayMenu();
  
  // Update menu every time it's opened
  tray.on('click', updateTrayMenu);
  
  createWindow();
});

app.on('window-all-closed', () => {
  app.isQuitting = true;
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});