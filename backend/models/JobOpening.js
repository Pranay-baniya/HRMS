import mongoose from "mongoose";

const jobOpeningSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    department: { type: String },
    description: { type: String },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "intern", "contract"],
      default: "full_time",
    },
    location: { type: String, default: "Kathmandu" },
    status: { type: String, enum: ["open", "on_hold", "closed"], default: "open" },
    openings: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.model("JobOpening", jobOpeningSchema);
