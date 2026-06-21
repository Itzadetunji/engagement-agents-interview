import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendError } from "./response.helper.js";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error("[api error]", err);
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";
  sendError(res, message, [message], StatusCodes.INTERNAL_SERVER_ERROR);
}
