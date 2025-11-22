import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

// Define the shape of the exposed API
export interface SshManagerAPI {
  listProfiles: () => Promise<string[]>;
  getCurrentProfile: () => Promise<string | null>;
  createProfile: (profileData: {
    profile: string;
    name: string;
    username: string;
    email: string;
    token?: string;
  }) => Promise<boolean>;
  switchProfile: (profile: string) => Promise<boolean>;
  removeProfile: (profile: string) => Promise<boolean>;
  // clearProfiles: () => Promise<boolean>; // Consider if this is needed/safe for GUI
  showSshRsa: (profile: string) => Promise<string>;
  onProfilesUpdated: (callback: () => void) => () => void; // Function to register listener
  refreshTrayMenu: () => void; // Ask main process to update tray
}

contextBridge.exposeInMainWorld("sshManager", {
  listProfiles: () => ipcRenderer.invoke("ssh:list-profiles"),
  getCurrentProfile: () => ipcRenderer.invoke("ssh:get-current-profile"),
  createProfile: (profileData) =>
    ipcRenderer.invoke("ssh:create-profile", profileData),
  switchProfile: (profile) => ipcRenderer.invoke("ssh:switch-profile", profile),
  removeProfile: (profile) => ipcRenderer.invoke("ssh:remove-profile", profile),
  // clearProfiles: () => ipcRenderer.invoke('ssh:clear-profiles'),
  showSshRsa: (profile) => ipcRenderer.invoke("ssh:show-ssh-rsa", profile),
  // Listener for updates from main process
  onProfilesUpdated: (callback: () => void) => {
    const listener = (_event: IpcRendererEvent) => callback();
    ipcRenderer.on("profiles-updated", listener);
    // Return a cleanup function to remove the listener
    return () => {
      ipcRenderer.removeListener("profiles-updated", listener);
    };
  },
  // Ask main process to update tray
  refreshTrayMenu: () => ipcRenderer.send("refresh-tray-menu"), // Use send for one-way notification
} as SshManagerAPI);

// Optional: Expose theme change handling if needed in React
contextBridge.exposeInMainWorld("darkMode", {
  toggle: () => ipcRenderer.invoke("dark-mode:toggle"),
  system: () => ipcRenderer.invoke("dark-mode:system"),
});
