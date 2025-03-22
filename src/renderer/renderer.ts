let currentProfileName: string | null = null;

// Update UI with current profile
async function updateCurrentProfile() {
  const currentProfileElement = document.getElementById("currentProfile");
  if (currentProfileElement) {
    currentProfileName = await window.sshManager.getCurrentProfile();
    currentProfileElement.textContent = currentProfileName || "None";
  }
}

// Update profile list
async function updateProfileList() {
  const profileListElement = document.getElementById("profileList");
  if (!profileListElement) return;

  const profiles = await window.sshManager.listProfiles();
  profileListElement.innerHTML = "";

  if (profiles.length === 0) {
    profileListElement.innerHTML =
      '<div class="text-gray-400 text-xs">No profiles available</div>';
    return;
  }

  profiles.forEach((profile, index) => {
    // Add profile element
    const profileElement = document.createElement("div");
    profileElement.className = `flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${profile == currentProfileName ? "bg-green-50 dark:bg-green-900/20" : ""}`;
    profileElement.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white">${profile}</p>
            ${profile == currentProfileName ? '<p class="text-xs text-green-500">Active Profile</p>' : ''}
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${profile !== currentProfileName
            ? `
            <button class="switch-profile p-1.5 text-gray-500 hover:text-green-500 dark:text-gray-400 dark:hover:text-green-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-profile="${profile}" title="Switch Profile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
            <button class="remove-profile p-1.5 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-profile="${profile}" title="Remove Profile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>`
            : `
            <button disabled class="p-1.5 text-green-500 dark:text-green-400 rounded-md bg-green-50 dark:bg-green-900/20" title="Current Profile">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>`
          }
          <button class="show-ssh-rsa p-1.5 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" data-profile="${profile}" title="Show SSH Key">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </button>
        </div>
      `;

    profileListElement.appendChild(profileElement);
  });

  // Add event listeners for buttons
  document.querySelectorAll(".switch-profile").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const profile = (e.currentTarget as HTMLButtonElement).dataset.profile;
      if (profile) {
        try {
          await window.sshManager.switchProfile(profile);
          await updateCurrentProfile();
          await updateProfileList();
          alert(`Profile "${profile}" switched successfully`);
        } catch (error: any) {
          alert(`Failed to switch profile: ${error.message}`);
        }
      }
    });
  });

  document.querySelectorAll(".remove-profile").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const profile = (e.currentTarget as HTMLButtonElement).dataset.profile;
      if (
        profile &&
        confirm(`Are you sure you want to remove profile "${profile}"?`)
      ) {
        try {
          await window.sshManager.removeProfile(profile);
          await updateCurrentProfile();
          await updateProfileList();
          alert(`Profile "${profile}" removed successfully`);
        } catch (error: any) {
          alert(`Failed to remove profile: ${error.message}`);
        }
      }
    });
  });

  document.querySelectorAll(".show-ssh-rsa").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const profile = (e.currentTarget as HTMLButtonElement).dataset.profile;
  
      if (profile) {
        const sshKey = await window.sshManager.showSshRsa(profile);
  
        // Create overlay for modal
        const overlay = document.createElement("div");
        overlay.className = "fixed inset-0 bg-black/30 backdrop-blur-sm z-40";
        document.body.appendChild(overlay);
  
        // Create modal container
        const modal = document.createElement("div");
        modal.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-lg p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg";
  
        // Modal content
        const trimmedSshKey = sshKey.slice(0, 150) + "..."; // Trimmed key example
        modal.innerHTML = `
          <h2 class="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3">SSH Key</h2>
          <p class="text-[10px] text-gray-600 dark:text-gray-400 break-words max-h-40 overflow-y-auto">
            ${trimmedSshKey}
          </p>
        `;
  
        // Modal actions container
        const modalActions = document.createElement("div");
        modalActions.className = "mt-3 flex justify-end gap-1.5";
  
        // Close button
        const closeButton = document.createElement("button");
        closeButton.className = "px-2 py-1 text-[10px] bg-gray-500 text-white rounded-sm hover:bg-gray-600";
        closeButton.innerText = "Close";
        closeButton.addEventListener("click", () => {
          overlay.remove();
          modal.remove();
        });
        modalActions.appendChild(closeButton);
  
        // Copy button
        const copyButton = document.createElement("button");
        copyButton.className = "px-2 py-1 text-[10px] bg-blue-500 text-white rounded-sm hover:bg-blue-600";
        copyButton.innerText = "Copy";
        copyButton.addEventListener("click", () => {
          navigator.clipboard.writeText(sshKey);
          alert("SSH Key copied to clipboard!");
        });
        modalActions.appendChild(copyButton);
  
        modal.appendChild(modalActions);
        document.body.appendChild(modal);
      }
    });
  });
}

// Create Profile Form Handling
document.getElementById("createProfile")?.addEventListener("click", () => {
  const form = document.getElementById("create-profile-form-container");
  const createButton = document.getElementById("createProfile");
  if (form && createButton) {
    form.classList.remove("hidden");
    createButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="text-xs font-medium">Cancel New Profile</span>
    `;
    createButton.id = "cancelCreate";
  }
});

