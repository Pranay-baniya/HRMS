import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";

const todayStr = () => new Date().toISOString().split("T")[0];

const VALID_STATUSES = ["present", "late", "absent", "half_day", "leave"];

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

// Admin/HR: set or adjust a single employee's status for a date (upsert).
export const markAttendance = async (req, res) => {
  try {
    const { employee, date, status, notes } = req.body;
    if (!employee || !date) {
      return res.status(400).json({ message: "employee and date are required" });
    }
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of ${VALID_STATUSES.join(", ")}` });
    }
    const record = await Attendance.findOneAndUpdate(
      { employee, date },
      { $set: { status: status || "present", ...(notes !== undefined ? { notes } : {}) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).populate("employee", "name email department");
    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Admin/HR: for a date, create records for active employees who have none —
// as "leave" if they have an approved leave covering the date, else "absent".
export const markAbsentees = async (req, res) => {
  try {
    const date = req.body.date || todayStr();
    const day = new Date(`${date}T00:00:00`);

    const employees = await Employee.find({ status: "active" }).select("_id");
    const existing = await Attendance.find({ date }).select("employee");
    const marked = new Set(existing.map((r) => String(r.employee)));

    const approvedLeaves = await Leave.find({
      status: "approved",
      startDate: { $lte: day },
      endDate: { $gte: day },
    }).select("employee");
    const onLeave = new Set(approvedLeaves.map((l) => String(l.employee)));

    const toCreate = employees
      .filter((e) => !marked.has(String(e._id)))
      .map((e) => ({
        employee: e._id,
        date,
        status: onLeave.has(String(e._id)) ? "leave" : "absent",
      }));

    if (toCreate.length) await Attendance.insertMany(toCreate, { ordered: false });
    res.json({ date, created: toCreate.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
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
