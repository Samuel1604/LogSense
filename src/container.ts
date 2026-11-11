import type { DataSource } from "typeorm";

import { Analysis } from "./modules/analyses/entities/analysis.entity.js";
import { AnalysisService } from "./modules/analyses/services/analysis.service.js";
import { AnalysisController } from "./modules/analyses/analysis.controller.js";
import { TypeOrmAnalysisRepository } from "./infrastructure/database/repositories/typeorm-analysis.repository.js";

export const createContainer = (dataSource: DataSource) => {
  const analysisRepository = new TypeOrmAnalysisRepository(
    dataSource.getRepository(Analysis),
  );

  const analysisService = new AnalysisService(analysisRepository);

  const analysisController = new AnalysisController(analysisService);

  return {
    analysisRepository,
    analysisService,
    analysisController,
  };
};

export type AppContainer = ReturnType<typeof createContainer>;
