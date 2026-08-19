const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const csvUpload = require("../middleware/csvUploadMiddleware");
const {
  importAcademicRecords,
  getMyAcademicRecord
} = require("../controllers/academicController");

const router = express.Router();

router.get(
  "/me",
  protect,
  authorize("student"),
  getMyAcademicRecord
);

router.post(
  "/import",
  protect,
  authorize("admin"),
  csvUpload.single("file"),
  importAcademicRecords
);

module.exports = router;
