import express from "express";
import * as electricityController from "../controllers/electricityController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public - no auth needed
router.post("/calculate", electricityController.calculateOnly);

// Protected - auth required
router.post(
  "/calculate-save",
  protect,
  electricityController.calculateAndSave
);
router.get("/records", protect, electricityController.getRecords);
router.delete("/records/:id", protect, electricityController.deleteRecord);
router.get("/predict", protect, electricityController.getPrediction);

export default router;