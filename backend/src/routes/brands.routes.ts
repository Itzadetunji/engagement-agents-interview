import { Router } from "express";
import { listBrands } from "../controllers/brands.controller.js";

const router = Router();

 router.get("/", listBrands);

export default router;
