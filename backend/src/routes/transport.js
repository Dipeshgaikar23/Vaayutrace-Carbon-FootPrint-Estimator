import express from 'express'
import { protect } from '../middlewares/auth.middleware.js'
import { calculateTransportPublic, calculateTransportProtected } from "../controllers/transport.controller.js"

const router = express.Router()

router.post("/calculate", calculateTransportPublic)
router.post("/calculate-auth", protect, calculateTransportProtected)

export default router;