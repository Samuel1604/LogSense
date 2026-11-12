import type { Queue } from "bullmq";
import { beforeEach, describe, expect, it, vi } from "vitest";


import type { AnalysisJobDat } from "../../../src/modules/analyses/queue/analysis-job.js";
import { BullMqAnalysisJobQueue } from "../../../src/infrastructure/queue/bullmq-analysis-job-queue.js";

describe("BullMqAnalysisJobQueue", () => {
      const add = vi.fn();

  const queue = {
    add,
  } as unknown as Queue<AnalysisJobData>;

  const jobQueue = new BullMqAnalysisJobQueue(queue);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("adds an analysis job with its ID as the job ID", async () => {
    add.mockResolvedValue(undefined);

    const analysisId = "550e8400-e29b-41d4-a716-446655440000";

    await jobQueue.add(analysisId);

    expect(add).toHaveBeenCalledWith(
      "process-analysis",
      { analysisId },
      { jobId: analysisId },
    );
  });

  it("propagates queue submission errors", async () => {
    const error = new Error("Redis connection failed");

    add.mockRejectedValue(error);

    await expect(
      jobQueue.add("550e8400-e29b-41d4-a716-446655440000"),
    ).rejects.toThrow(error);
  });
})