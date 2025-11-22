import React, { useState, useEffect, useCallback } from "react";
import { ProfileList } from "./components/ProfileList";
import CreateProfileForm from "./components/CreateProfileForm";
import ThemeToggle from "./components/ThemeToggle";
import HelpButton from "./components/HelpButton";
import SSHKeyModal from "./components/SSHKeyModal";

export default function App() {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sshKeyToShow, setSshKeyToShow] = useState<{
    profile: string;
    key: string;
  } | null>(null); // State for SSH key modal

  // --- Data Fetching and Updates ---

  const fetchData = useCallback(async () => {
    setError(null); // Clear previous errors
    // Don't set loading true here, causes flicker on updates
    try {
      const [list, current] = await Promise.all([
        window.sshManager.listProfiles(),
        window.sshManager.getCurrentProfile(),
      ]);
      setProfiles(list || []);
      setCurrentProfile(current);
    } catch (err: any) {
      console.error("Failed to fetch profile data:", err);
      setError(`Error loading profiles: ${err.message}`);
    } finally {
      if (isLoading) setIsLoading(false); // Only set loading false on initial load
    }
  }, [isLoading]); // Depend on isLoading to run only initially or when forced

  useEffect(() => {
    setIsLoading(true); // Set loading true only on mount
    fetchData(); // Initial data fetch

    // Setup listener for updates from main process
    const removeListener = window.sshManager.onProfilesUpdated(() => {
      console.log("Renderer received profiles-updated event.");
      fetchData(); // Refetch data when notified
    });

    // Cleanup listener on component unmount
    return () => {
      removeListener();
    };
  }, [fetchData]); // fetchData is stable due to useCallback

  // --- Event Handlers ---

  const handleSwitchProfile = async (profile: string) => {
    setError(null);
    try {
      await window.sshManager.switchProfile(profile);
      // No need to call fetchData here, the listener will handle it.
      // Optionally update state immediately for better UX, but listener provides consistency.
      // setCurrentProfile(profile); // Optimistic update (optional)
      window.sshManager.refreshTrayMenu(); // Tell main to update tray
    } catch (err: any) {
      console.error("Failed to switch profile:", err);
      setError(`Error switching profile: ${err.message}`);
      fetchData(); // Fetch again on error to ensure UI is correct
    }
  };

  const handleRemoveProfile = async (profile: string) => {
    // Add confirmation dialog
    if (
      !confirm(
        `Are you sure you want to remove profile "${profile}"? This cannot be undone.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await window.sshManager.removeProfile(profile);
      // Listener will call fetchData
      window.sshManager.refreshTrayMenu(); // Tell main to update tray
    } catch (err: any) {
      console.error("Failed to remove profile:", err);
      setError(`Error removing profile: ${err.message}`);
      fetchData(); // Fetch again on error
    }
  };

  const handleProfileCreated = () => {
    setShowCreateForm(false); // Hide form on success
    // Listener will call fetchData
    window.sshManager.refreshTrayMenu(); // Tell main to update tray
  };

  const handleShowSshKey = async (profile: string) => {
    setError(null);
    try {
      const key = await window.sshManager.showSshRsa(profile);
      setSshKeyToShow({ profile, key });
    } catch (err: any) {
      console.error("Failed to show SSH key:", err);
      setError(`Error showing SSH key: ${err.message}`);
    }
  };

  const closeSshKeyModal = () => {
    setSshKeyToShow(null);
  };

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
    setError(null); // Clear error when toggling form
  };

  // --- Render Logic ---

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col text-sm font-sf-pro bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 text-gray-800 dark:text-gray-200 overflow-hidden">
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <HelpButton />
        </div>
        <button
          onClick={toggleCreateForm}
          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            showCreateForm
              ? "bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/50 dark:hover:bg-red-900 dark:text-red-300"
              : "bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
          }`}
        >
          {showCreateForm ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 18L18 6M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Cancel</span>
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>New Profile</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 text-xs p-3 rounded-md break-words">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Create Profile Form (Conditional) */}
        {showCreateForm && (
          <CreateProfileForm
            onProfileCreated={handleProfileCreated}
            onCancel={toggleCreateForm}
            existingProfiles={profiles} // Pass existing profiles for validation
          />
        )}

        {/* Current Profile Display */}
        {!showCreateForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Current Profile
              </span>
              {currentProfile && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-xs font-medium text-green-600 dark:text-green-400">
                    Active
                  </span>
                </div>
              )}
            </div>
            <div
              className={`text-base font-semibold truncate ${
                currentProfile
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-400 dark:text-gray-500 italic"
              }`}
            >
              {currentProfile || "None Selected"}
            </div>
          </div>
        )}

        {/* Profile List */}
        {!showCreateForm && (
          <ProfileList
            profiles={profiles}
            currentProfile={currentProfile}
            onSwitch={handleSwitchProfile}
            onRemove={handleRemoveProfile}
            onShowKey={handleShowSshKey}
          />
        )}
      </main>

      {/* SSH Key Modal */}
      {sshKeyToShow && (
        <SSHKeyModal
          profileName={sshKeyToShow.profile}
          sshKey={sshKeyToShow.key}
          onClose={closeSshKeyModal}
        />
      )}
    </div>
  );
}
