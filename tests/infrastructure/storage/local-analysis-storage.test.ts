import { unlink } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LocalAnalysisStorage } from "../../../../src/infrastructure/storage/local-analysis-storage.js";

vi.mock("node:fs/promises", () => ({
  unlink: vi.fn(),
}));

describe("LocalAnalysisStorage", () => {
  const storage = new LocalAnalysisStorage();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a file using its storage path", async () => {
    vi.mocked(unlink).mockResolvedValue(undefined);

    const filePath = "/tmp/logsense/uploads/test.log";

    await storage.deleteFile(filePath);

    expect(unlink).toHaveBeenCalledWith(filePath);
  });

  it("propagates filesystem errors", async () => {
    const error = new Error("Permission denied");

    vi.mocked(unlink).mockRejectedValue(error);

    await expect(
      storage.deleteFile("/tmp/logsense/uploads/test.log"),
    ).rejects.toThrow(error);
  });
});