import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { config } from "../config.js";

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(config.dbPath);
    fs.mkdirSync(dir, { recursive: true });
    db = new Database(config.dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initSchema(db);
  }
  return db;
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      unique_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      website_url TEXT,
      hours_json TEXT NOT NULL DEFAULT '[]',
      social_links_json TEXT NOT NULL DEFAULT '[]',
      phone TEXT,
      location TEXT,
      directory_map_url TEXT,
      logo_url TEXT,
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      unique_id TEXT NOT NULL UNIQUE,
      brand_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      start_date TEXT,
      end_date TEXT,
      tags_json TEXT NOT NULL DEFAULT '[]',
      source_url TEXT NOT NULL,
      source_portal TEXT NOT NULL,
      scraped_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (brand_id) REFERENCES brands(id)
    );

    CREATE TABLE IF NOT EXISTS scrape_jobs (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      records_found INTEGER NOT NULL DEFAULT 0,
      records_enriched INTEGER NOT NULL DEFAULT 0,
      records_failed INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_promotions_brand_id ON promotions(brand_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);
    CREATE INDEX IF NOT EXISTS idx_promotions_name ON promotions(name);
  `);
}
