import cors from "cors";
import express from "express";
import morgan from "morgan";
import { startScrape } from "./controllers/scrape.controller.js";
import { errorHandler } from "./middleware/error.middleware.js";
import brandsRoutes from "./routes/brands.routes.js";
import promotionsRoutes from "./routes/promotions.routes.js";
import scrapeRoutes from "./routes/scrape.routes.js";
import scrapeSessionsRoutes from "./routes/scrapeSessions.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ success: true, message: "OK" });
  });

  app.use("/promotions", promotionsRoutes);
  app.use("/brands", brandsRoutes);
  app.use("/scrape-sessions", scrapeSessionsRoutes);
  app.post("/scrape", startScrape);
  app.use("/scrape", scrapeRoutes);

  app.use(errorHandler);

  return app;
}
