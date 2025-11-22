import React, { useState } from "react";

interface ProfileListProps {
  profiles: string[];
  currentProfile: string | null;
  onSwitch: (profile: string) => void;
  onRemove: (profile: string) => void;
  onShowKey: (profile: string) => void;
}

export function ProfileList({
  profiles,
  currentProfile,
  onSwitch,
  onRemove,
  onShowKey,
}: ProfileListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h2 className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Manage Profiles
        </h2>
      </div>

      {/* List Items */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[calc(100vh-200px)] overflow-y-auto">
        {" "}
        {/* Constrain height */}
        {profiles.length === 0 ? (
          <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
            No profiles found. Click "New Profile" to create one.
          </div>
        ) : (
          profiles.map((profile) => (
            <ProfileItem
              key={profile}
              profile={profile}
              isCurrent={profile === currentProfile}
              onSwitch={() => onSwitch(profile)}
              onRemove={() => onRemove(profile)}
              onShowKey={() => onShowKey(profile)}
            />
          ))
        )}
      </div>
    </div>
  );
}


interface ProfileItemProps {
  profile: string;
  isCurrent: boolean;
  onSwitch: () => void;
  onRemove: () => void;
  onShowKey: () => void;
}

export function ProfileItem({
  profile,
  isCurrent,
  onSwitch,
  onRemove,
  onShowKey,
}: ProfileItemProps) {
  const [isActionLoading, setIsActionLoading] = useState(false); // Basic loading state for actions

  const handleAction = async (actionFn: () => Promise<void> | void) => {
    setIsActionLoading(true);
    try {
      await actionFn();
    } catch (e) {
      console.error("Action failed", e);
      // Error handled in App.tsx
    } finally {
      // Short delay to show feedback if needed, or remove setTimeout
      setTimeout(() => setIsActionLoading(false), 100);
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3 transition-colors ${
        isCurrent
          ? "bg-green-50 dark:bg-green-900/30"
          : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
      }`}
    >
      {/* Profile Info */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isCurrent ? "bg-green-100 dark:bg-green-800" : "bg-gray-100 dark:bg-gray-700"}`}
        >
          <svg
            className={`w-4 h-4 ${isCurrent ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div className="overflow-hidden">
          <p
            className="text-sm font-medium text-gray-900 dark:text-white truncate"
            title={profile}
          >
            {profile}
          </p>
          {isCurrent && (
            <p className="text-xs text-green-600 dark:text-green-400">Active</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-shrink-0 items-center gap-1 ml-2">
        {isActionLoading ? (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <>
            {!isCurrent && (
              <button
                onClick={() => handleAction(onSwitch)}
                className="p-1.5 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Switch to this profile"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </button>
            )}
            {!isCurrent && (
              <button
                onClick={() => handleAction(onRemove)}
                className="p-1.5 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Remove profile"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
            {isCurrent && (
              <div
                className="p-1.5 text-green-500 dark:text-green-400"
                title="Currently active profile"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            )}
            <button
              onClick={() => handleAction(onShowKey)}
              className="p-1.5 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Show SSH public key"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}