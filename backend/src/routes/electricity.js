import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  calculateElectricityPublic,
  calculateElectricityProtected,
} from "../controllers/electricity.controller.js";

const router = express.Router();

// 🌍 Open route (no login, no DB save)
router.post("/calculate", calculateElectricityPublic);

// 🔒 Protected route (requires login, saves to DB)
router.post("/calculate-auth", protect, calculateElectricityProtected);

// 🔒 Get history for logged-in user
// router.get("/history", protect, getElectricityHistory);

export default router;
