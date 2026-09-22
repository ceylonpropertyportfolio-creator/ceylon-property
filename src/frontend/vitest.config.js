import { fileURLToPath, URL } from "url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/**
 * Vitest configuration for the frontend suite.
 *
 * The DOM environment is supplied by the `test` script
 * (`vitest run --environment jsdom`); this file only mirrors the app's Vite
 * aliases so tests resolve `@/...` and `declarations/...` exactly as the app
 * does, and keeps the React plugin for JSX transform.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(new URL("../declarations", import.meta.url)),
      },
      {
        find: "@",
        replacement: fileURLToPath(new URL("./src", import.meta.url)),
      },
    ],
    dedupe: ["@icp-sdk/core"],
  },
  test: {
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
    restoreMocks: true,
    // The build container exports thread-count env vars that conflict with
    // Vitest's fork pool defaults; pin a single worker explicitly so the pool
    // is constructed deterministically.
    pool: "forks",
    poolOptions: {
      forks: {
        minForks: 1,
        maxForks: 1,
      },
    },
  },
});
