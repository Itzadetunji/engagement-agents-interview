import { Router } from "express";
import {
  getScrapeSession,
  listScrapeSessions,
} from "../controllers/scrapeSessions.controller.js";

const router = Router();

router.get("/", listScrapeSessions);
router.get("/:id", getScrapeSession);

export default router;
