import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as brandRepo from "../db/brand.repository.js";
import * as promotionRepo from "../db/promotion.repository.js";
import { sendSuccess } from "../middleware/response.helper.js";

export function listBrands(_req: Request, res: Response): void {
  const brands = brandRepo.listBrandsWithCount().map((brand) => ({
    ...brand,
    promotions: promotionRepo.listPromotionsByBrandId(brand.id),
  }));

  sendSuccess(res, brands, "Brands retrieved");
}
