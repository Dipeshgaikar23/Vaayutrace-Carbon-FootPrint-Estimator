import express from "express";
import * as transportController from "../controllers/transportController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.post("/calculate", transportController.calculateOnly);

// Protected
router.post("/calculate-save", protect, transportController.calculateAndSave);
router.get("/records", protect, transportController.getRecords);
router.delete("/records/:id", protect, transportController.deleteRecord);
router.get("/predict", protect, transportController.getPrediction);

export default router;