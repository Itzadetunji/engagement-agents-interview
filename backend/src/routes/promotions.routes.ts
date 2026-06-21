import { Router } from "express";
import {
  getPromotion,
  listPromotions,
} from "../controllers/promotions.controller.js";

const router = Router();

 router.get("/", listPromotions);
 router.get("/:id", getPromotion);

export default router;
