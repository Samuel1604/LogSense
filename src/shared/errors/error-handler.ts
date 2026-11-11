import type {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { AppError } from "./app-error.js";
import { logger } from "../../infrastructure/logger.js";
import multer from "multer";

export const errorHandler: ErrorRequestHandler = (
  err,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError && err.isOperational;
  const isMulterError = err instanceof multer.MulterError;

  let statusCode = 500;
  let message = "An unexpected error occurred. Please try again later.";
  let code = "INTERNAL_SERVER_ERROR";

  if (isAppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code;
  } else if (isMulterError) {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File exceeds the maximum allowed size"
        : "Invalid file upload";
    code = err.code;
  }

  if (isAppError || isMulterError) {
    logger.warn(
      { err, method: req.method, url: req.url },
      "Operational application error",
    );
  } else {
    logger.error(
      { err, method: req.method, url: req.url },
      "Unexpected application error",
    );
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};