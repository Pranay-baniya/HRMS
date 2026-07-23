import Leave from "../models/Leave.js";

export const requestLeave = async (req, res) => {
  try {
    const leave = await Leave.create({ ...req.body, employee: req.employee._id });
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.employee._id }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const leaves = await Leave.find(filter)
      .populate("employee", "name email department")
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const reviewLeave = async (req, res) => {
  try {
    const { status } = req.body; // approved | rejected
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be approved or rejected" });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.employee._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
