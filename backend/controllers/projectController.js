import Project from "../models/Project.js";
import Allocation from "../models/Allocation.js";

const UPDATABLE_FIELDS = ["name", "client", "description", "category", "status", "startDate", "endDate"];

const pickUpdatableFields = (body) => {
  const update = {};
  for (const field of UPDATABLE_FIELDS) {
    if (body[field] !== undefined) update[field] = body[field];
  }
  return update;
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      pickUpdatableFields(req.body),
      { new: true, runValidators: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    await Allocation.deleteMany({ project: req.params.id });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjectAllocations = async (req, res) => {
  try {
    const allocations = await Allocation.find({ project: req.params.id }).populate(
      "employee",
      "name email department role"
    );
    res.json(allocations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.create(req.body);
    const populated = await allocation.populate("employee", "name email department role");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteAllocation = async (req, res) => {
  try {
    const allocation = await Allocation.findByIdAndDelete(req.params.id);
    if (!allocation) return res.status(404).json({ message: "Allocation not found" });
    res.json({ message: "Allocation removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
