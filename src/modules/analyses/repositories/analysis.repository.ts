import type { Analysis } from "../entities/analysis.entity.js";

export interface CreateAnalysisInput {
  filename: string;
  fileSize: number;
  storagePath: string;
}

export interface AnalysisRepository {
  create(input: CreateAnalysisInput): Promise<Analysis>;

  findById(id: string): Promise<Analysis | null>;

  save(analysis: Analysis): Promise<Analysis>;
}
