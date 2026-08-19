const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getMyProfile,
  getStudentProfileForCompany,
  updateProfile,
  uploadResume,
  downloadResume,
  deleteResume,
  deleteMyAccount
} = require("../controllers/profileController");

const router = express.Router();

router.get(
  "/me",
  protect,
  authorize("student", "company"),
  getMyProfile
);

router.get(
  "/student/:userId",
  protect,
  authorize("company", "admin"),
  getStudentProfileForCompany
);

router.put(
  "/me",
  protect,
  authorize("student", "company"),
  updateProfile
);

router.get(
  "/resume",
  protect,
  authorize("student"),
  downloadResume
);

router.post(
  "/resume",
  protect,
  authorize("student"),
  upload.single("resume"),
  uploadResume
);

router.delete(
  "/resume",
  protect,
  authorize("student"),
  deleteResume
);

router.delete(
  "/me",
  protect,
  authorize("student", "company"),
  deleteMyAccount
);

module.exports = router;