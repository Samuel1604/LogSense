import { unlink } from "node:fs/promises";
import type { Request, Response, NextFunction } from "express";

import type { AnalysisService } from "./services/analysis.service.js";
import { AppError } from "../../shared/errors/app-error.js";

export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  getAnalysis = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const analysis = await this.analysisService.getAnalysisById(
        req.params.id,
      );

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      next(error);
    }
  };

  createAnalysis = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      if (!req.file) {
        throw new AppError("A log file is required", 400, "FILE_REQUIRED");
      }

      const analysis = await this.analysisService.createAnalysis({
        filename: req.file.originalname,
        fileSize: req.file.size,
        storagePath: req.file.path,
      });

      res.status(202).json({
        success: true,
        data: {
          analysisId: analysis.id,
          status: analysis.status,
        },
      });
    } catch (error) {
      if (req.file?.path) {
        try {
          await unlink(req.file.path);
        } catch (cleanupError) {
          // Don't replace the original error with a cleanup error.
        }
      }

      next(error);
    }
  };
}
