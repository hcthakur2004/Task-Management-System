import { Router } from "express";

import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  toggleTaskCompletion,
  updateTask,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);
router.route("/").get(getTasks).post(createTask);
router.patch("/:id/toggle-complete", toggleTaskCompletion);
router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

export default router;
