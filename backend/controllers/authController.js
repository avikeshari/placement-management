const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Profile = require("../models/Profile");
const generateToken = require("../utils/generateToken");

const normalizeEmail = (email) =>
  typeof email === "string" ? email.trim().toLowerCase() : "";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

exports.register = async (req, res) => {
  try {
    const { name, password, role = "student" } = req.body || {};
    const emailAddress = normalizeEmail(req.body?.email);

    if (!name?.trim() || !emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    const existingUser = await User.findOne({ email: emailAddress });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const safeRole = role === "company" ? "company" : "student";

    const user = await User.create({
      name: name.trim(),
      email: emailAddress,
      password: hashedPassword,
      role: safeRole
    });

    if (user.role === "student") {
      await Profile.create({ user: user._id });
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to register account"
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { password } = req.body || {};
    const emailAddress = normalizeEmail(req.body?.email);

    if (!emailAddress || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email: emailAddress }).select("_id name email password role isActive").lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact the administrator."
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to login"
    });
  }
};
