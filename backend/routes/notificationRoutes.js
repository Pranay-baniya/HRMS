import express from "express";
import {
  getMyNotifications,
  markRead,
  markAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyNotifications);
router.put("/read-all", protect, markAllRead);
router.put("/:id/read", protect, markRead);

export default router;
