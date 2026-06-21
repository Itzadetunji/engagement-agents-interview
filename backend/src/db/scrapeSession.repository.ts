import { v4 as uuidv4 } from "uuid";
import type { ScrapeJobStatus } from "@shared/scrape.js";
import type { ScrapeSession } from "@shared/scrapeSession.js";
import { getDb } from "./connection.js";
import { nowIso } from "../services/scraper/utils.js";

interface ScrapeSessionRow {
  id: string;
  name: string;
  status: ScrapeJobStatus;
  records_found: number;
  records_enriched: number;
  records_failed: number;
  error: string | null;
  created_at: string;
  updated_at: string;
}

function mapSession(row: ScrapeSessionRow): ScrapeSession {
  return {
    id: row.id,
    name: row.name,
    status: row.status,
    recordsFound: row.records_found,
    recordsEnriched: row.records_enriched,
    recordsFailed: row.records_failed,
    error: row.error,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nextSessionName(): string {
  const { count } = getDb()
    .prepare("SELECT COUNT(*) as count FROM scrape_sessions")
    .get() as { count: number };
  return `Scrape ${count + 1}`;
}

export function createScrapeSession(): ScrapeSession {
  const db = getDb();
  const id = uuidv4();
  const timestamp = nowIso();
  const name = nextSessionName();

  db.prepare(
    `INSERT INTO scrape_sessions (
      id, name, status, records_found, records_enriched, records_failed,
      error, created_at, updated_at
    ) VALUES (?, ?, 'pending', 0, 0, 0, NULL, ?, ?)`,
  ).run(id, name, timestamp, timestamp);

  return mapSession(
    db
      .prepare("SELECT * FROM scrape_sessions WHERE id = ?")
      .get(id) as ScrapeSessionRow,
  );
}

export function findScrapeSession(id: string): ScrapeSession | null {
  const row = getDb()
    .prepare("SELECT * FROM scrape_sessions WHERE id = ?")
    .get(id) as ScrapeSessionRow | undefined;
  return row ? mapSession(row) : null;
}

export function findDefaultScrapeSession(): ScrapeSession | null {
  const row = getDb()
    .prepare(
      "SELECT * FROM scrape_sessions ORDER BY created_at ASC LIMIT 1",
    )
    .get() as ScrapeSessionRow | undefined;
  return row ? mapSession(row) : null;
}

export function listScrapeSessions(): ScrapeSession[] {
  const rows = getDb()
    .prepare(
      `SELECT s.*, COUNT(p.id) as promotion_count
       FROM scrape_sessions s
       LEFT JOIN promotions p ON p.scrape_session_id = s.id
       GROUP BY s.id
       ORDER BY s.created_at ASC`,
    )
    .all() as Array<ScrapeSessionRow & { promotion_count: number }>;

  return rows.map((row) => ({
    ...mapSession(row),
    promotionCount: row.promotion_count,
  }));
}

export function updateScrapeSession(
  id: string,
  patch: Partial<{
    status: ScrapeJobStatus;
    recordsFound: number;
    recordsEnriched: number;
    recordsFailed: number;
    error: string | null;
  }>,
): ScrapeSession {
  const db = getDb();
  const current = findScrapeSession(id);
  if (!current) throw new Error(`Scrape session ${id} not found`);

  db.prepare(
    `UPDATE scrape_sessions SET
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

  return findScrapeSession(id)!;
}
