import { defineConfig, env } from "prisma/config";

// Prisma 7 does not load .env itself. Node 24 can, so no dotenv dependency is needed.
// CI sets the variables directly, and there is no .env file there.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the real environment
}

// Prisma 7 reads the connection URL here rather than from schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
