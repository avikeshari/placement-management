const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  scheduleInterview,
  cancelInterview,
  respondToInterview,
  submitFeedback,
  completeInterview,
  getMyInterviews,
  getInterviewAccess
} = require("../controllers/interviewController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("company"),
  scheduleInterview
);

router.patch(
  "/:id/cancel",
  protect,
  authorize("company"),
  cancelInterview
);

router.patch(
  "/:id/feedback", protect, authorize("company"), submitFeedback
);
router.patch(
  "/:id/complete", protect, authorize("company"), completeInterview
);

router.patch(
  "/:id/respond",
  protect,
  authorize("student"),
  respondToInterview
);

router.get(
  "/my",
  protect,
  authorize("student", "company"),
  getMyInterviews
);

router.get(
  "/:id/access",
  protect,
  authorize("student", "company", "admin"),
  getInterviewAccess
);

module.exports = router;
