const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  scheduleInterview,
  getMyInterviews
} = require("../controllers/interviewController");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("company"),
  scheduleInterview
);

router.get(
  "/my",
  protect,
  authorize("student", "company"),
  getMyInterviews
);

module.exports = router;
