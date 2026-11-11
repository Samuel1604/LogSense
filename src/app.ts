import express from "express";
import { pinoHttp } from "pino-http";

import type { AppContainer } from "./container.js";
import { logger } from "./infrastructure/logger.js";
import { errorHandler } from "./shared/errors/error-handler.js";
import { isDatabaseReady } from "./infrastructure/database/connection.js";

import { createAnalysisRoutes } from "./modules/analyses/analysis.routes.js";

export const createApp = (container: AppContainer) => {
  const app = express();

  app.use(pinoHttp({ logger }));

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  app.get("/ready", async (_req, res) => {
    const databaseReady = await isDatabaseReady();

    if (!databaseReady) {
      res.status(503).json({
        success: false,
        error: {
          code: "SERVICE_UNAVAILABLE",
          message: "Application dependencies are unavailable",
        },
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: {
        status: "ready",
        dependencies: {
          database: "connected",
        },
      },
    });
  });

  app.use(
    "/api/v1/analyses",
    createAnalysisRoutes(container.analysisController),
  );

  // Error handlers always after all routes.

  app.use(errorHandler);

  return app;
};
