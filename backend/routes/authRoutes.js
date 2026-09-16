const express = require("express");
const { register, login, me, logout } = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const {
  registerValidator,
  loginValidator
} = require("../validators/authValidators");
const validate = require("../middleware/validationMiddleware");

const router = express.Router();

// GET is intentionally supported as a diagnostic response. Authentication
// actions themselves remain POST-only.
router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication API is available",
    endpoints: {
      login: "POST /api/auth/login",
      register: "POST /api/auth/register"
    }
  });
});

router.get("/login", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Login requires POST /api/auth/login"
  });
});

router.get("/register", (req, res) => {
  res.status(405).json({
    success: false,
    message: "Registration requires POST /api/auth/register"
  });
});

router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.get("/me", protect, me);
router.post("/logout", protect, logout);

module.exports = router;
