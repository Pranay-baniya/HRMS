import mongoose from "mongoose";

const onboardingTaskSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ["onboarding", "offboarding"], default: "onboarding" },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("OnboardingTask", onboardingTaskSchema);
