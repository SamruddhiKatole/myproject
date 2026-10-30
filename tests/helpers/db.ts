import { createPrismaClient } from "@/server/db";
import type { PrismaClient } from "@/generated/prisma/client";

let client: PrismaClient | undefined;

/**
 * Integration tests empty every table, so they use their own database at TEST_DATABASE_URL
 * (prepare it with `npm run db:test:prepare`). Only CI's throwaway database may equal DATABASE_URL.
 */
export function getTestDb(): PrismaClient {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL must be set for integration tests");
  if (url === process.env.DATABASE_URL && process.env.CI !== "true") {
    throw new Error("TEST_DATABASE_URL must differ from DATABASE_URL outside CI");
  }
  client ??= createPrismaClient(url);
  return client;
}

/** Empties every application table (keeps Prisma's migration history). */
export async function resetDatabase(db: PrismaClient) {
  const rows = await db.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (rows.length === 0) return;
  const tables = rows.map((r) => `"public"."${r.tablename}"`).join(", ");
  await db.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE`);
}

let phoneCounter = 0;
/** Reserved fake test range +91999990xxxx (never a real subscriber number). */
export function testPhone() {
  phoneCounter += 1;
  return `+91999990${String(phoneCounter).padStart(4, "0")}`;
}
