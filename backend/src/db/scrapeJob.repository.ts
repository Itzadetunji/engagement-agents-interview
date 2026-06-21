import { v4 as uuidv4 } from "uuid";
import type { ScrapeJob, ScrapeJobStatus } from "@shared/scrape.js";
import { getDb } from "./connection.js";
import { nowIso } from "../services/scraper/utils.js";

interface ScrapeJobRow {
  id: string;
  status: ScrapeJobStatus;
  records_found: number;
  records_enriched: number;
  records_failed: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}

function mapJob(row: ScrapeJobRow): ScrapeJob {
  return {
    id: row.id,
    status: row.status,
    recordsFound: row.records_found,
    recordsEnriched: row.records_enriched,
    recordsFailed: row.records_failed,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function createScrapeJob(): ScrapeJob {
  const db = getDb();
  const id = uuidv4();
  const timestamp = nowIso();

  db.prepare(
    `INSERT INTO scrape_jobs (id, status, records_found, records_enriched, records_failed, error, created_at, updated_at)
     VALUES (?, 'pending', 0, 0, 0, NULL, ?, ?)`,
  ).run(id, timestamp, timestamp);

  return mapJob(
    db.prepare("SELECT * FROM scrape_jobs WHERE id = ?").get(id) as ScrapeJobRow,
  );
}

export function findScrapeJob(id: string): ScrapeJob | null {
  const row = getDb()
    .prepare("SELECT * FROM scrape_jobs WHERE id = ?")
    .get(id) as ScrapeJobRow | undefined;
  return row ? mapJob(row) : null;
}

export function findActiveScrapeJob(): ScrapeJob | null {
  const row = getDb()
    .prepare(
      "SELECT * FROM scrape_jobs WHERE status IN ('pending', 'running') ORDER BY created_at DESC LIMIT 1",
    )
    .get() as ScrapeJobRow | undefined;
  return row ? mapJob(row) : null;
}

export function updateScrapeJob(
  id: string,
  patch: Partial<{
    status: ScrapeJobStatus;
    recordsFound: number;
    recordsEnriched: number;
    recordsFailed: number;
    error: string | null;
  }>,
): ScrapeJob {
  const db = getDb();
  const current = findScrapeJob(id);
  if (!current) throw new Error(`Scrape job ${id} not found`);

  db.prepare(
    `UPDATE scrape_jobs SET
      status = ?, records_found = ?, records_enriched = ?, records_failed = ?,
      error = ?, updated_at = ? WHERE id = ?`,
  ).run(
    patch.status ?? current.status,
    patch.recordsFound ?? current.recordsFound,
    patch.recordsEnriched ?? current.recordsEnriched,
    patch.recordsFailed ?? current.recordsFailed,
    patch.error !== undefined ? patch.error : current.error,
    nowIso(),
    id,
  );

  return findScrapeJob(id)!;
}
