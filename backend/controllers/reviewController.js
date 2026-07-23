import Review from "../models/Review.js";

// Manager/HR creates a review record (assigns a cycle to an employee).
export const createReview = async (req, res) => {
  try {
    const { employee, cycle, goals } = req.body;
    const review = await Review.create({
      employee,
      cycle,
      goals,
      reviewer: req.employee._id,
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Own reviews (employee self-service).
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ employee: req.employee._id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// All reviews (manager/HR), optional cycle filter.
export const getAllReviews = async (req, res) => {
  try {
    const { cycle } = req.query;
    const filter = cycle ? { cycle } : {};
    const reviews = await Review.find(filter)
      .populate("employee", "name email department")
      .populate("reviewer", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Employee submits their self-assessment for their own review.
export const submitSelfAssessment = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    if (String(review.employee) !== String(req.employee._id)) {
      return res.status(403).json({ message: "Not your review" });
    }
    review.selfAssessment = req.body.selfAssessment ?? review.selfAssessment;
    review.status = "self_submitted";
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Manager/HR completes the review with comments + rating.
export const completeReview = async (req, res) => {
  try {
    const { managerComments, rating } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { managerComments, rating, reviewer: req.employee._id, status: "completed" },
      { new: true, runValidators: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
