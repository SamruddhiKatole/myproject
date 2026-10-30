// Reference seed: city, localities, skill categories, optional admin. Run with `npm run db:seed`.
import { createPrismaClient } from "../../src/server/db";
import { seedAdmin, seedReferenceData } from "./reference";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");

  const db = createPrismaClient(url);
  try {
    const counts = await seedReferenceData(db);
    const admin = await seedAdmin(db, process.env.ADMIN_PHONE);
    console.log("Reference seed complete:", { ...counts, ...admin });
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
