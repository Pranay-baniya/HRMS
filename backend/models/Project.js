import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    client: { type: String, trim: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["healthtech", "fintech", "sportstech", "events", "internal_product", "other"],
      default: "other",
    },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed"],
      default: "active",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
