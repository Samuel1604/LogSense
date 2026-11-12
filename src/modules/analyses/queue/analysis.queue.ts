import { Queue } from "bullmq";

import { createRedisConnection } from "../../../infrastructure/queue/redis.js";
import type { AnalysisJobData } from "./analysis-job.js";


export const ANALYSIS_QUEUE_NAME = "analysis";

export const createAnaysisQueue = () => {
    return new Queue<AnalysisJobData>(ANALYSIS_QUEUE_NAME, {
        connection: createRedisConnection(),
    });
};