import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnalysisService } from "../../../../src/modules/analyses/services/analysis.service.js";
import type { Analysis } from "../../../../src/modules/analyses/entities/analysis.entity.js";
import type { AnalysisRepository } from "../../../../src/modules/analyses/repositories/analysis.repository.js";
import { AppError } from "../../../../src/shared/errors/app-error.js";

describe("AnalysisService", () => {
  const analysis: Analysis = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    filename: "application.log",
    fileSize: 1024,
    storagePath: "/tmp/logsense/uploads/test-file.log",
    status: "queued",
    totalLines: 0,
    parsedLines: 0,
    unparsedLines: 0,
    totalErrors: 0,
    totalBatches: 0,
    completedBatches: 0,
    failedBatches: 0,
    currentStage: null,
    failureCode: null,
    cancellationRequestedAt: null,
    createdAt: new Date(),
    startedAt: null,
    completedAt: null,
    cancelledAt: null,
  };

  const repository: AnalysisRepository = {
    create: vi.fn(),
    findById: vi.fn(),
    save: vi.fn(),
  };

  let service: AnalysisService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AnalysisService(repository);
  });

  describe("createAnalysis", () => {
    it("creates an analysis and returns it", async () => {
      vi.mocked(repository.create).mockResolvedValue(analysis);

      const input = {
        filename: "application.log",
        fileSize: 1024,
        storagePath: "/tmp/logsense/uploads/test-file.log",
      };

      const result = await service.createAnalysis(input);

      expect(repository.create).toHaveBeenCalledWith(input);
      expect(result).toEqual(analysis);
    });
  });

  describe("getAnalysisById", () => {
    it("returns an existing analysis", async () => {
      vi.mocked(repository.findById).mockResolvedValue(analysis);

      const result = await service.getAnalysisById(analysis.id);

      expect(repository.findById).toHaveBeenCalledWith(analysis.id);
      expect(result).toEqual(analysis);
    });

    it("throws a 404 AppError when the analysis does not exist", async () => {
      vi.mocked(repository.findById).mockResolvedValue(null);

      await expect(
        service.getAnalysisById("nonexistent-id"),
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "ANALYSIS_NOT_FOUND",
        message: "Analysis not found",
      });
    });

    it("throws an instance of AppError when the analysis does not exist", async () => {
      vi.mocked(repository.findById).mockResolvedValue(null);

      await expect(
        service.getAnalysisById("nonexistent-id"),
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
