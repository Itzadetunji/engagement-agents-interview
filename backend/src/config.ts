import "dotenv/config";

export const config = {
  port: Number(process.env.API_PORT ?? 3001),
  baseUrl: "https://www.thepromenadeshopsatbriargate.com",
  sourcePortal: "thepromenadeshopsatbriargate.com",
  dbPath: process.env.DATABASE_PATH ?? "./data/promotions.db",
  scrapeDelayMs: Number(process.env.SCRAPE_DELAY_MS ?? 500),
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS ?? 15000),
  defaultPageSize: 20,
  maxPageSize: 100,
};

export const COLLECTION_TAGS: Record<string, "deals" | "style_notes" | "new_arrivals"> = {
  "1013480": "deals",
  "1013483": "style_notes",
  "1013481": "new_arrivals",
};
