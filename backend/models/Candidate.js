import mongoose from "mongoose";

const candidateSchema = new mongoose.Schema(
  {
    jobOpening: { type: mongoose.Schema.Types.ObjectId, ref: "JobOpening", required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String },
    resumeUrl: { type: String },
    stage: {
      type: String,
      enum: ["applied", "screening", "interview", "offer", "hired", "rejected"],
      default: "applied",
    },
    notes: { type: String },
    // Set when stage becomes "hired" and the candidate is converted to an Employee.
    convertedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

export default mongoose.model("Candidate", candidateSchema);
