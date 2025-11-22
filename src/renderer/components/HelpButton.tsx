import React, { useState } from "react";
import HelpModal from "./HelpModal"; // Create this component

const HelpButton: React.FC = () => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <button
        id="helpButton"
        onClick={() => setShowHelp(true)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title="Show Help"
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
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Help</span>
      </button>
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </>
  );
};

export default HelpButton;
