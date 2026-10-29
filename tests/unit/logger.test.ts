import { Writable } from "node:stream";

import { describe, expect, it } from "vitest";

import { createLogger, REDACTED } from "@/server/logger";

function captureLogger() {
  const lines: string[] = [];
  const destination = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  return { logger: createLogger({ level: "info", destination }), lines };
}

describe("logger redaction", () => {
  it("redacts top-level and nested phone numbers, OTPs and tokens", () => {
    const { logger, lines } = captureLogger();
    logger.info(
      {
        phone: "+919999900001",
        user: { phoneE164: "+919999900002", otp: "123456", token: "tok_abc" },
        jobId: "job_1",
      },
      "otp requested",
    );

    const output = lines.join("");
    expect(output).not.toContain("+919999900001");
    expect(output).not.toContain("+919999900002");
    expect(output).not.toContain("123456");
    expect(output).not.toContain("tok_abc");
    expect(output).toContain(REDACTED);
    // Non-sensitive context survives.
    expect(output).toContain("job_1");
  });

  it("redacts cookie and authorization headers", () => {
    const { logger, lines } = captureLogger();
    logger.info({ req: { headers: { cookie: "ks_session=abc", authorization: "Bearer xyz" } } });

    const output = lines.join("");
    expect(output).not.toContain("ks_session=abc");
    expect(output).not.toContain("Bearer xyz");
  });

  it("emits structured JSON with the app name", () => {
    const { logger, lines } = captureLogger();
    logger.info("hello");

    const entry = JSON.parse(lines[0] ?? "{}");
    expect(entry).toMatchObject({ app: "kaamsetu", msg: "hello", level: 30 });
  });
});
