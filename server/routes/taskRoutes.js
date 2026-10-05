const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createTask, getTasks, updateTask, deleteTask, addComment,
} = require("../controllers/taskController");

const router = express.Router();
router.use(protect);

router.post("/", createTask);
router.get("/project/:projectId", getTasks);
router.post("/:id/comments", addComment);
router.route("/:id").put(updateTask).delete(deleteTask);

module.exports = router;