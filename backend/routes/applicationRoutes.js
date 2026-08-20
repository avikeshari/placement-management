const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication
} = require("../controllers/applicationController");

const router = express.Router();

router.post(
  "/:jobId",
  protect,
  authorize("student"),
  applyForJob
);

router.get(
  "/my",
  protect,
  authorize("student"),
  getMyApplications
);

router.get(
  "/job/:jobId",
  protect,
  authorize("company"),
  getJobApplications
);

router.delete(
  "/:id/withdraw",
  protect,
  authorize("student"),
  withdrawApplication
);

router.patch(
  "/:id/status",
  protect,
  authorize("company"),
  updateApplicationStatus
);

module.exports = router;
