import React from "react";
import ModalOverlay from "./ModalOverlay"; // Reusable overlay component

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <ModalOverlay onClose={onClose}>
      {/* Modal Content */}
      <div
        className="relative z-50 w-11/12 max-w-md max-h-[80vh] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            How to Use
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto flex-1 text-xs text-gray-600 dark:text-gray-400 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Creating a Profile
            </h3>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>Click the "New Profile" button.</li>
              <li>
                Fill in the required details (marked with *). Profile Name
                should be unique (e.g., `personal`, `work-project`).
              </li>
              <li>
                Optionally add a GitHub Personal Access Token (classic or
                fine-grained with repo access) if needed by other tools (this
                app doesn't directly use it for git operations yet).
              </li>
              <li>
                Click "Create Profile". An SSH key pair (`id_rsa` and
                `id_rsa.pub`) will be generated specifically for this profile.
              </li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Adding SSH Key to GitHub
            </h3>
            <ol className="list-decimal list-inside space-y-1 pl-2">
              <li>
                Click the{" "}
                <svg
                  className="inline w-3 h-3 align-text-bottom"
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
                </svg>{" "}
                (key) icon next to the desired profile.
              </li>
              <li>Click the "Copy Key" button in the modal.</li>
              <li>Go to your GitHub Account Settings → SSH and GPG keys.</li>
              <li>Click "New SSH key" or "Add SSH key".</li>
              <li>
                Give it a recognizable Title (e.g., "Work Laptop - Personal
                Profile").
              </li>
              <li>Paste the copied key into the "Key" field.</li>
              <li>Click "Add SSH key".</li>
            </ol>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Switching Profiles
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Click the{" "}
                <svg
                  className="inline w-3 h-3 align-text-bottom"
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
                </svg>{" "}
                (switch) icon next to the profile you want to activate.
              </li>
              <li>
                The app copies the correct `id_rsa`, `id_rsa.pub`, and
                `.gitconfig` to your main `~/.ssh/` and `~/` directories and
                updates the global git config.
              </li>
              <li>
                The "Active" indicator will update, and the Tray icon menu will
                reflect the change.
              </li>
              <li>
                Your `git` commands in the terminal will now use the selected
                profile's identity.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Removing Profiles
            </h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Click the{" "}
                <svg
                  className="inline w-3 h-3 align-text-bottom"
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
                </svg>{" "}
                (trash) icon next to the profile to remove.
              </li>
              <li>
                Confirm the action. This permanently deletes the profile's
                directory and keys from `~/.ssh/profiles/`.
              </li>
              <li>
                You cannot remove the currently active profile. Switch to
                another one first.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

export default HelpModal;
