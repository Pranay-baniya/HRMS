import Notification from "../models/Notification.js";

// Reusable helper other controllers call to emit a notification.
// Best-effort: never throws into the caller's request flow.
export const notify = async (recipientId, message, { type = "info", link } = {}) => {
  try {
    await Notification.create({ recipient: recipientId, message, type, link });
  } catch (err) {
    console.error("notify failed:", err.message);
  }
};

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.employee._id })
      .sort({ createdAt: -1 })
      .limit(50);
    const unread = await Notification.countDocuments({
      recipient: req.employee._id,
      read: false,
    });
    res.json({ notifications, unread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.employee._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: "Notification not found" });
    res.json(notification);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.employee._id, read: false },
      { read: true }
    );
    res.json({ message: "All marked read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
