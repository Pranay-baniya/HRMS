import mongoose from "mongoose";

const allocationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    roleOnProject: { type: String, trim: true },
    allocationPercent: { type: Number, min: 0, max: 100, default: 100 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

allocationSchema.index({ employee: 1, project: 1 }, { unique: true });

export default mongoose.model("Allocation", allocationSchema);
