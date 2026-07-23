import express from "express";
import {
  checkIn,
  checkOut,
  getMyAttendance,
  getAllAttendance,
  markAttendance,
  markAbsentees,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/check-in", protect, checkIn);
router.post("/check-out", protect, checkOut);
router.get("/me", protect, getMyAttendance);
router.get("/", protect, authorize("admin", "HR"), getAllAttendance);
router.post("/mark", protect, authorize("admin", "HR"), markAttendance);
router.post("/mark-absentees", protect, authorize("admin", "HR"), markAbsentees);

export default router;
