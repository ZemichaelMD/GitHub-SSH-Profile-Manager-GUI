import React from "react";

interface ModalOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

const ModalOverlay: React.FC<ModalOverlayProps> = ({ children, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in-fast"
      onClick={onClose} // Close when clicking the overlay itself
    >
      {children}
    </div>
  );
};

export default ModalOverlay;

// Add this to your CSS/Tailwind config if needed:
/*
    @layer utilities {
      @keyframes fade-in-fast {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .animate-fade-in-fast {
        animation: fade-in-fast 0.2s ease-out forwards;
      }
    }
    */
