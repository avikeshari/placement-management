const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { getStats } = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/stats",
  protect,
  authorize("admin"),
  getStats
);

module.exports = router;
