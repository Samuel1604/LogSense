import {Redis} from "ioredis";
import type { Redis as RedisClient } from "ioredis";

import { env } from "../../config/env.js";

export const createRedisConnection = (): RedisClient => {
  return new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    password: env.REDIS_PASSWORD || undefined,
    db: env.REDIS_DB,
    maxRetriesPerRequest: null,
  });
};