/**
 * Runs once when the Next.js server starts. Validating the environment here makes a misconfigured
 * deployment fail immediately instead of on the first request that happens to read config.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("@/server/env");
    getEnv();
  }
}
