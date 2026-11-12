import { unlink } from "node:fs/promises";

import type { AnalysisStorage } from "../../modules/analyses/storage/analysis-storage.js";

export class LocalAnalysisStorage implements AnalysisStorage {
  async deleteFile(path: string): Promise<void> {
    await unlink(path);
  }
}