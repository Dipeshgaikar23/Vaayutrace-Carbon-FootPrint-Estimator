import express from 'express'
import { protect } from "../middlewares/auth.middleware.js";
import { calculateManufacturingPublic, calculateManufacturingProtected } from "../controllers/manufacturing.controller.js"

const router = express.Router()

router.post("/calculate", calculateManufacturingPublic)
router.post("/calculate-auth",protect, calculateManufacturingProtected)

export default router;