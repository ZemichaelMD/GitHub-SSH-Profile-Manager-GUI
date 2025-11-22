import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css"; // <-- IMPORT YOUR TAILWIND CSS FILE HERE
import App from "./App";
// Augment window interface (do this in a separate .d.ts file ideally, e.g., renderer.d.ts)
declare global {
  interface Window {
    sshManager: import("../main/preload").SshManagerAPI; // Use the interface type
  }
}

const container = document.getElementById("root"); // Changed ID to 'root'
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  console.error(
    "Failed to find the root element. Make sure your index.html has <div id='root'></div>.",
  );
}
