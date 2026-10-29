import pino, { type DestinationStream, type Logger } from "pino";

import { getEnv } from "@/server/env";

/**
 * Fields that must never reach logs (PII and secrets). Phone numbers are PII under the DPDP Act;
 * OTPs and session tokens are credentials. Extend this list whenever a new sensitive field appears.
 */
export const REDACT_PATHS = [
  "phone",
  "phoneE164",
  "otp",
  "otpCode",
  "token",
  "sessionToken",
  "*.phone",
  "*.phoneE164",
  "*.otp",
  "*.otpCode",
  "*.token",
  "*.sessionToken",
  "req.headers.cookie",
  "req.headers.authorization",
];

export const REDACTED = "[REDACTED]";

interface LoggerOptions {
  level?: string;
  destination?: DestinationStream;
}

export function createLogger({ level = "info", destination }: LoggerOptions = {}): Logger {
  const options: pino.LoggerOptions = {
    level,
    base: { app: "kaamsetu" },
    redact: { paths: REDACT_PATHS, censor: REDACTED },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  return destination ? pino(options, destination) : pino(options);
}

let instance: Logger | undefined;

export function getLogger(): Logger {
  instance ??= createLogger({ level: getEnv().LOG_LEVEL });
  return instance;
}
