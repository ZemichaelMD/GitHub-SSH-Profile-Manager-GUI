import React, { useState } from "react";

interface CreateProfileFormProps {
  onProfileCreated: () => void;
  onCancel: () => void;
  existingProfiles: string[];
}

export default function CreateProfileForm({
  onProfileCreated,
  onCancel,
  existingProfiles,
}: CreateProfileFormProps) {
  const [formData, setFormData] = useState({
    profile: "",
    name: "",
    username: "",
    email: "",
    token: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null); // Clear error on change
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (
      !formData.profile ||
      !formData.name ||
      !formData.username ||
      !formData.email
    ) {
      setError(
        "Please fill in all required fields (Profile Name, Full Name, GitHub Username, Email).",
      );
      return;
    }
    if (existingProfiles.includes(formData.profile.trim())) {
      setError(
        `Profile "${formData.profile.trim()}" already exists. Choose a different name.`,
      );
      return;
    }
    // Simple email regex (adjust if needed)
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      await window.sshManager.createProfile({
        ...formData,
        profile: formData.profile.trim(), // Trim whitespace
        token: formData.token || undefined, // Pass undefined if empty
      });
      onProfileCreated(); // Notify parent component
    } catch (err: any) {
      console.error("Failed to create profile:", err);
      setError(`Error: ${err.message}`);
      setIsSubmitting(false); // Stop submitting state on error
    }
    // No finally block for setIsSubmitting, it's handled on success by unmounting/hiding
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700 animate-fade-in">
      <h2 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Create New Profile
      </h2>
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300 text-xs p-2 rounded-md mb-3 break-words">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        {(["profile", "name", "username", "email", "token"] as const).map(
          (fieldName) => (
            <div key={fieldName}>
              <label
                htmlFor={fieldName}
                className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize"
              >
                {fieldName === "profile"
                  ? "Profile Name*"
                  : fieldName === "name"
                    ? "Full Name*"
                    : fieldName === "username"
                      ? "GitHub Username*"
                      : fieldName === "email"
                        ? "Email*"
                        : "GitHub Token (Optional)"}
              </label>
              <input
                type={
                  fieldName === "email"
                    ? "email"
                    : fieldName === "token"
                      ? "password"
                      : "text"
                }
                id={fieldName}
                name={fieldName}
                value={formData[fieldName]}
                onChange={handleChange}
                required={fieldName !== "token"}
                disabled={isSubmitting}
                className="w-full px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 dark:text-white disabled:opacity-50"
                placeholder={
                  fieldName === "profile"
                    ? "e.g., work-account"
                    : fieldName === "name"
                      ? "Your Full Name"
                      : fieldName === "username"
                        ? "Your GitHub Handle"
                        : fieldName === "email"
                          ? "your-email@example.com"
                          : "ghp_..."
                }
              />
            </div>
          ),
        )}

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </>
            ) : (
              "Create Profile"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Add this to your tailwind.config.js or styles.css if needed:
/*
    @layer utilities {
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fade-in 0.3s ease-out forwards;
      }
    }
    */
