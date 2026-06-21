import type { Response } from "express";
import { StatusCodes } from "http-status-codes";
import type { PaginationMeta } from "@shared/response.js";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  status = StatusCodes.OK,
  pagination?: PaginationMeta,
): Response {
  return res.status(status).json({
    success: true,
    message,
    data,
    ...(pagination ? { meta: { pagination } } : {}),
  });
}

export function sendError(
  res: Response,
  message: string,
  errors: string[] = [],
  status = StatusCodes.BAD_REQUEST,
): Response {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}

export function buildPagination(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const total_pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? undefined : (page - 1) * pageSize + 1;
  const to = total === 0 ? undefined : Math.min(page * pageSize, total);

  return {
    current_page: page,
    total_pages,
    total,
    per_page: pageSize,
    from,
    to,
  };
}
