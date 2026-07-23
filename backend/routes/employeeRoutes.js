import express from "express";
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getMyProfile,
} from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyProfile);
router.get("/", protect, authorize("admin", "HR"), getEmployees);
router.get("/:id", protect, authorize("admin", "HR"), getEmployeeById);
router.post("/", protect, authorize("admin", "HR"), createEmployee);
router.put("/:id", protect, authorize("admin", "HR"), updateEmployee);
router.delete("/:id", protect, authorize("admin"), deleteEmployee);

export default router;
