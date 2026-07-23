import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";
import {
  PROVIDENT_FUND_RATE,
  computeTax,
  daysInMonth,
} from "../config/payrollConfig.js";

// Count approved unpaid-leave days that fall within a given month.
const unpaidLeaveDaysInMonth = async (employeeId, month, year) => {
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month - 1, daysInMonth(month, year), 23, 59, 59);

  const leaves = await Leave.find({
    employee: employeeId,
    type: "unpaid",
    status: "approved",
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  });

  let days = 0;
  for (const l of leaves) {
    const from = new Date(Math.max(new Date(l.startDate), monthStart));
    const to = new Date(Math.min(new Date(l.endDate), monthEnd));
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    days += Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;
  }
  return days;
};

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, deductions = 0, bonuses = 0 } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const baseSalary = employee.baseSalary;

    // Unpaid-leave proration: subtract per-day pay for each approved unpaid-leave day.
    const unpaidDays = await unpaidLeaveDaysInMonth(employeeId, month, year);
    const perDay = baseSalary / daysInMonth(month, year);
    const unpaidLeaveDeduction = Math.round(perDay * unpaidDays);

    const grossAfterLeave = baseSalary - unpaidLeaveDeduction + bonuses;
    const providentFund = Math.round(baseSalary * PROVIDENT_FUND_RATE);
    const tax = computeTax(grossAfterLeave);

    const netPay = grossAfterLeave - providentFund - tax - deductions;

    const payroll = await Payroll.findOneAndUpdate(
      { employee: employeeId, month, year },
      {
        employee: employeeId,
        month,
        year,
        baseSalary,
        providentFund,
        tax,
        unpaidLeaveDeduction,
        unpaidLeaveDays: unpaidDays,
        deductions,
        bonuses,
        netPay,
        status: "generated",
        generatedAt: new Date(),
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json(payroll);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getAllPayroll = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);

    const records = await Payroll.find(filter)
      .populate("employee", "name email department")
      .sort({ year: -1, month: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyPayroll = async (req, res) => {
  try {
    const records = await Payroll.find({ employee: req.employee._id }).sort({
      year: -1,
      month: -1,
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: "paid" },
      { new: true }
    );
    if (!payroll) return res.status(404).json({ message: "Payroll record not found" });
    res.json(payroll);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
