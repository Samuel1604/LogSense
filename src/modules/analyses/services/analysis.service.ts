import type { Analysis } from "../entities/analysis.entity.js";
import type {
  AnalysisRepository,
  CreateAnalysisInput,
} from "../repositories/analysis.repository.js";
import { AppError } from "../../../shared/errors/app-error.js";

export class AnalysisService {
  constructor(private readonly analysisRepository: AnalysisRepository) {}

  async createAnalysis(input: CreateAnalysisInput): Promise<Analysis> {
    return this.analysisRepository.create(input);
  }

  async getAnalysisById(id: string): Promise<Analysis> {
    const analysis = await this.analysisRepository.findById(id);

    if (!analysis) {
      throw new AppError("Analysis not found", 404, "ANALYSIS_NOT_FOUND");
    }

    return analysis;
  }
}
