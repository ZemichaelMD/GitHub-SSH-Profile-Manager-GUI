import React, { useState, useEffect } from "react";
import ModalOverlay from "./ModalOverlay"; // Reusable overlay

interface SSHKeyModalProps {
  profileName: string;
  sshKey: string;
  onClose: () => void;
}

const SSHKeyModal: React.FC<SSHKeyModalProps> = ({
  profileName,
  sshKey,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(sshKey)
      .then(() => {
        setCopied(true);
      })
      .catch((err) => {
        console.error("Failed to copy SSH key: ", err);
        alert("Failed to copy key. Please copy manually.");
      });
  };

  // Reset copied state when key changes or modal closes/reopens
  useEffect(() => {
    setCopied(false);
    // Optional: auto-copy on open?
    // handleCopy();
  }, [sshKey]);

  // Reset copied state after a delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000); // Hide "Copied!" after 2s
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <ModalOverlay onClose={onClose}>
      {/* Modal Content */}
      <div
        className="relative z-50 w-11/12 max-w-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col"
        onClick={(e) => e.stopPropagation()} // Prevent closing on inner click
      >
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            SSH Public Key: <span className="font-bold">{profileName}</span>
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

        {/* Key Display */}
        <div className="p-4 flex-1">
          <p className="text-[11px] font-mono text-gray-700 dark:text-gray-300 break-all bg-gray-100 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 max-h-40 overflow-y-auto">
            {sshKey}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Add this key to your GitHub account under Settings → SSH and GPG
            keys.
          </p>
        </div>

        {/* Footer/Actions */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={handleCopy}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              copied
                ? "bg-green-500 text-white cursor-default"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
            disabled={copied}
          >
            {copied ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  ></path>
                </svg>
                Copy Key
              </>
            )}
          </button>
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

export default SSHKeyModal;
