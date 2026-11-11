import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";

import { AppError } from "../../../src/shared/errors/app-error";
import { errorHandler } from "../../../src/shared/errors/error-handler";

const createTestApp = () => {
    const app = express();

    app.get("/operational-error", (_req, _res, next) => {
        next(
            new AppError(
                "Unsupported file format",
                415,
                "UNSUPPORTED_FILE_FORMAT",
            )
        );
    });

    app.get("/internal-error", (_req, _res, next) => {
        next(
            new AppError(
                "Database connection credentials exposed",
                500,
                "DATABASE_FAILURE",
                false
            )
        );
    });

    app.get("/unexpected-error", (_req, _res, next) => {
        next(new Error("Unexpected internal failure"));
    });

    app.use(errorHandler);

    return app;
}

describe("Error handler middleware", () => {
    const app = createTestApp();

    it("returns the assigned response for operational errors", async () => {
        const response = await request(app).get("/operational-error");

        expect(response.status).toBe(415);
        expect(response.body).toEqual({
            success: false,
            error: {
                code: "UNSUPPORTED_FILE_FORMAT",
                message: "Unsupported file format"
            }
        });
    });

    it("hides non-operational error details and returns a generic response", async () => {
        const response = await request(app).get("/internal-error");

        expect(response.status).toBe(500);
        expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
        expect(response.body.error.message).toBe("An unexpected error occurred. Please try again later.");

        expect(response.text).not.toContain(
            "Database connection credentials exposed",
        );
    });

    it("handles unexpected native errors safely and returns a generic response", async () => {
        const response = await request(app).get("/unexpected-error");

        expect(response.status).toBe(500);
        expect(response.body.error.code).toBe("INTERNAL_SERVER_ERROR");
        expect(response.body.error.message).toBe(
            "An unexpected error occurred. Please try again later.",
        );
    });
});