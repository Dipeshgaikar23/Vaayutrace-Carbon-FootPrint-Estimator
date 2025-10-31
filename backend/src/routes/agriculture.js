import express from 'express'
import { protect } from "../middlewares/auth.middleware.js";
import { calculateAgriculturePublic, calculateAgricultureProtected } from "../controllers/agriculture.controller.js"


const router = express.Router();

// 🌍 Open route (no login, no DB save)
router.post("/calculate", calculateAgriculturePublic);

// 🔒 Protected route (requires login, saves to DB)
router.post("/calculate-auth", protect, calculateAgricultureProtected);

export default router;
