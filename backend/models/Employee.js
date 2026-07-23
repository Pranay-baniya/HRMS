import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    supabaseUserId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "HR", "employee"],
      default: "employee",
    },
    department: {
      type: String,
      enum: ["Development", "QA", "Design", "Product", "Sales", "Management"],
      required: true,
    },
    designation: { type: String, trim: true },
    employmentType: {
      type: String,
      enum: ["full_time", "part_time", "intern", "contract"],
      default: "full_time",
    },
    joiningDate: { type: Date, required: true },
    baseSalary: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    profileImageUrl: { type: String },
    documents: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
