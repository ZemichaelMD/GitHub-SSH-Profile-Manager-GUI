import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
  nativeImage,
  nativeTheme,
} from "electron";
import * as path from "path";
import {
  createProfile,
  switchProfile,
  listProfiles,
  getCurrentProfile,
  clearProfiles,
  removeProfile,
  showSshRsa,
} from "./sshManager";

let mainWindow: BrowserWindow;
(app as any).isQuitting = false;

// Hot reload for development (Keep this if you use electron-reloader)
// if (process.env.NODE_ENV === "development") {
//   try {
//     require("electron-reloader")(module, {
//       debug: true,
//       watchRenderer: true,
//       ignore: [
//         "node_modules/**/*",
//         "dist/**/*", // Adjust if your build output is elsewhere
//       ],
//     });
//   } catch (_) {
//     console.log("Error: electron-reloader not found.");
//   } // Improved error message
// }

// ... (rest of main.ts remains largely the same)

// --- Keep IPC Handlers ---
ipcMain.handle("ssh:list-profiles", async () => {
  try {
    return await listProfiles();
  } catch (error: any) {
    console.error("Error in ssh:list-profiles:", error); // Add logging
    throw new Error(`Failed to list profiles: ${error.message}`);
  }
});

ipcMain.handle("ssh:get-current-profile", async () => {
  try {
    return await getCurrentProfile();
  } catch (error: any) {
    console.error("Error in ssh:get-current-profile:", error); // Add logging
    throw new Error(`Failed to get current profile: ${error.message}`);
  }
});

ipcMain.handle(
  "ssh:create-profile",
  async (
    _,
    profileData: {
      profile: string;
      name: string;
      username: string;
      email: string;
      token?: string;
    },
  ) => {
    try {
      await createProfile(
        profileData.profile,
        profileData.name,
        profileData.username,
        profileData.email,
        profileData.token,
      );
      // Notify renderer about the change (optional but good practice)
      mainWindow?.webContents.send("profiles-updated");
      await updateTrayMenu(); // Update tray menu after creation
      return true;
    } catch (error: any) {
      console.error("Error in ssh:create-profile:", error); // Add logging
      throw new Error(`Failed to create profile: ${error.message}`);
    }
  },
);

ipcMain.handle("ssh:switch-profile", async (_, profile: string) => {
  try {
    await switchProfile(profile);
    // Notify renderer about the change
    mainWindow?.webContents.send("profiles-updated");
    await updateTrayMenu(); // Update tray menu after switch
    return true;
  } catch (error: any) {
    console.error("Error in ssh:switch-profile:", error); // Add logging
    throw new Error(`Failed to switch profile: ${error.message}`);
  }
});

ipcMain.handle("ssh:remove-profile", async (_, profile: string) => {
  try {
    await removeProfile(profile);
    // Notify renderer about the change
    mainWindow?.webContents.send("profiles-updated");
    await updateTrayMenu(); // Update tray menu after removal
    return true;
  } catch (error: any) {
    console.error("Error in ssh:remove-profile:", error); // Add logging
    throw new Error(`Failed to remove profile: ${error.message}`);
  }
});

// Clear profiles handler - use with caution!
// ipcMain.handle('ssh:clear-profiles', async () => {
//   try {
//     await clearProfiles();
//     mainWindow?.webContents.send('profiles-updated');
//     await updateTrayMenu();
//     return true;
//   } catch (error: any) {
//     console.error("Error in ssh:clear-profiles:", error); // Add logging
//     throw new Error(`Failed to clear profiles: ${error.message}`);
//   }
// });

ipcMain.handle("ssh:show-ssh-rsa", async (_, profile: string) => {
  try {
    return await showSshRsa(profile);
  } catch (error: any) {
    console.error("Error in ssh:show-ssh-rsa:", error); // Add logging
    throw new Error(`Failed to show SSH RSA: ${error.message}`);
  }
});

