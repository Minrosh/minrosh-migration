import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": __dirname,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/**/*.test.mjs"],
          exclude: ["tests/website-cms*.test.mjs"],
        },
      },
      {
        extends: true,
        test: {
          name: "website-cms",
          include: ["tests/website-cms*.test.mjs"],
          setupFiles: ["tests/setup/website-cms-test-setup.mjs"],
        },
      },
    ],
  },
});
