import path from "node:path";
import { defineConfig } from "vitest/config.js";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
