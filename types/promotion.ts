import type { Brand } from "./brand";

export type PromotionTag = "deals" | "style_notes" | "new_arrivals";

export interface Promotion {
  id: string;
  uniqueId: string;
  scrapeSessionId: string;
  brandId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  tags: PromotionTag[];
  sourceUrl: string;
  sourcePortal: string;
  scrapedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionWithBrand extends Promotion {
  brand: Pick<
    Brand,
    | "id"
    | "uniqueId"
    | "name"
    | "websiteUrl"
    | "hours"
    | "socialLinks"
    | "phone"
    | "location"
    | "directoryMapUrl"
    | "logoUrl"
    | "description"
  >;
}

export type PromotionOrderBy =
  | "end_date"
  | "-end_date"
  | "name"
  | "-name"
  | "brand"
  | "-brand"
  | "tags"
  | "-tags";

export const DEFAULT_PROMOTION_ORDER_BY: PromotionOrderBy = "end_date";

export interface PromotionQuery {
  search?: string;
  startDate?: string;
  endDate?: string;
  brand?: string;
  scrapeSessionId?: string;
  orderBy?: PromotionOrderBy;
  page?: number;
  pageSize?: number;
}
