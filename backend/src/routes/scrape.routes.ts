import { Router } from "express";
import { getScrapeStatus } from "../controllers/scrape.controller.js";

const router = Router();

 router.get("/:jobId", getScrapeStatus);

export default router;
