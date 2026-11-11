import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { createApp } from "../src/app";
import type { AppContainer } from "../src/container";

describe("GET /health", () => {
  it("returns a successful health check response", async () => {
    const container = {
      analysisController: {
        getAnalysis: vi.fn(),
        createAnalysis: vi.fn(),
      },
    } as unknown as AppContainer;

    const app = createApp(container);
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        status: "ok",
      },
    });
  });
});
