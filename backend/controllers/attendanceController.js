import Attendance from "../models/Attendance.js";

const todayStr = () => new Date().toISOString().split("T")[0];

export const checkIn = async (req, res) => {
  try {
    const date = todayStr();
    const existing = await Attendance.findOne({ employee: req.employee._id, date });
    if (existing) return res.status(400).json({ message: "Already checked in today" });

    const now = new Date();
    const status = now.getHours() >= 10 && now.getMinutes() > 15 ? "late" : "present";

    const record = await Attendance.create({
      employee: req.employee._id,
      date,
      checkIn: now,
      status,
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const date = todayStr();
    const record = await Attendance.findOne({ employee: req.employee._id, date });
    if (!record) return res.status(400).json({ message: "No check-in found for today" });
    if (record.checkOut) return res.status(400).json({ message: "Already checked out today" });

    record.checkOut = new Date();
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employee: req.employee._id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const { date, employeeId } = req.query;
    const filter = {};
    if (date) filter.date = date;
    if (employeeId) filter.employee = employeeId;

    const records = await Attendance.find(filter)
      .populate("employee", "name email department")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
