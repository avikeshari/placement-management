const express = require("express");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddleware");

const {
  getMyProfile,
  updateProfile,
  uploadResume,
  deleteResume,
  deleteMyAccount
} = require("../controllers/profileController");

const router =
  express.Router();

/*
 * Student profile
 */
router.get(
  "/me",
  protect,
  authorize("student"),
  getMyProfile
);

router.put(
  "/me",
  protect,
  authorize("student"),
  updateProfile
);

/*
 * Student resume
 */
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

/*
 * Student OR Company account deletion
 */
router.delete(
  "/me",
  protect,
  authorize(
    "student",
    "company"
  ),
  deleteMyAccount
);

module.exports = router;