import Leave from "../models/Leave.js";
import { LEAVE_ENTITLEMENTS, inclusiveDays } from "../config/leaveConfig.js";
import { notify } from "./notificationController.js";

// Sum of days already committed (pending + approved) for a type in a given year,
// optionally excluding one leave document (used when recomputing on approval).
const usedDaysForType = async (employeeId, type, year, excludeId = null) => {
  const filter = {
    employee: employeeId,
    type,
    status: { $in: ["pending", "approved"] },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  const leaves = await Leave.find(filter);
  return leaves
    .filter((l) => new Date(l.startDate).getFullYear() === year)
    .reduce((sum, l) => sum + inclusiveDays(l.startDate, l.endDate), 0);
};

export const requestLeave = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: "Valid start and end dates are required" });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    // Reject overlapping requests that aren't rejected (pending or approved).
    const overlap = await Leave.findOne({
      employee: req.employee._id,
      status: { $in: ["pending", "approved"] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });
    if (overlap) {
      return res
        .status(400)
        .json({ message: "You already have a leave request overlapping these dates" });
    }

    // Balance check for tracked types (unpaid is unlimited).
    const entitlement = LEAVE_ENTITLEMENTS[type];
    if (entitlement !== undefined) {
      const year = start.getFullYear();
      const used = await usedDaysForType(req.employee._id, type, year);
      const requested = inclusiveDays(start, end);
      const remaining = entitlement - used;
      if (requested > remaining) {
        return res.status(400).json({
          message: `Insufficient ${type} balance: ${remaining} day(s) left, ${requested} requested`,
        });
      }
    }

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

// Per-type entitlement / used / remaining for the current calendar year.
export const getMyLeaveBalance = async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const balances = {};
    for (const [type, entitlement] of Object.entries(LEAVE_ENTITLEMENTS)) {
      const used = await usedDaysForType(req.employee._id, type, year);
      balances[type] = { entitlement, used, remaining: entitlement - used };
    }
    res.json({ year, balances });
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

    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    // On approval, re-validate balance (other requests may have been approved since).
    if (status === "approved") {
      const entitlement = LEAVE_ENTITLEMENTS[leave.type];
      if (entitlement !== undefined) {
        const year = new Date(leave.startDate).getFullYear();
        const used = await usedDaysForType(leave.employee, leave.type, year, leave._id);
        const requested = inclusiveDays(leave.startDate, leave.endDate);
        if (used + requested > entitlement) {
          return res.status(400).json({
            message: `Cannot approve: exceeds ${leave.type} balance (${entitlement} days/year)`,
          });
        }
      }
    }

    leave.status = status;
    leave.approvedBy = req.employee._id;
    leave.reviewedAt = new Date();
    await leave.save();

    await notify(leave.employee, `Your ${leave.type} leave was ${status}`, {
      type: "leave",
      link: "/leaves",
    });

    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
