const Task = require("../models/Task");
const Project = require("../models/Project");
const logActivity = require("../utils/logActivity");

const LABELS = { todo: "To Do", inprogress: "In Progress", done: "Done" };

const isMember = async (projectId, userId) =>
  Project.exists({ _id: projectId, members: userId });

// tell everyone viewing this project's board to refresh
const notify = (req, projectId) => {
  const io = req.app.get("io");
  if (io) io.to(String(projectId)).emit("project:update");
};

const POPULATE = [
  { path: "assignedTo", select: "name email" },
  { path: "comments.user", select: "name" },
];

exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;
    if (!title || !project)
      return res.status(400).json({ message: "Title and project are required" });
    if (!(await isMember(project, req.user._id)))
      return res.status(403).json({ message: "Not a member of this project" });

    const task = await Task.create({
      title, description, status, priority,
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined,
      project,
      createdBy: req.user._id,
    });
    await logActivity(project, req.user._id, `${req.user.name} created "${title}"`);
    notify(req, project);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!(await isMember(projectId, req.user._id)))
      return res.status(403).json({ message: "Not a member of this project" });

    const tasks = await Task.find({ project: projectId })
      .populate(POPULATE)
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await isMember(task.project, req.user._id)))
      return res.status(403).json({ message: "Not allowed" });

    const oldStatus = task.status;
    const fields = ["title", "description", "status", "priority", "dueDate", "assignedTo"];
    fields.forEach((f) => {
      if (req.body[f] === undefined) return;
      const empty = req.body[f] === "" && (f === "assignedTo" || f === "dueDate");
      task[f] = empty ? null : req.body[f];
    });
    await task.save();

    const msg =
      oldStatus !== task.status
        ? `${req.user.name} moved "${task.title}" to ${LABELS[task.status]}`
        : `${req.user.name} updated "${task.title}"`;
    await logActivity(task.project, req.user._id, msg);
    notify(req, task.project);

    await task.populate(POPULATE);
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await isMember(task.project, req.user._id)))
      return res.status(403).json({ message: "Not allowed" });
    if (!req.body.text || !req.body.text.trim())
      return res.status(400).json({ message: "Comment cannot be empty" });

    task.comments.push({ user: req.user._id, text: req.body.text.trim() });
    await task.save();
    await logActivity(task.project, req.user._id, `${req.user.name} commented on "${task.title}"`);
    notify(req, task.project);

    await task.populate(POPULATE);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (!(await isMember(task.project, req.user._id)))
      return res.status(403).json({ message: "Not allowed" });

    await task.deleteOne();
    await logActivity(task.project, req.user._id, `${req.user.name} deleted "${task.title}"`);
    notify(req, task.project);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};