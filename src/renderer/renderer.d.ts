// This prevents TypeScript errors when accessing window.sshManager
// Make sure this file is included in your tsconfig.json

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
  // clearProfiles: () => Promise<boolean>;
  showSshRsa: (profile: string) => Promise<string>;
  onProfilesUpdated: (callback: () => void) => () => void;
  refreshTrayMenu: () => void;
  onSwitchProfile: (callback: (profile: string) => void) => () => void;
}

declare global {
  interface Window {
    sshManager: SshManagerAPI;
  }
}

// Export empty object to make it a module, satisfying TS requirements
export {};
