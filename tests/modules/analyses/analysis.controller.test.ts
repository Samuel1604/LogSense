import type { Request, Response, NextFunction } from "express";
import { beforeEach, describe, expect, it, vi} from "vitest";

import { AnalysisController } from "../../../src/modules/analyses/analysis.controller.js";
import type { Analysis } from "../../../src/modules/analyses/entities/analysis.entity.js";
import type { AnalysisService } from "../../../src/modules/analyses/services/analysis.service.js";
import type { AnalysisStorgae } from "../../../src/modules/analyses/storage/analysis-storage.js";


describe("AnalysisController", () => {
  const analysis = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    filename: "application.log",
    fileSize: 1024,
    status: "queued",
  } as Analysis;

  const analysisService = {
    getAnalysisById: vi.fn(),
    createAnalysis: vi.fn()
  } as unknown as AnalysisService;

  const analysisStorage = {
    deleteFile: vi.fn(),
  } as unknown as AnalysisStorage;

  const controller = new AnalysisController(analysisService, analysisStorage);

  const response = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAnalysis", () => {
    it("retrieves an analysis using the request parameter", async () => {
      vi.mocked(analysisService.getAnalysisById).mockResolvedValue(analysis);

      const request = {
        params: { id: analysis.id },
      } as Request<{ id: string }>;

      await controller.getAnalysis(request, response, next);

      expect(analysisService.getAnalysisById).toHaveBeenCalledWith(analysis.id);
    });

    it("returns 200 with the analysis", async () => {
      vi.mocked(analysisService.getAnalysisById).mockResolvedValue(analysis);

      const request = {
        params: { id: analysis.id },
      } as Request<{ id: string }>;

      await controller.getAnalysis(request, response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith({
        success: true,
        data: analysis,
      });
    });

    it("forwards service errors to the error handler", async () => {
      const error = new Error("Unexpected failure");

      vi.mocked(analysisService.getAnalysisById).mockRejectedValue(error);

      const request = {
        params: { id: analysis.id },
      } as Request<{ id: string }>;

      await controller.getAnalysis(request, response, next);

      expect(next).toHaveBeenCalledWith(error);
      expect(response.status).not.toHaveBeenCalled();
    });
  });

  describe("createAnalysis", () => {
   it("removes the uploaded file when analysis creation fails", async () => {
      const error = new Error("Database connection failed");
      const filePath = "/tmp/logsense/uploads/test.log";

      vi.mocked(analysisService.createAnalysis).mockRejectedValue(error);
      vi.mocked(analysisStorage.deleteFile).mockResolvedValue(undefined);

      const request = {
        file: {
          originalname: "application.log",
          size: 1024,
          path: filePath,
        },
      } as Request;

      await controller.createAnalysis(request, response, next);

      expect(analysisStorage.deleteFile).toHaveBeenCalledWith(filePath);
      expect(next).toHaveBeenCalledWith(error);
      expect(response.status).not.toHaveBeenCalled();
    });
  });
});
