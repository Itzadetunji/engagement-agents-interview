import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { config } from "../config.js";
import * as promotionRepo from "../db/promotion.repository.js";
import * as scrapeSessionRepo from "../db/scrapeSession.repository.js";
import {
  buildPagination,
  sendError,
  sendSuccess,
} from "../middleware/response.helper.js";

const promotionsQuerySchema = z.object({
  search: z.string().optional(),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  brand: z.string().optional(),
  scrapeSessionId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(config.maxPageSize)
    .default(config.defaultPageSize),
});

const idParamSchema = z.object({
  id: z.string().uuid(),
});

export function listPromotions(req: Request, res: Response): void {
  const parsed = promotionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    sendError(
      res,
      "Invalid query parameters",
      parsed.error.issues.map((i) => i.message),
      StatusCodes.BAD_REQUEST,
    );
    return;
  }

  const scrapeSessionId =
    parsed.data.scrapeSessionId ??
    scrapeSessionRepo.findDefaultScrapeSession()?.id;

  const { items, total } = promotionRepo.listPromotions({
    ...parsed.data,
    scrapeSessionId,
  });
  const pagination = buildPagination(
    parsed.data.page,
    parsed.data.pageSize,
    total,
  );

  sendSuccess(res, items, "Promotions retrieved", StatusCodes.OK, pagination);
}

export function getPromotion(req: Request, res: Response): void {
  const parsed = idParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendError(res, "Invalid promotion id", ["Invalid id"], StatusCodes.BAD_REQUEST);
    return;
  }

  const promotion = promotionRepo.findPromotionById(parsed.data.id);
  if (!promotion) {
    sendError(res, "Promotion not found", ["Not found"], StatusCodes.NOT_FOUND);
    return;
  }

  sendSuccess(res, promotion, "Promotion retrieved");
}
