import { v4 as uuidv4 } from "uuid";
import type { Brand } from "@shared/brand.js";
import type { Promotion, PromotionTag, PromotionWithBrand } from "@shared/promotion.js";
import { getDb } from "./connection.js";
import { nowIso } from "../services/scraper/utils.js";

interface PromotionRow {
  id: string;
  unique_id: string;
  scrape_session_id: string;
  brand_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  tags_json: string;
  source_url: string;
  source_portal: string;
  scraped_at: string;
  created_at: string;
  updated_at: string;
}

interface BrandRow {
  id: string;
  unique_id: string;
  name: string;
  website_url: string | null;
  hours_json: string;
  social_links_json: string;
  phone: string | null;
  location: string | null;
  directory_map_url: string | null;
  logo_url: string | null;
  description: string | null;
}

export interface UpsertPromotionInput {
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
}

export interface PromotionFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  brand?: string;
  scrapeSessionId?: string;
  page: number;
  pageSize: number;
}

function mapPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    uniqueId: row.unique_id,
    scrapeSessionId: row.scrape_session_id,
    brandId: row.brand_id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    startDate: row.start_date,
    endDate: row.end_date,
    tags: JSON.parse(row.tags_json) as PromotionTag[],
    sourceUrl: row.source_url,
    sourcePortal: row.source_portal,
    scrapedAt: row.scraped_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapBrandSummary(row: BrandRow): PromotionWithBrand["brand"] {
  return {
    id: row.id,
    uniqueId: row.unique_id,
    name: row.name,
    websiteUrl: row.website_url,
    hours: JSON.parse(row.hours_json),
    socialLinks: JSON.parse(row.social_links_json),
    phone: row.phone,
    location: row.location,
    directoryMapUrl: row.directory_map_url,
    logoUrl: row.logo_url,
    description: row.description,
  };
}

export function upsertPromotion(input: UpsertPromotionInput): Promotion {
  const db = getDb();
  const existing = db
    .prepare(
      "SELECT * FROM promotions WHERE unique_id = ? AND scrape_session_id = ?",
    )
    .get(input.uniqueId, input.scrapeSessionId) as PromotionRow | undefined;

  const timestamp = nowIso();

  if (existing) {
    db.prepare(
      `UPDATE promotions SET
        brand_id = ?, name = ?, description = ?, image_url = ?,
        start_date = ?, end_date = ?, tags_json = ?, source_url = ?,
        source_portal = ?, scraped_at = ?, updated_at = ?
       WHERE unique_id = ? AND scrape_session_id = ?`,
    ).run(
      input.brandId,
      input.name,
      input.description,
      input.imageUrl,
      input.startDate,
      input.endDate,
      JSON.stringify(input.tags),
      input.sourceUrl,
      input.sourcePortal,
      input.scrapedAt,
      timestamp,
      input.uniqueId,
      input.scrapeSessionId,
    );
    return mapPromotion(
      db
        .prepare(
          "SELECT * FROM promotions WHERE unique_id = ? AND scrape_session_id = ?",
        )
        .get(input.uniqueId, input.scrapeSessionId) as PromotionRow,
    );
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO promotions (
      id, unique_id, scrape_session_id, brand_id, name, description, image_url,
      start_date, end_date, tags_json, source_url, source_portal,
      scraped_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.uniqueId,
    input.scrapeSessionId,
    input.brandId,
    input.name,
    input.description,
    input.imageUrl,
    input.startDate,
    input.endDate,
    JSON.stringify(input.tags),
    input.sourceUrl,
    input.sourcePortal,
    input.scrapedAt,
    timestamp,
    timestamp,
  );

  return mapPromotion(
    db.prepare("SELECT * FROM promotions WHERE id = ?").get(id) as PromotionRow,
  );
}

function buildWhereClause(filters: PromotionFilters): {
  clause: string;
  params: unknown[];
} {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters.search) {
    conditions.push("(p.name LIKE ? OR b.name LIKE ?)");
    const term = `%${filters.search}%`;
    params.push(term, term);
  }

  if (filters.startDate) {
    conditions.push("(p.end_date IS NULL OR p.end_date >= ?)");
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push("(p.start_date IS NULL OR p.start_date <= ?)");
    params.push(filters.endDate);
  }

  if (filters.brand) {
    conditions.push("b.name LIKE ?");
    params.push(`%${filters.brand}%`);
  }

  if (filters.scrapeSessionId) {
    conditions.push("p.scrape_session_id = ?");
    params.push(filters.scrapeSessionId);
  }

  const clause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  return { clause, params };
}

