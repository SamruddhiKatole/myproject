import { describe, expect, it } from "vitest";

import { parseEnv } from "@/server/env";

const valid = { DATABASE_URL: "postgresql://kaamsetu:secret-pw@localhost:5432/kaamsetu" };

describe("parseEnv", () => {
  it("accepts a minimal valid environment and applies defaults", () => {
    const env = parseEnv(valid);
    expect(env.NODE_ENV).toBe("development");
    expect(env.APP_BASE_URL).toBe("http://localhost:3000");
    expect(env.LOG_LEVEL).toBe("info");
    expect(env.DATABASE_URL).toBe(valid.DATABASE_URL);
  });

  it("throws when a required variable is missing", () => {
    expect(() => parseEnv({})).toThrow(/DATABASE_URL/);
  });

  it("rejects a non-postgres database URL", () => {
    expect(() => parseEnv({ DATABASE_URL: "mysql://x@y/z" })).toThrow(/postgres/);
  });

  it("rejects invalid enum and URL values, reporting every problem", () => {
    let message = "";
    try {
      parseEnv({ ...valid, NODE_ENV: "staging", LOG_LEVEL: "loud", APP_BASE_URL: "not a url" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toMatch(/NODE_ENV/);
    expect(message).toMatch(/LOG_LEVEL/);
    expect(message).toMatch(/APP_BASE_URL/);
  });

  it("never echoes secret values in the error message", () => {
    let message = "";
    try {
      parseEnv({ DATABASE_URL: "mysql://user:super-secret-password@host/db" });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).not.toContain("super-secret-password");
  });
});
