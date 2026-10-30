import { getDb } from "@/server/db";
import { getLogger } from "@/server/logger";

export const dynamic = "force-dynamic";

/**
 * Health check for uptime monitoring: the app is up and can reach Postgres.
 * Returns 503 (without error details) when the database is unreachable.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  const time = new Date().toISOString();
  try {
    await getDb().$queryRaw`SELECT 1`;
    return Response.json({ status: "ok", service: "kaamsetu", db: "ok", time }, { headers });
  } catch (error) {
    getLogger().error({ err: error }, "health check: database unreachable");
    return Response.json(
      { status: "degraded", service: "kaamsetu", db: "down", time },
      { status: 503, headers },
    );
  }
}
