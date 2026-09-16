const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const validate = require("../middleware/validationMiddleware");

const {
  createJobValidator
} = require("../validators/jobValidators");

const {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  getMyJobs,
  deleteJob
} = require("../controllers/jobController");

const router =
  express.Router();

router.get(
  "/",
  getJobs
);

// Explicit authenticated student jobs endpoint.
// This avoids accidentally routing student requests through
// company-only authorization middleware.
router.get(
  "/student",
  protect,
  authorize("student"),
  getJobs
);

router.get(
  "/company/my",
  protect,
  authorize("company"),
  getMyJobs
);

router.get(
  "/:id",
  getJobById
);

router.post(
  "/",
  protect,
  authorize("company"),
  createJobValidator,
  validate,
  createJob
);

router.put(
  "/:id",
  protect,
  authorize("company"),
  updateJob
);

router.delete(
  "/:id",
  protect,
  authorize("company"),
  deleteJob
);

module.exports = router;