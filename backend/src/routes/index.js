import express from "express";
import electricityRoutes from "./electricity.js";
import transportRoutes from "./transport.js";
import manufacturingRoutes from "./manufacturing.js";
import constructionRoutes from "./construction.js";
import agricultureRoutes from "./agriculture.js";
import authRoutes from "./auth.js";
import history from "./history.js"
import chat from "./chatRoutes.js"

const router = express.Router();

router.use("/electricity", electricityRoutes);
router.use("/transport", transportRoutes);
router.use("/manufacturing", manufacturingRoutes);
router.use("/construction", constructionRoutes);
router.use("/agriculture", agricultureRoutes);
router.use("/auth", authRoutes);
router.use("/history", history)
router.use("/chat", chat)

export default router;
