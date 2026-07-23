import express from "express";
import {
  getMyDocuments,
  getDocuments,
  createDocument,
  deleteDocument,
} from "../controllers/documentController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", protect, getMyDocuments);
router.get("/", protect, authorize("admin", "HR"), getDocuments);
router.post("/", protect, authorize("admin", "HR"), createDocument);
router.delete("/:id", protect, authorize("admin", "HR"), deleteDocument);

export default router;
