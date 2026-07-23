import express from "express";
import {
  getJobOpenings,
  createJobOpening,
  updateJobOpening,
  deleteJobOpening,
  getCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/recruitmentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// Recruitment is managed by admin/HR only.
router.get("/jobs", protect, authorize("admin", "HR"), getJobOpenings);
router.post("/jobs", protect, authorize("admin", "HR"), createJobOpening);
router.put("/jobs/:id", protect, authorize("admin", "HR"), updateJobOpening);
router.delete("/jobs/:id", protect, authorize("admin", "HR"), deleteJobOpening);

router.get("/candidates", protect, authorize("admin", "HR"), getCandidates);
router.post("/candidates", protect, authorize("admin", "HR"), createCandidate);
router.put("/candidates/:id", protect, authorize("admin", "HR"), updateCandidate);
router.delete("/candidates/:id", protect, authorize("admin", "HR"), deleteCandidate);

export default router;
