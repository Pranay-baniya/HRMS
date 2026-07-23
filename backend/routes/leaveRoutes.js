import express from "express";
import {
  requestLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
} from "../controllers/leaveController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, requestLeave);
router.get("/me", protect, getMyLeaves);
router.get("/", protect, authorize("admin", "HR"), getAllLeaves);
router.put("/:id/review", protect, authorize("admin", "HR"), reviewLeave);

export default router;
