import pino from "pino";
import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_LEVEL,

  base: {
    service: "logsense",
    env: env.NODE_ENV,
  },

  redact: {
    paths: [
      "password",
      "token",
      "apiKey",
      "secret",
      "authorization",
      "cookie",
      "req.headers.authorization",
      "req.headers.cookie",
    ],
    censor: "[REDACTED]",
  },
});
