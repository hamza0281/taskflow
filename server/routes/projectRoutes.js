const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  createProject, getProjects, getProject, updateProject, addMember,
  removeMember, getActivity, getStats, deleteProject,
} = require("../controllers/projectController");

const router = express.Router();
router.use(protect);

router.get("/stats", getStats); // must stay above "/:id"
router.route("/").post(createProject).get(getProjects);
router.route("/:id").get(getProject).put(updateProject).delete(deleteProject);
router.get("/:id/activity", getActivity);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

module.exports = router;