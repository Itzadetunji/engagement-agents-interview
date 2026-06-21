import { v4 as uuidv4 } from "uuid";
import type { Brand, BrandHours, SocialLink } from "@shared/brand.js";
import { getDb } from "./connection.js";
import { nowIso } from "../services/scraper/utils.js";

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
  created_at: string;
  updated_at: string;
}

export interface UpsertBrandInput {
  uniqueId: string;
  name: string;
  websiteUrl: string | null;
  hours: BrandHours[];
  socialLinks: SocialLink[];
  phone: string | null;
  location: string | null;
  directoryMapUrl: string | null;
  logoUrl: string | null;
  description: string | null;
}

function mapBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    uniqueId: row.unique_id,
    name: row.name,
    websiteUrl: row.website_url,
    hours: JSON.parse(row.hours_json) as BrandHours[],
    socialLinks: JSON.parse(row.social_links_json) as SocialLink[],
    phone: row.phone,
    location: row.location,
    directoryMapUrl: row.directory_map_url,
    logoUrl: row.logo_url,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function upsertBrand(input: UpsertBrandInput): Brand {
  const db = getDb();
  const existing = db
    .prepare("SELECT * FROM brands WHERE unique_id = ?")
    .get(input.uniqueId) as BrandRow | undefined;

  const timestamp = nowIso();

  if (existing) {
    db.prepare(
      `UPDATE brands SET
        name = ?, website_url = ?, hours_json = ?, social_links_json = ?,
        phone = ?, location = ?, directory_map_url = ?, logo_url = ?,
        description = ?, updated_at = ? WHERE unique_id = ?`,
    ).run(
      input.name,
      input.websiteUrl,
      JSON.stringify(input.hours),
      JSON.stringify(input.socialLinks),
      input.phone,
      input.location,
      input.directoryMapUrl,
      input.logoUrl,
      input.description,
      timestamp,
      input.uniqueId,
    );
    return mapBrand(
      db
        .prepare("SELECT * FROM brands WHERE unique_id = ?")
        .get(input.uniqueId) as BrandRow,
    );
  }

  const id = uuidv4();
  db.prepare(
    `INSERT INTO brands (
      id, unique_id, name, website_url, hours_json, social_links_json,
      phone, location, directory_map_url, logo_url, description, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    input.uniqueId,
    input.name,
    input.websiteUrl,
    JSON.stringify(input.hours),
    JSON.stringify(input.socialLinks),
    input.phone,
    input.location,
    input.directoryMapUrl,
    input.logoUrl,
    input.description,
    timestamp,
    timestamp,
  );

  return mapBrand(
    db.prepare("SELECT * FROM brands WHERE id = ?").get(id) as BrandRow,
  );
}

export function findBrandById(id: string): Brand | null {
  const row = getDb()
    .prepare("SELECT * FROM brands WHERE id = ?")
    .get(id) as BrandRow | undefined;
  return row ? mapBrand(row) : null;
}

export function findBrandByUniqueId(uniqueId: string): Brand | null {
  const row = getDb()
    .prepare("SELECT * FROM brands WHERE unique_id = ?")
    .get(uniqueId) as BrandRow | undefined;
  return row ? mapBrand(row) : null;
}

export function listBrandsWithCount(
  scrapeSessionId?: string,
): Array<Brand & { promotionCount: number }> {
  const db = getDb();
  const rows = scrapeSessionId
    ? (db
        .prepare(
          `SELECT b.*, COUNT(p.id) as promotion_count
           FROM brands b
           INNER JOIN promotions p ON p.brand_id = b.id AND p.scrape_session_id = ?
           GROUP BY b.id
           HAVING promotion_count > 0
           ORDER BY b.name ASC`,
        )
        .all(scrapeSessionId) as Array<BrandRow & { promotion_count: number }>)
    : (db
        .prepare(
          `SELECT b.*, COUNT(p.id) as promotion_count
           FROM brands b
           LEFT JOIN promotions p ON p.brand_id = b.id
           GROUP BY b.id
           ORDER BY b.name ASC`,
        )
        .all() as Array<BrandRow & { promotion_count: number }>);

  return rows.map((row) => ({
    ...mapBrand(row),
    promotionCount: row.promotion_count,
  }));
}

export function listBrandNames(): string[] {
  const rows = getDb()
    .prepare("SELECT name FROM brands ORDER BY name ASC")
    .all() as Array<{ name: string }>;
  return rows.map((r) => r.name);
}
