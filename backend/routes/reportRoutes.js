import express from "express";
import { getOverview } from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/overview", protect, authorize("admin", "HR"), getOverview);

export default router;