// Handle both cancel buttons (the one in the form and the one in the top bar)
document.addEventListener("click", (e) => {
  const target = e.target as HTMLElement;
  const cancelButton = target.closest("#cancelCreate");
  
  if (cancelButton) {
    const form = document.getElementById("create-profile-form-container");
    const button = document.getElementById("cancelCreate");
    if (form && button) {
      form.classList.add("hidden");
      (form.querySelector("form") as HTMLFormElement).reset();
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L12 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M2 12L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span class="text-xs font-medium">New Profile</span>
      `;
      button.id = "createProfile";
    }
  }
});

document
  .getElementById("profileForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      await window.sshManager.createProfile({
        profile: formData.get("profile") as string,
        name: formData.get("name") as string,
        username: formData.get("username") as string,
        email: formData.get("email") as string,
        token: (formData.get("token") as string) || undefined,
      });

      // Reset and hide form
      (e.target as HTMLFormElement).reset();
      const form = document.getElementById("create-profile-form-container");
      if (form) form.classList.add("hidden");

      // Update UI
      await updateCurrentProfile();
      await updateProfileList();
    } catch (error: any) {
      alert(`Failed to create profile: ${error.message}`);
    }
  });

// Help Dialog
document.getElementById("helpButton")?.addEventListener("click", () => {
  // Create overlay for modal
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/30 backdrop-blur-sm z-40";
  document.body.appendChild(overlay);

  // Create modal container
  const modal = document.createElement("div");
  modal.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-11/12 max-w-lg max-h-[90vh] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg flex flex-col";

  // Modal content
  const content = document.createElement("div");
  content.className = "p-4 overflow-y-auto flex-1";
  content.innerHTML = `
    <h2 class="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3">How to Use GitHub SSH Profile Manager</h2>
    <div class="space-y-4 text-[10px] text-gray-600 dark:text-gray-400">
      <div>
        <h3 class="font-medium mb-1">Creating a New Profile</h3>
        <ol class="list-decimal list-inside space-y-1">
          <li>Click the "New Profile" button in the top right</li>
          <li>Fill in your profile details (name, GitHub username, email)</li>
          <li>Optionally add your GitHub token for enhanced functionality</li>
          <li>Click "Create" to generate your profile</li>
        </ol>
      </div>
      <div>
        <h3 class="font-medium mb-1">Adding SSH Key to GitHub</h3>
        <ol class="list-decimal list-inside space-y-1">
          <li>Click the key icon next to your profile to view your SSH key</li>
          <li>Copy the SSH key to your clipboard</li>
          <li>Go to GitHub Settings → SSH and GPG keys</li>
          <li>Click "New SSH key"</li>
          <li>Give your key a title (e.g., "Work Laptop")</li>
          <li>Paste your SSH key and click "Add SSH key"</li>
        </ol>
      </div>
      <div>
        <h3 class="font-medium mb-1">Managing Profiles</h3>
        <ul class="list-disc list-inside space-y-1">
          <li>Use the switch icon to change between profiles</li>
          <li>Use the key icon to view your SSH key</li>
          <li>Use the trash icon to remove a profile</li>
          <li>Use "Clear All" to remove all profiles</li>
        </ul>
      </div>
    </div>
  `;
  modal.appendChild(content);

  // Modal actions container
  const modalActions = document.createElement("div");
  modalActions.className = "p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-1.5";

  // Close button
  const closeButton = document.createElement("button");
  closeButton.className = "px-2 py-1 text-[10px] bg-gray-500 text-white rounded-sm hover:bg-gray-600";
  closeButton.innerText = "Close";
  closeButton.addEventListener("click", () => {
    overlay.remove();
    modal.remove();
  });
  modalActions.appendChild(closeButton);

  modal.appendChild(modalActions);
  document.body.appendChild(modal);
});

// Initialize
document.addEventListener("DOMContentLoaded", async () => {
  await updateCurrentProfile();
  await updateProfileList();
});
