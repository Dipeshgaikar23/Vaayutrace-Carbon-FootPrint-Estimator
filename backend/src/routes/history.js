import express from 'express'
import { getHistory } from "../controllers/history.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getHistory)

export default router;