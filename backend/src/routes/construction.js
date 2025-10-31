import express from 'express'
import { protect } from "../middlewares/auth.middleware.js";
import { calculateConstructionPublic, calculateConstructionProtected } from "../controllers/construction.controller.js"

const router = express.Router()

router.post("/calculate", calculateConstructionPublic)
router.post("/calculate-auth", protect, calculateConstructionProtected)

export default router;