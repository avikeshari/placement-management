const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const csvUpload = require("../middleware/csvUploadMiddleware");

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
const { verifyCompany } = require("../controllers/benchmarkController");

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/stats", getStats);
router.get("/students", getStudents);
router.get("/companies", getCompanies);
router.patch("/companies/:id/verification", verifyCompany);
router.get("/jobs", getJobs);
router.get("/applications", getApplications);
router.get("/interviews", getInterviews);
router.get("/analytics", getAnalytics);

router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.delete("/jobs/:id", deleteJob);

router.get("/reports/:type", (req,res,next)=>{if(req.params.type==="placement-drives") return require("../controllers/adminController").getDriveReport(req,res); return getReport(req,res);});
router.get("/companies/export", require("../controllers/adminController").exportCompanyDatabase);
router.post("/companies/import", csvUpload.single("file"), require("../controllers/adminController").importCompanyDatabase);

module.exports = router;
