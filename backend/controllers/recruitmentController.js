import JobOpening from "../models/JobOpening.js";
import Candidate from "../models/Candidate.js";

const JOB_FIELDS = [
  "title",
  "department",
  "description",
  "employmentType",
  "location",
  "status",
  "openings",
];
const CANDIDATE_FIELDS = ["jobOpening", "name", "email", "phone", "resumeUrl", "stage", "notes"];

const pick = (body, fields) => {
  const out = {};
  for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
  return out;
};

// ---- Job openings ----
export const getJobOpenings = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const jobs = await JobOpening.find(filter).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.create(pick(req.body, JOB_FIELDS));
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.findByIdAndUpdate(req.params.id, pick(req.body, JOB_FIELDS), {
      new: true,
      runValidators: true,
    });
    if (!job) return res.status(404).json({ message: "Job opening not found" });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteJobOpening = async (req, res) => {
  try {
    const job = await JobOpening.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job opening not found" });
    await Candidate.deleteMany({ jobOpening: req.params.id });
    res.json({ message: "Job opening removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---- Candidates ----
export const getCandidates = async (req, res) => {
  try {
    const { jobOpening, stage } = req.query;
    const filter = {};
    if (jobOpening) filter.jobOpening = jobOpening;
    if (stage) filter.stage = stage;
    const candidates = await Candidate.find(filter)
      .populate("jobOpening", "title department")
      .sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create(pick(req.body, CANDIDATE_FIELDS));
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      pick(req.body, CANDIDATE_FIELDS),
      { new: true, runValidators: true }
    );
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json(candidate);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findByIdAndDelete(req.params.id);
    if (!candidate) return res.status(404).json({ message: "Candidate not found" });
    res.json({ message: "Candidate removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
