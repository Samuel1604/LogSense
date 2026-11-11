import { rm } from "node:fs/promises"
import {afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

import { createApp } from "../../../src/app.js";
import type { AppContainer } from "../../../src/container.js";
import { AnalysisController } from "../../../src/modules/analyses/analysis.controller.js";
import type { Analysis } from "../../../src/modules/analyses/entities/analysis.entity.js";
import type { AnalysisService } from "../../../src/modules/analyses/services/analysis.service.js";
import { AppError } from "../../../src/shared/errors/app-error.js";

describe("Analysis routes", () => {
  const analysis: Analysis = {
    id: "550e8400-e29b-41d4-a716-446655440000",
    filename: "application.log",
    fileSize: 1024,
    status: "queued",
  } as Analysis;

  const analysisService = {
    getAnalysisById: vi.fn(),
    createAnalysis: vi.fn(),
  };

  const analysisController = new AnalysisController(
    analysisService as unknown as AnalysisService,
  );

  const app = createApp({
    analysisController,
  } as unknown as AppContainer);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/v1/analyses/:id", () => {
    it("returns the analysis when it exists", async () => {
      analysisService.getAnalysisById.mockResolvedValue(analysis);

      const response = await request(app).get(
        `/api/v1/analyses/${analysis.id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: analysis,
      });

      expect(analysisService.getAnalysisById).toHaveBeenCalledWith(analysis.id);
    });

    it("returns 404 when the analysis does not exist", async () => {
      analysisService.getAnalysisById.mockRejectedValue(
        new AppError("Analysis not found", 404, "ANALYSIS_NOT_FOUND"),
      );

        const nonexistentId = "650e8400-e29b-41d4-a716-446655440000";

      const response = await request(app).get(
        `/api/v1/analyses/${nonexistentId}`,
      );

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "ANALYSIS_NOT_FOUND",
          message: "Analysis not found",
        },
      });

      expect(analysisService.getAnalysisById).toHaveBeenCalledWith(
        nonexistentId,
      );
    });
  });

  describe("POST /api/v1/analyses", () => {
    it("uploads a log file and creates an analysis", async () => {
      analysisService.createAnalysis.mockResolvedValue(analysis);

      const response = await request(app)
        .post("/api/v1/analyses")
        .attach("file", Buffer.from("ERROR: Database connection failed"), {
          filename: "application.log",
          contentType: "text/plain",
        });

      expect(response.status).toBe(202);

      expect(response.body).toEqual({
        success: true,
        data: {
          analysisId: analysis.id,
          status: analysis.status,
        },
      });

      expect(analysisService.createAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({
          filename: "application.log",
          fileSize: Buffer.byteLength("ERROR: Database connection failed"),
        }),
      );

      const input = analysisService.createAnalysis.mock.calls[0][0];

      expect(input.storagePath).toBeTruthy();

      await rm(input.storagePath, { force: true });
    });

    it("returns 400 when no file is provided", async () => {
      const response = await request(app).post("/api/v1/analyses");

      expect(response.status).toBe(400);

      expect(response.body).toMatchObject({
        success: false,
        error: {
          code: "FILE_REQUIRED",
          message: "A log file is required",
        },
      });

      expect(analysisService.createAnalysis).not.toHaveBeenCalled();
    });
  });
});
