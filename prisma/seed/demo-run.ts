// Entry point for `npm run db:seed:demo`.
import { createPrismaClient } from "../../src/server/db";
import { seedDemoData } from "./demo";

try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the real environment
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const db = createPrismaClient(url);
seedDemoData(db)
  .then((counts) => console.log("Demo seed complete:", counts))
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
