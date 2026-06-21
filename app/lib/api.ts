import axios from "axios";
import type { BrandWithCount } from "@shared/brand";
import type { PromotionQuery, PromotionWithBrand } from "@shared/promotion";
import type { SuccessResponse } from "@shared/response";
import type { ScrapeJob, ScrapeTriggerResponse } from "@shared/scrape";
import type { ScrapeSession } from "@shared/scrapeSession";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

export async function fetchPromotions(params: PromotionQuery) {
  const { orderBy, ...rest } = params;
  const { data } = await api.get<SuccessResponse<PromotionWithBrand[]>>(
    "/promotions",
    {
      params: {
        ...rest,
        order_by: orderBy,
      },
    },
  );
  return data;
}

export async function fetchBrands(scrapeSessionId?: string) {
  const { data } = await api.get<
    SuccessResponse<Array<BrandWithCount & { promotions: PromotionWithBrand[] }>>
  >("/brands", { params: scrapeSessionId ? { scrapeSessionId } : undefined });
  return data;
}

export async function fetchScrapeSessions() {
  const { data } = await api.get<SuccessResponse<ScrapeSession[]>>(
    "/scrape-sessions",
  );
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
