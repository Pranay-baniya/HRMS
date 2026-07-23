import Payroll from "../models/Payroll.js";
import Employee from "../models/Employee.js";

export const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, deductions = 0, bonuses = 0 } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    const netPay = employee.baseSalary - deductions + bonuses;

    const payroll = await Payroll.findOneAndUpdate(
      { employee: employeeId, month, year },
      {
        employee: employeeId,
        month,
        year,
        baseSalary: employee.baseSalary,
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
