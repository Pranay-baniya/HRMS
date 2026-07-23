import Task from "../models/Task.js";

const UPDATABLE_FIELDS = ["title", "description", "assignedTo", "status", "priority", "dueDate"];

const pickUpdatableFields = (body) => {
  const update = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) update[field] = body[field];
  }
  return update;
};

export const getTasks = async (req, res) => {
  try {
    const { project, assignedTo, status } = req.query;
    const filter = {};
    if (project) filter.project = project;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .populate("project", "name client")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      pickUpdatableFields(req.body),
      { new: true, runValidators: true }
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
