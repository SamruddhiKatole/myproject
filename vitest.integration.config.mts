import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

// Makes TEST_DATABASE_URL from .env available to the test workers.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the real environment (CI)
}

// Integration tests share one database, so files run one at a time.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
