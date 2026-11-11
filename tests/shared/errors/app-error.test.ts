import { describe, expect, it } from "vitest";
import { AppError } from "../../../src/shared/errors/app-error";

describe("AppError", () => {
    it("created an operational application error by default", () => {
        const error = new AppError(
            "Unsupported file format",
            415,
            "UNSUPPORTED_FILE_FORMAT",
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(AppError);
        expect(error.name).toBe("AppError");
        expect(error.message).toBe("Unsupported file format");
        expect(error.statusCode).toBe(415);
        expect(error.code).toBe("UNSUPPORTED_FILE_FORMAT");
        expect(error.isOperational).toBe(true);
    });

    it("allows explicitly creating a non-operational error", () => {
        const error = new AppError(
            "Unexpected internal failure",
            500,
            "INTERNAL_SERVER_ERROR",
            false
        );

        expect(error.isOperational).toBe(false);
    });

});