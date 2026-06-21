import type { ScrapeJobStatus } from "./scrape";

export interface ScrapeSession {
  id: string;
  name: string;
  status: ScrapeJobStatus;
  recordsFound: number;
  recordsEnriched: number;
  recordsFailed: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
  promotionCount?: number;
}
