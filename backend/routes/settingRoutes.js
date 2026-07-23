import express from "express";
import { getSettings, updateSettings } from "../controllers/settingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Any authenticated user can read org settings (e.g. department list for forms);
// only admins can change them.
router.get("/", protect, getSettings);
router.put("/", protect, authorize("admin"), updateSettings);

export default router;
