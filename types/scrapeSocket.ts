import type { ScrapeJobSummary } from "./scrape";

export interface ScrapeSocketPayload {
  jobId: string;
  scrapeSessionId: string;
  sessionName: string;
}

export interface ScrapeProgressPayload extends ScrapeSocketPayload, ScrapeJobSummary {}

export interface ScrapeFailedPayload extends ScrapeSocketPayload {
  error: string;
  recordsFound: number;
  recordsEnriched: number;
  recordsFailed: number;
}

export interface ScrapeActiveSessionPayload {
  scrapeSessionId: string;
  sessionName: string;
  status: "pending" | "running";
}

export const SCRAPE_SOCKET_EVENTS = {
  ACTIVE: "scrape:active",
  STARTED: "scrape:started",
  PROGRESS: "scrape:progress",
  COMPLETED: "scrape:completed",
  FAILED: "scrape:failed",
} as const;

export type ScrapeSocketEvent =
  (typeof SCRAPE_SOCKET_EVENTS)[keyof typeof SCRAPE_SOCKET_EVENTS];
