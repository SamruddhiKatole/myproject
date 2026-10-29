/**
 * Liveness check for uptime monitoring. P2 adds a database ping.
 */
export function GET() {
  return Response.json(
    { status: "ok", service: "kaamsetu", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
