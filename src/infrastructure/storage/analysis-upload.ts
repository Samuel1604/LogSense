import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join } from "node:path";

import multer from "multer";

import { AppError } from "../../shared/errors/app-error.js";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([".log", ".txt", ".json", ".jsonl"]);

const uploadDirectory = join(tmpdir(), "logsense", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    mkdir(uploadDirectory, { recursive: true }, (error) => {
      callback(error, uploadDirectory);
    });
  },

  filename: (_req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();

    callback(null, `${randomUUID()}${extension}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  const extension = extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    callback(
      new AppError("Unsupported file format", 400, "UNSUPPORTED_FILE_FORMAT"),
    );
    return;
  }

  callback(null, true);
};

export const analysisUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});
