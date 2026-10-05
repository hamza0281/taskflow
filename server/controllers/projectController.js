const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");
const Activity = require("../models/Activity");
const logActivity = require("../utils/logActivity");

const notify = (req, projectId) => {
  const io = req.app.get("io");
  if (io) io.to(String(projectId)).emit("project:update");
};

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Project name is required" });

    const project = await Project.create({
      name, description, owner: req.user._id, members: [req.user._id],
    });
    await logActivity(project._id, req.user._id, `${req.user.name} created the project`);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id })
      .populate("owner", "name email")
      .populate("members", "name email")
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, members: req.user._id })
      .populate("owner", "name email")
      .populate("members", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Owner can rename project / change description
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the owner can edit" });

    if (req.body.name && req.body.name.trim()) project.name = req.body.name.trim();
    if (req.body.description !== undefined) project.description = req.body.description;
    await project.save();
    notify(req, project._id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the owner can add members" });

    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No user with that email" });
    if (project.members.includes(user._id))
      return res.status(400).json({ message: "Already a member" });

    project.members.push(user._id);
    await project.save();
    await logActivity(project._id, req.user._id, `${req.user.name} added ${user.name} to the project`);
    notify(req, project._id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the owner can remove members" });
    if (req.params.userId === project.owner.toString())
      return res.status(400).json({ message: "Owner cannot be removed" });

    const user = await User.findById(req.params.userId);
    project.members = project.members.filter((m) => m.toString() !== req.params.userId);
    await project.save();
    await Task.updateMany(
      { project: project._id, assignedTo: req.params.userId },
      { $unset: { assignedTo: "" } }
    );
    await logActivity(project._id, req.user._id, `${req.user.name} removed ${user ? user.name : "a member"}`);
    notify(req, project._id);
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const allowed = await Project.exists({ _id: req.params.id, members: req.user._id });
    if (!allowed) return res.status(403).json({ message: "Not a member" });
    const items = await Activity.find({ project: req.params.id })
      .sort({ createdAt: -1 })
      .limit(15);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Dashboard numbers using MongoDB aggregation
exports.getStats = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user._id }).select("_id");
    const ids = projects.map((p) => p._id);

    const [byStatus, byPriority, overdue, myOpenTasks] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: ids } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: ids } } },
        { $group: { _id: "$priority", count: { $sum: 1 } } },
      ]),
      Task.countDocuments({ project: { $in: ids }, status: { $ne: "done" }, dueDate: { $lt: new Date() } }),
      Task.countDocuments({ project: { $in: ids }, assignedTo: req.user._id, status: { $ne: "done" } }),
    ]);

    res.json({ byStatus, byPriority, overdue, myOpenTasks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    if (project.owner.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Only the owner can delete" });

    await Task.deleteMany({ project: project._id });
    await Activity.deleteMany({ project: project._id });
    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};