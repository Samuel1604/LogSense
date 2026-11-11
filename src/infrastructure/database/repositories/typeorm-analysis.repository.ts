import type { Repository } from "typeorm";

import type { Analysis } from "../../../modules/analyses/entities/analysis.entity.js";

import type {
  AnalysisRepository,
  CreateAnalysisInput,
} from "../../../modules/analyses/repositories/analysis.repository.js";

export class TypeOrmAnalysisRepository implements AnalysisRepository {
  constructor(private readonly repository: Repository<Analysis>) {}

  async create(input: CreateAnalysisInput): Promise<Analysis> {
    const analysis = this.repository.create(input);

    return this.repository.save(analysis);
  }

  async findById(id: string): Promise<Analysis | null> {
    return this.repository.findOneBy({ id });
  }

  async save(analysis: Analysis): Promise<Analysis> {
    return this.repository.save(analysis);
  }
}
