import axios from "axios";
import type { BrandWithCount } from "@shared/brand";
import type { PromotionQuery, PromotionWithBrand } from "@shared/promotion";
import type { SuccessResponse } from "@shared/response";
import type { ScrapeJob, ScrapeTriggerResponse } from "@shared/scrape";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchPromotions(params: PromotionQuery) {
  const { data } = await api.get<SuccessResponse<PromotionWithBrand[]>>(
    "/promotions",
    { params },
  );
  return data;
}

export async function fetchBrands() {
  const { data } = await api.get<
    SuccessResponse<Array<BrandWithCount & { promotions: PromotionWithBrand[] }>>
  >("/brands");
  return data;
}

export async function triggerScrape() {
  const { data } = await api.post<SuccessResponse<ScrapeTriggerResponse>>(
    "/scrape",
  );
  return data;
}

export async function fetchScrapeJob(jobId: string) {
  const { data } = await api.get<SuccessResponse<ScrapeJob>>(
    `/scrape/${jobId}`,
  );
  return data;
}
