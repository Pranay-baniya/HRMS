import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import Leave from "../models/Leave.js";
import Attendance from "../models/Attendance.js";
import Payroll from "../models/Payroll.js";

// Aggregated org metrics for the reports dashboard (read-only).
export const getOverview = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const [
      headcountByDept,
      employmentTypes,
      projectsByStatus,
      leavesByStatus,
      attendanceThisMonth,
      payrollThisMonth,
    ] = await Promise.all([
      Employee.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$department", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Employee.aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$employmentType", count: { $sum: 1 } } },
      ]),
      Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Leave.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Attendance.aggregate([
        { $match: { date: { $regex: `^${year}-${String(month).padStart(2, "0")}` } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Payroll.aggregate([
        { $match: { month, year } },
        {
          $group: {
            _id: null,
            totalNet: { $sum: "$netPay" },
            totalTax: { $sum: "$tax" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const totalHeadcount = await Employee.countDocuments({ status: "active" });

    res.json({
      period: { month, year },
      totalHeadcount,
      headcountByDept,
      employmentTypes,
      projectsByStatus,
      leavesByStatus,
      attendanceThisMonth,
      payrollThisMonth: payrollThisMonth[0] || { totalNet: 0, totalTax: 0, count: 0 },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
