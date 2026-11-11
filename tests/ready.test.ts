import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app.js";
import type { AppContainer } from "../src/container.js";
import { isDatabaseReady } from "../src/infrastructure/database/connection.js";
import e from "express";

vi.mock("../src/infrastructure/database/connection.js", () => ({
  isDatabaseReady: vi.fn(),
}));

describe("GET /ready", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 when the database is available", async () => {
    vi.mocked(isDatabaseReady).mockResolvedValue(true);

    const container = {
      analysisController: {
        getAnalysis: vi.fn(),
        createAnalysis: vi.fn(),
      },
    } as unknown as AppContainer;

    const app = createApp(container);

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ready",
        dependencies: {
          database: "connected",
        },
      },
    });
  });

  it("returns 503 when the database is unavailable", async () => {
    vi.mocked(isDatabaseReady).mockResolvedValue(false);

    const container = {
      analysisController: {
            getAnalysis: vi.fn(),
          createAnalysis: vi.fn(),
      },
    } as unknown as AppContainer;

    const app = createApp(container);

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "SERVICE_UNAVAILABLE",
        message: "Application dependencies are unavailable",
      },
    });
  });

  it("does not expose database error details in the response", async () => {
    vi.mocked(isDatabaseReady).mockResolvedValue(false);

    const container = {
      analysisController: {
            getAnalysis: vi.fn(),
          createAnalysis: vi.fn(),
      },
    } as unknown as AppContainer;

    const app = createApp(container);

    const response = await request(app).get("/ready");

    expect(response.status).toBe(503);
    expect(response.text).not.toContain("connection string");
  });
});
