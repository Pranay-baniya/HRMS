import express from "express";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectAllocations,
  createAllocation,
  deleteAllocation,
} from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getProjects);
router.post("/", protect, authorize("admin", "HR"), createProject);
router.put("/:id", protect, authorize("admin", "HR"), updateProject);
router.delete("/:id", protect, authorize("admin"), deleteProject);

router.get("/:id/allocations", protect, getProjectAllocations);
router.post("/allocations", protect, authorize("admin", "HR"), createAllocation);
router.delete(
  "/allocations/:id",
  protect,
  authorize("admin", "HR"),
  deleteAllocation
);

export default router;