export function listPromotions(filters: PromotionFilters): {
  items: PromotionWithBrand[];
  total: number;
} {
  const db = getDb();
  const { clause, params } = buildWhereClause(filters);
  const offset = (filters.page - 1) * filters.pageSize;

  const totalRow = db
    .prepare(
      `SELECT COUNT(*) as total FROM promotions p
       JOIN brands b ON b.id = p.brand_id ${clause}`,
    )
    .get(...params) as { total: number };

  const rows = db
    .prepare(
      `SELECT p.*, b.id as b_id, b.unique_id as b_unique_id, b.name as b_name,
        b.website_url, b.hours_json, b.social_links_json, b.phone, b.location,
        b.directory_map_url, b.logo_url, b.description
       FROM promotions p
       JOIN brands b ON b.id = p.brand_id
       ${clause}
       ORDER BY p.end_date IS NULL, p.end_date ASC, p.name ASC
       LIMIT ? OFFSET ?`,
    )
    .all(...params, filters.pageSize, offset) as Array<
      PromotionRow & BrandRow & { b_id: string; b_unique_id: string; b_name: string }
    >;

  const items: PromotionWithBrand[] = rows.map((row) => ({
    ...mapPromotion(row),
    brand: mapBrandSummary({
      id: row.b_id,
      unique_id: row.b_unique_id,
      name: row.b_name,
      website_url: row.website_url,
      hours_json: row.hours_json,
      social_links_json: row.social_links_json,
      phone: row.phone,
      location: row.location,
      directory_map_url: row.directory_map_url,
      logo_url: row.logo_url,
      description: row.description,
    }),
  }));

  return { items, total: totalRow.total };
}

export function findPromotionById(id: string): PromotionWithBrand | null {
  const row = getDb()
    .prepare(
      `SELECT p.*, b.id as b_id, b.unique_id as b_unique_id, b.name as b_name,
        b.website_url, b.hours_json, b.social_links_json, b.phone, b.location,
        b.directory_map_url, b.logo_url, b.description
       FROM promotions p
       JOIN brands b ON b.id = p.brand_id
       WHERE p.id = ?`,
    )
    .get(id) as
    | (PromotionRow &
        BrandRow & { b_id: string; b_unique_id: string; b_name: string })
    | undefined;

  if (!row) return null;

  return {
    ...mapPromotion(row),
    brand: mapBrandSummary({
      id: row.b_id,
      unique_id: row.b_unique_id,
      name: row.b_name,
      website_url: row.website_url,
      hours_json: row.hours_json,
      social_links_json: row.social_links_json,
      phone: row.phone,
      location: row.location,
      directory_map_url: row.directory_map_url,
      logo_url: row.logo_url,
      description: row.description,
    }),
  };
}

export function listPromotionsByBrandId(
  brandId: string,
  scrapeSessionId?: string,
): Promotion[] {
  const db = getDb();
  const rows = scrapeSessionId
    ? (db
        .prepare(
          `SELECT * FROM promotions
           WHERE brand_id = ? AND scrape_session_id = ?
           ORDER BY end_date ASC`,
        )
        .all(brandId, scrapeSessionId) as PromotionRow[])
    : (db
        .prepare("SELECT * FROM promotions WHERE brand_id = ? ORDER BY end_date ASC")
        .all(brandId) as PromotionRow[]);
  return rows.map(mapPromotion);
}
