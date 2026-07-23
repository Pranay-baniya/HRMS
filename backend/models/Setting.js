import mongoose from "mongoose";

// A single org-wide settings document (singleton). Other modules read defaults
// from here instead of hardcoding. Seeded on first read if absent.
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "org", unique: true },
    companyName: { type: String, default: "Inseed Tech Pvt. Ltd." },
    departments: {
      type: [String],
      default: ["Development", "QA", "Design", "Product", "Sales", "Management"],
    },
    designations: { type: [String], default: [] },
    workDayStartHour: { type: Number, default: 10 }, // late threshold, 24h
    workDayStartMinute: { type: Number, default: 15 },
    leaveEntitlements: {
      type: Map,
      of: Number,
      default: { sick: 12, casual: 12, annual: 18 },
    },
    providentFundRate: { type: Number, default: 0.1 },
    holidays: { type: [String], default: [] }, // YYYY-MM-DD strings
  },
  { timestamps: true }
);

export default mongoose.model("Setting", settingSchema);
