import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" }, // info | leave | allocation | payroll | review
    link: { type: String }, // in-app route, e.g. "/leaves"
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
