import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
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

function columnExists(
  database: Database.Database,
  table: string,
  column: string,
): boolean {
  const cols = database
    .prepare(`PRAGMA table_info(${table})`)
    .all() as Array<{ name: string }>;
  return cols.some((c) => c.name === column);
}

function tableExists(database: Database.Database, table: string): boolean {
  const row = database
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?")
    .get(table);
  return !!row;
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

    CREATE TABLE IF NOT EXISTS scrape_sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      records_found INTEGER NOT NULL DEFAULT 0,
      records_enriched INTEGER NOT NULL DEFAULT 0,
      records_failed INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scrape_jobs (
      id TEXT PRIMARY KEY,
      scrape_session_id TEXT,
      status TEXT NOT NULL,
      records_found INTEGER NOT NULL DEFAULT 0,
      records_enriched INTEGER NOT NULL DEFAULT 0,
      records_failed INTEGER NOT NULL DEFAULT 0,
      error TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (scrape_session_id) REFERENCES scrape_sessions(id)
    );

    CREATE TABLE IF NOT EXISTS promotions (
      id TEXT PRIMARY KEY,
      unique_id TEXT NOT NULL,
      scrape_session_id TEXT NOT NULL,
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
      UNIQUE(unique_id, scrape_session_id),
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (scrape_session_id) REFERENCES scrape_sessions(id)
    );
  `);

  migrateSchema(database);

  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_promotions_brand_id ON promotions(brand_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_scrape_session_id ON promotions(scrape_session_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);
    CREATE INDEX IF NOT EXISTS idx_promotions_name ON promotions(name);
  `);
}

function migrateSchema(database: Database.Database): void {
  if (
    tableExists(database, "promotions") &&
    !columnExists(database, "promotions", "scrape_session_id")
  ) {
    migratePromotionsToSessions(database);
  }

  if (
    tableExists(database, "scrape_jobs") &&
    !columnExists(database, "scrape_jobs", "scrape_session_id")
  ) {
    database.exec(
      "ALTER TABLE scrape_jobs ADD COLUMN scrape_session_id TEXT REFERENCES scrape_sessions(id)",
    );
  }
}

function migratePromotionsToSessions(database: Database.Database): void {
  const sessionId = uuidv4();
  const timestamp = new Date().toISOString();

  database
    .prepare(
      `INSERT INTO scrape_sessions (
        id, name, status, records_found, records_enriched, records_failed,
        error, created_at, updated_at
      ) VALUES (?, 'Scrape 1', 'done', 0, 0, 0, NULL, ?, ?)`,
    )
    .run(sessionId, timestamp, timestamp);

  database.exec(`
    CREATE TABLE promotions_migrated (
      id TEXT PRIMARY KEY,
      unique_id TEXT NOT NULL,
      scrape_session_id TEXT NOT NULL,
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
      UNIQUE(unique_id, scrape_session_id),
      FOREIGN KEY (brand_id) REFERENCES brands(id),
      FOREIGN KEY (scrape_session_id) REFERENCES scrape_sessions(id)
    );

    INSERT INTO promotions_migrated (
      id, unique_id, scrape_session_id, brand_id, name, description, image_url,
      start_date, end_date, tags_json, source_url, source_portal, scraped_at,
      created_at, updated_at
    )
    SELECT
      id, unique_id, '${sessionId}', brand_id, name, description, image_url,
      start_date, end_date, tags_json, source_url, source_portal, scraped_at,
      created_at, updated_at
    FROM promotions;

    DROP TABLE promotions;
    ALTER TABLE promotions_migrated RENAME TO promotions;

    CREATE INDEX IF NOT EXISTS idx_promotions_brand_id ON promotions(brand_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_scrape_session_id ON promotions(scrape_session_id);
    CREATE INDEX IF NOT EXISTS idx_promotions_end_date ON promotions(end_date);
    CREATE INDEX IF NOT EXISTS idx_promotions_name ON promotions(name);
  `);
}
