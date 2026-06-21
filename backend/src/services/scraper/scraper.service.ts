import type { AxiosInstance } from "axios";
import { config } from "../../config.js";
import * as brandRepo from "../../db/brand.repository.js";
import * as promotionRepo from "../../db/promotion.repository.js";
import * as scrapeJobRepo from "../../db/scrapeJob.repository.js";
import * as scrapeSessionRepo from "../../db/scrapeSession.repository.js";
import { createHttpClient, fetchHtml } from "./http.client.js";
import { parseDetailPage, parseListingPage } from "./parsers.js";
import {
  fallbackBrandFromListing,
  parseStorePage,
} from "./store.parser.js";
import { nowIso, sleep } from "./utils.js";

const storeCache = new Map<string, string>();

export async function runScrapeJob(
  jobId: string,
  scrapeSessionId: string,
): Promise<void> {
  scrapeJobRepo.updateScrapeJob(jobId, { status: "running" });
  scrapeSessionRepo.updateScrapeSession(scrapeSessionId, { status: "running" });

  const client = createHttpClient();
  let recordsFound = 0;
  let recordsEnriched = 0;
  let recordsFailed = 0;

  try {
    const listingHtml = await fetchHtml(client, "/sales");
    const listings = parseListingPage(listingHtml, config.baseUrl);
    recordsFound = listings.length;
    scrapeJobRepo.updateScrapeJob(jobId, { recordsFound });
    scrapeSessionRepo.updateScrapeSession(scrapeSessionId, { recordsFound });

    storeCache.clear();

    for (const listing of listings) {
      try {
        await sleep(config.scrapeDelayMs);
        const detailHtml = await fetchHtml(client, listing.dealPath);
        const detail = parseDetailPage(detailHtml, listing);

        const brandId = await resolveBrandId(
          client,
          detail.brandName ?? listing.brandName,
          detail.storePath,
          listing.storeId,
        );

        promotionRepo.upsertPromotion({
          uniqueId: listing.uniqueId,
          scrapeSessionId,
          brandId,
          name: detail.name,
          description: detail.description,
          imageUrl: detail.imageUrl,
          startDate: detail.startDate,
          endDate: detail.endDate,
          tags: [listing.tag],
          sourceUrl: listing.sourceUrl,
          sourcePortal: config.sourcePortal,
          scrapedAt: nowIso(),
        });

        recordsEnriched += 1;
      } catch (error) {
        recordsFailed += 1;
        console.error(
          `[scraper] failed promotion ${listing.sourceUrl}:`,
          error instanceof Error ? error.message : error,
        );
      }

      scrapeJobRepo.updateScrapeJob(jobId, {
        recordsEnriched,
        recordsFailed,
      });
      scrapeSessionRepo.updateScrapeSession(scrapeSessionId, {
        recordsEnriched,
        recordsFailed,
      });
    }

    scrapeJobRepo.updateScrapeJob(jobId, {
      status: "done",
      recordsFound,
      recordsEnriched,
      recordsFailed,
    });
    scrapeSessionRepo.updateScrapeSession(scrapeSessionId, {
      status: "done",
      recordsFound,
      recordsEnriched,
      recordsFailed,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scrape failed";
    console.error("[scraper] job failed:", message);
    scrapeJobRepo.updateScrapeJob(jobId, {
      status: "failed",
      recordsFound,
      recordsEnriched,
      recordsFailed,
      error: message,
    });
    scrapeSessionRepo.updateScrapeSession(scrapeSessionId, {
      status: "failed",
      recordsFound,
      recordsEnriched,
      recordsFailed,
      error: message,
    });
  }
}

async function resolveBrandId(
  client: AxiosInstance,
  brandName: string,
  storePath: string | null,
  storeId: string | null,
): Promise<string> {
  if (storePath) {
    const cacheKey = storePath;
    if (storeCache.has(cacheKey)) {
      return storeCache.get(cacheKey)!;
    }

    try {
      await sleep(config.scrapeDelayMs);
      const storeHtml = await fetchHtml(client, storePath);
      const parsed = parseStorePage(storeHtml, storePath, config.baseUrl);
      const brand = brandRepo.upsertBrand({
        uniqueId: parsed.uniqueId,
        name: parsed.name,
        websiteUrl: parsed.websiteUrl,
        hours: parsed.hours,
        socialLinks: parsed.socialLinks,
        phone: parsed.phone,
        location: parsed.location,
        directoryMapUrl: parsed.directoryMapUrl,
        logoUrl: parsed.logoUrl,
        description: parsed.description,
      });
      storeCache.set(cacheKey, brand.id);
      return brand.id;
    } catch (error) {
      console.error(
        `[scraper] store page failed for ${storePath}:`,
        error instanceof Error ? error.message : error,
      );
    }
  }

  const fallback = fallbackBrandFromListing(brandName, storeId);
  const brand = brandRepo.upsertBrand({
    uniqueId: fallback.uniqueId,
    name: fallback.name,
    websiteUrl: fallback.websiteUrl,
    hours: fallback.hours,
    socialLinks: fallback.socialLinks,
    phone: fallback.phone,
    location: fallback.location,
    directoryMapUrl: fallback.directoryMapUrl,
    logoUrl: fallback.logoUrl,
    description: fallback.description,
  });
  return brand.id;
}

let activeJobPromise: Promise<void> | null = null;

export function triggerScrape(): {
  jobId: string;
  scrapeSessionId: string;
  alreadyRunning: boolean;
} {
  const active = scrapeJobRepo.findActiveScrapeJob();
  if (active || activeJobPromise) {
    return { jobId: active?.id ?? "", scrapeSessionId: "", alreadyRunning: true };
  }

  const session = scrapeSessionRepo.createScrapeSession();
  const job = scrapeJobRepo.createScrapeJob(session.id);
  activeJobPromise = runScrapeJob(job.id, session.id).finally(() => {
    activeJobPromise = null;
  });

  return {
    jobId: job.id,
    scrapeSessionId: session.id,
    alreadyRunning: false,
  };
}

export function getScrapeJob(jobId: string) {
  return scrapeJobRepo.findScrapeJob(jobId);
}
