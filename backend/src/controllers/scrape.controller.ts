import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import {
  getScrapeJob,
  triggerScrape,
} from "../services/scraper/scraper.service.js";
import { sendError, sendSuccess } from "../middleware/response.helper.js";

const jobParamSchema = z.object({
  jobId: z.uuid(),
});

export function startScrape(_req: Request, res: Response): void {
  const result = triggerScrape();

  if (result.alreadyRunning) {
    sendError(
      res,
      "A scrape job is already running",
      ["Concurrent scrape not allowed"],
      StatusCodes.CONFLICT,
    );
    return;
  }

  sendSuccess(
    res,
    { jobId: result.jobId, scrapeSessionId: result.scrapeSessionId },
    "Scrape job started",
    StatusCodes.ACCEPTED,
  );
}

export function getScrapeStatus(req: Request, res: Response): void {
  const parsed = jobParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendError(res, "Invalid job id", ["Invalid jobId"], StatusCodes.BAD_REQUEST);
    return;
  }

  const job = getScrapeJob(parsed.data.jobId);
  if (!job) {
    sendError(res, "Scrape job not found", ["Not found"], StatusCodes.NOT_FOUND);
    return;
  }

  sendSuccess(res, job, "Scrape job status retrieved");
}
