import OnboardingTask from "../models/OnboardingTask.js";

// Default checklist seeded when starting an employee's onboarding/offboarding.
const TEMPLATES = {
  onboarding: [
    "Sign employment contract",
    "Collect ID & documents",
    "Set up email & accounts",
    "Assign hardware",
    "Intro to team & buddy",
    "First-week orientation",
  ],
  offboarding: [
    "Knowledge handover",
    "Revoke system access",
    "Return hardware",
    "Final settlement",
    "Exit interview",
  ],
};

export const getOnboardingTasks = async (req, res) => {
  try {
    const { employee, category } = req.query;
    const filter = {};
    if (employee) filter.employee = employee;
    if (category) filter.category = category;
    const tasks = await OnboardingTask.find(filter)
      .populate("employee", "name email department")
      .sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyOnboarding = async (req, res) => {
  try {
    const tasks = await OnboardingTask.find({ employee: req.employee._id }).sort({ createdAt: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Seed a full checklist for an employee from a template.
export const seedChecklist = async (req, res) => {
  try {
    const { employee, category = "onboarding" } = req.body;
    if (!employee) return res.status(400).json({ message: "employee is required" });
    const titles = TEMPLATES[category] || [];
    const docs = titles.map((title) => ({ employee, category, title }));
    const created = await OnboardingTask.insertMany(docs);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { employee, title, category, dueDate } = req.body;
    const task = await OnboardingTask.create({ employee, title, category, dueDate });
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Toggle/complete a checklist item. Employees may tick their own items;
// managers may update any.
export const updateTask = async (req, res) => {
  try {
    const task = await OnboardingTask.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const isManager = req.employee.role === "admin" || req.employee.role === "HR";
    if (!isManager && String(task.employee) !== String(req.employee._id)) {
      return res.status(403).json({ message: "Not authorized for this task" });
    }

    if (req.body.completed !== undefined) task.completed = req.body.completed;
    if (isManager && req.body.title !== undefined) task.title = req.body.title;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await OnboardingTask.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
