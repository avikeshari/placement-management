const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const {
  getStats,
  getStudents,
  getCompanies,
  getJobs,
  getApplications,
  getInterviews,
  getAnalytics,
  updateUserStatus,
  deleteUser,
  deleteJob,
  getReport
} = require("../controllers/adminController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/students", getStudents);
router.get("/companies", getCompanies);
router.get("/jobs", getJobs);
router.get("/applications", getApplications);
router.get("/interviews", getInterviews);
router.get("/analytics", getAnalytics);

router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.delete("/jobs/:id", deleteJob);

router.get("/reports/:type", getReport);

module.exports = router;
