import express from "express";
import {
  createReview,
  getMyReviews,
  getAllReviews,
  submitSelfAssessment,
  completeReview,
} from "../controllers/reviewController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyReviews);
router.put("/:id/self", protect, submitSelfAssessment);

router.get("/", protect, authorize("admin", "HR"), getAllReviews);
router.post("/", protect, authorize("admin", "HR"), createReview);
router.put("/:id/complete", protect, authorize("admin", "HR"), completeReview);

export default router;
