import Document from "../models/Document.js";

export const getMyDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ employee: req.employee._id }).sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Manager/HR: list all, optionally filtered by employee.
export const getDocuments = async (req, res) => {
  try {
    const { employee } = req.query;
    const filter = employee ? { employee } : {};
    const docs = await Document.find(filter)
      .populate("employee", "name email department")
      .sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDocument = async (req, res) => {
  try {
    const { employee, name, url, category } = req.body;
    if (!employee || !name || !url) {
      return res.status(400).json({ message: "employee, name and url are required" });
    }
    const doc = await Document.create({
      employee,
      name,
      url,
      category,
      uploadedBy: req.employee._id,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Document not found" });
    res.json({ message: "Document removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
