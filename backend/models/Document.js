import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    name: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    category: {
      type: String,
      enum: ["contract", "id", "certificate", "payslip", "other"],
      default: "other",
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  },
  { timestamps: true }
);

export default mongoose.model("Document", documentSchema);
