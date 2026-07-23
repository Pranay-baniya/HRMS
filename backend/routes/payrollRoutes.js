import express from "express";
import {
  generatePayroll,
  getAllPayroll,
  getMyPayroll,
  markPaid,
} from "../controllers/payrollController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post("/generate", protect, authorize("admin"), generatePayroll);
router.get("/", protect, authorize("admin"), getAllPayroll);
router.get("/me", protect, getMyPayroll);
router.put("/:id/mark-paid", protect, authorize("admin"), markPaid);

export default router;
