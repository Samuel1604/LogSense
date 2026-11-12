import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  HOST: z.string().default("127.0.0.1"),

  PORT: z.coerce.number().int().min(1).max(65535).default(3000),

  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  DATABASE_HOST: z.string().min(1).default("127.0.0.1"),

  DATABASE_PORT: z.coerce.number().int().min(1).max(65535).default(5432),

  DATABASE_USER: z.string().min(1),

  DATABASE_PASSWORD: z.string(),

  DATABASE_NAME: z.string().min(1),

  DATABASE_SSL: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),

  REDIS_HOST: z.string().min(1).default("127.0.0.1"),

  REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),

  REDIS_PASSWORD: z.string().optional(),

  REDIS_DB: z.coerce.number().int().min(0).default(0),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("Invalid environment variables:");
  console.error(result.error.issues);
  process.exit(1);
}

export const env = result.data;
