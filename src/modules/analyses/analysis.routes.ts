import { Router } from "express";

import type { AnalysisController } from "./analysis.controller.js";
import { analysisIdParamsSchema } from "./analysis.schema.js";
import { validateParams } from "../../shared/middleware/validate-request.js";
import { analysisUpload } from "../../infrastructure/storage/analysis-upload.js";

export const createAnalysisRoutes = (
  controller: AnalysisController,
): Router => {
  const router = Router();

  router.post("/", analysisUpload.single("file"), controller.createAnalysis);

  router.get(
    "/:id",
    validateParams(analysisIdParamsSchema),
    controller.getAnalysis,
  );

  return router;
};
