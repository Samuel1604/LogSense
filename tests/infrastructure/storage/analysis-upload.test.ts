import express from "express";
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { analysisUpload } from "../../../src/infrastructure/storage/analysis-upload.js";
import { errorHandler } from "../../../src/shared/errors/error-handler.js";

describe("Analysis upload middleware", () => {
  const uploadedFiles: string[] = [];

  const app = express();

  app.post("/upload", analysisUpload.single("file"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false });
      return;
    }

    uploadedFiles.push(req.file.path);

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.filename,
        size: req.file.size,
      },
    });
  });

  app.use(errorHandler);

  afterEach(async () => {
    await Promise.all(uploadedFiles.map((file) => rm(file, { force: true })));

    uploadedFiles.length = 0;
  });

  it("accepts a supported log file", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("ERROR: Database connection failed"), {
        filename: "application.log",
        contentType: "text/plain",
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        size: Buffer.byteLength("ERROR: Database connection failed"),
      },
    });
  });

  it("rejects unsupported file extensions", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("some content"), {
        filename: "application.exe",
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "UNSUPPORTED_FILE_FORMAT",
        message: "Unsupported file format",
      },
    });
  });

  it("rejects files larger than 25 MB", async () => {
    const oversizedFile = Buffer.alloc(25 * 1024 * 1024 + 1);

    const response = await request(app)
      .post("/upload")
      .attach("file", oversizedFile, {
        filename: "large.log",
      });

    expect(response.status).toBe(413);
    expect(response.body).toMatchObject({
      success: false,
      error: {
        code: "LIMIT_FILE_SIZE",
        message: "File exceeds the maximum allowed size",
      },
    });
  });

  it("rejects multiple files", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("first"), {
        filename: "first.log",
      })
      .attach("file", Buffer.from("second"), {
        filename: "second.log",
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("LIMIT_FILE_COUNT");
  });
});
