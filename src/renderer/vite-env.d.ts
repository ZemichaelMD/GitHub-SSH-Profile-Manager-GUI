/// <reference types="vite/client" />

interface SshManagerAPI {
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
  showSshRsa: (profile: string) => Promise<string>;
  onProfilesUpdated: (callback: () => void) => () => void;
  refreshTrayMenu: () => void;
}

declare global {
  interface Window {
    sshManager: SshManagerAPI;
  }
}

export {};

