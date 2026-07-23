import express from "express";
import { getTasks, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/", protect, getTasks);
router.post("/", protect, authorize("admin", "HR"), createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, authorize("admin", "HR"), deleteTask);

export default router;
