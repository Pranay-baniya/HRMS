import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    cycle: { type: String, required: true }, // e.g. "2026-H1"
    status: {
      type: String,
      enum: ["draft", "self_submitted", "completed"],
      default: "draft",
    },
    goals: { type: String },
    selfAssessment: { type: String },
    managerComments: { type: String },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

reviewSchema.index({ employee: 1, cycle: 1 }, { unique: true });

export default mongoose.model("Review", reviewSchema);
