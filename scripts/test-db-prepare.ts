// Creates the integration-test database (if missing) and applies migrations to it.
// Usage: npm run db:test:prepare   (reads TEST_DATABASE_URL from the environment or .env)
import { execSync } from "node:child_process";

import { Client } from "pg";

try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the real environment
}

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) throw new Error("TEST_DATABASE_URL is not set (see .env.example)");
if (testUrl === process.env.DATABASE_URL && process.env.CI !== "true") {
  throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL: tests empty every table");
}

const url = new URL(testUrl);
const dbName = decodeURIComponent(url.pathname.slice(1));
if (!/^[a-z0-9_]+$/.test(dbName)) throw new Error(`Unexpected test database name: ${dbName}`);

async function main(url: string) {
  const admin = new URL(url);
  admin.pathname = "/postgres";
  const client = new Client({ connectionString: admin.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      dbName,
    ]);
    if (rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database ${dbName}`);
    }
  } finally {
    await client.end();
  }

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}

main(testUrl).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
