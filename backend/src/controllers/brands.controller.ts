import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import * as brandRepo from "../db/brand.repository.js";
import * as promotionRepo from "../db/promotion.repository.js";
import * as scrapeSessionRepo from "../db/scrapeSession.repository.js";
import { sendError, sendSuccess } from "../middleware/response.helper.js";

const brandsQuerySchema = z.object({
  scrapeSessionId: z.uuid().optional(),
});

export function listBrands(req: Request, res: Response): void {
  const parsed = brandsQuerySchema.safeParse(req.query);
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

  const brands = brandRepo.listBrandsWithCount(scrapeSessionId).map((brand) => ({
    ...brand,
    promotions: scrapeSessionId
      ? promotionRepo.listPromotionsByBrandId(brand.id, scrapeSessionId)
      : promotionRepo.listPromotionsByBrandId(brand.id),
  }));

  sendSuccess(res, brands, "Brands retrieved");
}
