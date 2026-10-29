import { z } from "zod";

/**
 * Typed, validated environment configuration.
 * `.env.example` documents every variable; add new ones in both places.
 * Later phases extend this schema (SESSION_SECRET, OTP_PEPPER, SMS_*, STORAGE_*…).
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_BASE_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().regex(/^postgres(ql)?:\/\/.+/, "must be a postgres:// connection URL"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Env = z.infer<typeof envSchema>;

/** Validates `source` and throws a readable error listing every problem. Never echoes values. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration — ${problems}`);
  }
  return result.data;
}

let cached: Env | undefined;

/** Lazily parsed so that importing a module never fails at build time. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
