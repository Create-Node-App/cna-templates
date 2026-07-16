import type { ErrorHandler } from "hono";
import { AppError, toErrorBody } from "../lib/errors";

export const errorHandler: ErrorHandler = (error, c) => {
  const status = error instanceof AppError ? error.status : 500;
  if (status >= 500) {
    console.error(error);
  }
  return c.json(toErrorBody(error), status);
};
