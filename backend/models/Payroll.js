import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    baseSalary: { type: Number, required: true },
    providentFund: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    unpaidLeaveDeduction: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 }, // other/manual deductions
    bonuses: { type: Number, default: 0 },
    netPay: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "generated", "paid"],
      default: "draft",
    },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Payroll", payrollSchema);