// --- Keep Window Creation ---
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 500, // Slightly taller to accommodate UI better
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false, // Important for security
      devTools: process.env.NODE_ENV === "development", // Open DevTools in dev
    },
    show: false,
    skipTaskbar: false, // Show in taskbar so it's easier to manage
    resizable: true, // Allow resizing
    frame: true, // Show system title bar
    // transparent: true, // Disable transparency for standard window
    // backgroundColor: "#00000000",
  });

  // Load the HTML file that will host your React app
  // IMPORTANT: This path assumes your build process outputs index.html
  // to `dist/renderer/index.html`. Adjust if necessary.
  if (process.env.NODE_ENV === "development") {
    // Use webpack-dev-server URL in development if applicable
    // mainWindow.loadURL('http://localhost:...'); // Example
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
    mainWindow.webContents.openDevTools({ mode: "detach" }); // Open dev tools automatically
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("close", (event) => {
    if (!(app as any).isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    // No return false needed here
  });

  // Hide the window when it loses focus (optional, common for tray apps)
  // mainWindow.on("blur", () => {
  //   if (!mainWindow.webContents.isDevToolsFocused()) {
  //     mainWindow.hide();
  //   }
  // });
};

// --- Keep Tray Logic ---
let tray: Tray | null = null; // Initialize as null

// Debounce tray update function to avoid rapid calls
let updateTrayTimeout: NodeJS.Timeout | null = null;
const debounceUpdateTrayMenu = () => {
  if (updateTrayTimeout) clearTimeout(updateTrayTimeout);
  updateTrayTimeout = setTimeout(updateTrayMenu, 150); // Adjust delay as needed
};

// Update the tray menu with current profile info
const updateTrayMenu = async () => {
  if (!tray) return; // Don't run if tray hasn't been created yet

  try {
    const profiles = await listProfiles();
    const currentProfile = await getCurrentProfile();

    const switchSubmenu: Electron.MenuItemConstructorOptions[] =
      profiles.length > 0
        ? profiles.map((profile) => ({
            label: profile,
            type: "radio",
            checked: profile === currentProfile,
            click: async () => {
              // Make click handler async
              try {
                await switchProfile(profile);
                // No need to manually update UI here, IPC handler will notify renderer
                // updateTrayMenu() will be called implicitly via the switchProfile IPC handler
              } catch (error) {
                console.error(`Failed to switch profile via tray: ${error}`);
                // Optionally show an error dialog to the user
              }
            },
          }))
        : [{ label: "No profiles yet", enabled: false }];

    const contextMenu = Menu.buildFromTemplate([
      {
        label: "Show App",
        click: () => {
          if (!mainWindow || mainWindow.isDestroyed()) {
            createWindow();
          } else {
            mainWindow.show();
          }
        },
      },
      { type: "separator" },
      {
        label: `Active: ${currentProfile || "None"}`,
        enabled: false,
      },
      {
        label: "Switch Profile",
        submenu: switchSubmenu,
        enabled: profiles.length > 0, // Disable if no profiles exist
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          (app as any).isQuitting = true;
          app.quit();
        },
      },
    ]);

    tray.setToolTip(`SSH Profiles (${currentProfile || "None"})`); // Useful tooltip
    tray.setContextMenu(contextMenu);
  } catch (error) {
    console.error("Failed to update tray menu:", error);
    // Fallback menu in case of error
    const errorMenu = Menu.buildFromTemplate([
      { label: "Error loading profiles", enabled: false },
      { type: "separator" },
      { label: "Show App", click: () => mainWindow?.show() },
      {
        label: "Quit",
        click: () => {
          (app as any).isQuitting = true;
          app.quit();
        },
      },
    ]);
    tray.setContextMenu(errorMenu);
  }
};

// --- Keep App Lifecycle Events ---
app.on("ready", () => {
  // Hide dock icon on macOS
  if (process.platform === "darwin") {
    app.dock.hide();
  }

  // Create Tray Icon
  // It's better practice to place assets outside the src folder, e.g., in an 'assets' folder
  // and configure your build process to copy them.
  // Assuming icons are copied to the output directory structure like `dist/renderer/assets/`
  const iconFolder =
    process.env.NODE_ENV === "development"
      ? path.join(__dirname, "../renderer/assets")
      : path.join(process.resourcesPath, "renderer/assets");

  const getIconPath = (iconName: string) =>
    path.join(__dirname, "../renderer", iconName);

  try {
    const darkIcon = nativeImage
      .createFromPath(getIconPath("tray_icon_dark.png"))
      .resize({ width: 16, height: 16 });
    const lightIcon = nativeImage
      .createFromPath(getIconPath("tray_icon_light.png"))
      .resize({ width: 16, height: 16 });

    tray = new Tray(nativeTheme.shouldUseDarkColors ? darkIcon : lightIcon);

    // Update icon when theme changes
    nativeTheme.on("updated", () => {
      if (tray) {
        // Check if tray exists
        const icon = nativeTheme.shouldUseDarkColors ? darkIcon : lightIcon;
        tray.setImage(icon);
      }
    });

    // Update menu when tray is clicked (debounced) or right-clicked
    tray.on("click", debounceUpdateTrayMenu);
    tray.on("right-click", debounceUpdateTrayMenu); // Standard context menu trigger

    // Initial menu setup
    updateTrayMenu(); // Call directly first time
  } catch (iconError) {
    console.error("Error creating tray icon:", iconError);
    // Handle error, maybe quit or show a dialog
    app.quit();
    return;
  }

  createWindow();
});

// Make sure isQuitting is set correctly
app.on("window-all-closed", () => {
  // On macOS it's common to keep the app running even if all windows are closed
  // But for a tray app, we might want different behavior.
  // Since we hide on close, this might not be triggered unless the user forces quit.
  // Keep the isQuitting logic in 'before-quit'
  if (process.platform !== "darwin") {
    // Consider if you *really* want to quit here for a tray app
    // app.quit();
  }
});

app.on("before-quit", () => {
  console.log("App is quitting...");
  (app as any).isQuitting = true;
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  // For a tray app, this might mean showing the existing hidden window.
  if (BrowserWindow.getAllWindows().length === 0) {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createWindow();
    } else {
      mainWindow.show(); // Show existing hidden window
    }
  } else {
    mainWindow?.show(); // Show existing hidden window if dock is clicked
  }
});

// Listen for updates from renderer to refresh the tray menu
ipcMain.on("refresh-tray-menu", () => {
  console.log("Received refresh-tray-menu request");
  updateTrayMenu();
});
