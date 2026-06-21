export type ScrapeJobStatus = "pending" | "running" | "done" | "failed";

export interface ScrapeJobSummary {
  recordsFound: number;
  recordsEnriched: number;
  recordsFailed: number;
}

export interface ScrapeJob {
  id: string;
  status: ScrapeJobStatus;
  recordsFound: number;
  recordsEnriched: number;
  recordsFailed: number;
  error: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScrapeTriggerResponse {
  jobId: string;
  scrapeSessionId: string;
}
