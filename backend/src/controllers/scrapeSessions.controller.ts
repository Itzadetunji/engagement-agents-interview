import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import * as scrapeSessionRepo from "../db/scrapeSession.repository.js";
import { sendError, sendSuccess } from "../middleware/response.helper.js";

const sessionParamSchema = z.object({
  id: z.string().uuid(),
});

export function listScrapeSessions(_req: Request, res: Response): void {
  const sessions = scrapeSessionRepo.listScrapeSessions();
  sendSuccess(res, sessions, "Scrape sessions retrieved");
}

export function getScrapeSession(req: Request, res: Response): void {
  const parsed = sessionParamSchema.safeParse(req.params);
  if (!parsed.success) {
    sendError(
      res,
      "Invalid scrape session id",
      ["Invalid id"],
      StatusCodes.BAD_REQUEST,
    );
    return;
  }

  const session = scrapeSessionRepo.findScrapeSession(parsed.data.id);
  if (!session) {
    sendError(
      res,
      "Scrape session not found",
      ["Not found"],
      StatusCodes.NOT_FOUND,
    );
    return;
  }

  sendSuccess(res, session, "Scrape session retrieved");
}
