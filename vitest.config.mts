import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Database tests run separately: `npm run test:integration` (vitest.integration.config.mts).
    include: ["tests/unit/**/*.test.ts"],
    restoreMocks: true,
  },
});
