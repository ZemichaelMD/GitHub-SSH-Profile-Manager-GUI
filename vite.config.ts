import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import electron from "vite-plugin-electron/simple"; // Using the simple API
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Set base to './' to ensure relative paths work correctly in Electron build
  base: "./",

  plugins: [
    // Plugin to resolve tsconfig path aliases (e.g., @renderer/*)
    tsconfigPaths(),

    // React plugin for JSX, Fast Refresh, etc.
    react(),

    // Vite plugin for Electron integration
    electron({
      main: {
        // Entry point for the Main process
        entry: "src/main/main.ts",
        vite: {
          build: {
            // Match the Node.js version Electron uses
            target: "node18", // Adjust if your Electron uses a different Node version
            sourcemap: "inline", // Embed sourcemaps for easier debugging
            outDir: "dist/main", // Output directory for main process code
            rollupOptions: {
              // Prevent bundling Electron and Node.js built-ins
              external: ["electron"],
              output: {
                format: "cjs", // Use CommonJS format for __dirname support
              },
            },
          },
        },
      },
      preload: {
        // Entry point for the Preload script
        input: path.join(__dirname, "src/main/preload.ts"),
        vite: {
          build: {
            target: "node18", // Match main process target
            sourcemap: "inline",
            outDir: "dist/main", // Often put preload script alongside main
            rollupOptions: {
              external: ["electron"],
              output: {
                format: "cjs", // Use CommonJS format
              },
            },
          },
        },
      },
      // Optional: Use Node.js API in the Renderer process
      // Usually not needed and discouraged if possible (keep nodeIntegration: false)
      // renderer: {},
    }),
  ],

  // Build options specifically for the Renderer process
  build: {
    // Output directory for renderer assets (HTML, JS, CSS, images)
    outDir: "dist/renderer",
    rollupOptions: {
      // Specify the entry point HTML file for the renderer
      input: {
        // You can add more entry points if needed (e.g., for multiple windows)
        index: path.resolve(__dirname, "src/renderer/index.html"),
      },
      // Make sure Electron can't be bundled into the renderer
      external: ["electron"],
    },
  },

  // Optional: Configure the dev server
  server: {
    // Port for the development server (Vite will handle proxying)
    port: 3000, // Or any other port you prefer
  },
});
