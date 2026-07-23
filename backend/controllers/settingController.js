import Setting from "../models/Setting.js";

const UPDATABLE_FIELDS = [
  "companyName",
  "departments",
  "designations",
  "workDayStartHour",
  "workDayStartMinute",
  "leaveEntitlements",
  "providentFundRate",
  "holidays",
];

// Returns the singleton settings doc, creating it with defaults on first access.
const getOrCreate = async () => {
  let setting = await Setting.findOne({ key: "org" });
  if (!setting) setting = await Setting.create({ key: "org" });
  return setting;
};

export const getSettings = async (req, res) => {
  try {
    const setting = await getOrCreate();
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const update = {};
    for (const field of UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }
    const setting = await Setting.findOneAndUpdate({ key: "org" }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    });
    res.json(setting);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
