const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getStudentDashboard } = require("../controllers/studentDashboardController");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("student"),
  getStudentDashboard
);

module.exports = router;
