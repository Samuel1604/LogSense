import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Repository } from "typeorm";

import type { Analysis } from "../../../../src/modules/analyses/entities/analysis.entity.js";

import { TypeOrmAnalysisRepository } from "../../../../src/infrastructure/database/repositories/typeorm-analysis.repository.js";

describe("TypeOrmAnalysisRepository", () => {
  const analysis = {
    id: "analysis-123",
    filename: "application.log",
    fileSize: 1024,
    status: "queued",
  } as Analysis;

  const repository = {
    create: vi.fn(),
    findOneBy: vi.fn(),
    save: vi.fn(),
  };

  let analysisRepository: TypeOrmAnalysisRepository;

  beforeEach(() => {
    vi.clearAllMocks();

    analysisRepository = new TypeOrmAnalysisRepository(
      repository as unknown as Repository<Analysis>,
    );
  });

  describe("create", () => {
    it("should create and persist a new analysis", async () => {
      const input = {
        filename: "application.log",
        fileSize: 1024,
        storagePath: "/tmp/logsense/uploads/test-file.log",
      };

      repository.create.mockReturnValue(analysis);
      repository.save.mockResolvedValue(analysis);

      const result = await analysisRepository.create(input);

      expect(repository.create).toHaveBeenCalledWith(input);
      expect(repository.save).toHaveBeenCalledWith(analysis);
      expect(result).toBe(analysis);
    });
  });

  describe("findById", () => {
    it("should return an analysis when it exists", async () => {
      repository.findOneBy.mockResolvedValue(analysis);

      const result = await analysisRepository.findById("analysis-123");

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: "analysis-123",
      });

      expect(result).toBe(analysis);
    });

    it("should return null when the analysis does not exist", async () => {
      repository.findOneBy.mockResolvedValue(null);

      const result = await analysisRepository.findById("unknown-id");

      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: "unknown-id",
      });

      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("should persist an existing analysis", async () => {
      const updatedAnalysis = {
        ...analysis,
        status: "processing",
      } as Analysis;

      repository.save.mockResolvedValue(updatedAnalysis);

      const result = await analysisRepository.save(updatedAnalysis);

      expect(repository.save).toHaveBeenCalledWith(updatedAnalysis);
      expect(result).toBe(updatedAnalysis);
    });
  });
});
