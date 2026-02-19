import express from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, dashboardController.getDashboardStats);
router.get("/quick", protect, dashboardController.getQuickStats);

export default router;