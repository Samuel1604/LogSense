import type { RequestHandler } from "express";
import type { ZodType } from "zod";

import { AppError } from "../errors/app-error.js";

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      next(new AppError("Invalid request parameters", 400, "BAD_REQUEST"));

      return;
    }

    next();
  };
};
