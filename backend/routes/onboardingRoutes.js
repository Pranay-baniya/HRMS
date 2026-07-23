import express from "express";
import {
  getOnboardingTasks,
  getMyOnboarding,
  seedChecklist,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/onboardingController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyOnboarding);
router.put("/:id", protect, updateTask); // own-item completion allowed; managers can edit

router.get("/", protect, authorize("admin", "HR"), getOnboardingTasks);
router.post("/", protect, authorize("admin", "HR"), createTask);
router.post("/seed", protect, authorize("admin", "HR"), seedChecklist);
router.delete("/:id", protect, authorize("admin", "HR"), deleteTask);

export default router;
