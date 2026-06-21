import type { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ZodError, type ZodType } from "zod";
import { sendError } from "./response.helper.js";

export function validateQuery<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      sendError(
        res,
        "Invalid query parameters",
        formatZodErrors(result.error),
        StatusCodes.BAD_REQUEST,
      );
      return;
    }
    req.validatedQuery = result.data;
    next();
  };
}

export function validateParams<T>(schema: ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      sendError(
        res,
        "Invalid route parameters",
        formatZodErrors(result.error),
        StatusCodes.BAD_REQUEST,
      );
      return;
    }
    req.validatedParams = result.data;
    next();
  };
}

function formatZodErrors(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.join(".") || "request";
    return `${path}: ${issue.message}`;
  });
}

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: unknown;
      validatedParams?: unknown;
    }
  }
}

export {};
