const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getCompanyDashboard } = require("../controllers/companyDashboardController");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  authorize("company"),
  getCompanyDashboard
);

module.exports = router;
