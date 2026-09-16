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

const setAuthCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/"
  });
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User no longer exists" });
    if (user.isActive === false) return res.status(403).json({ success: false, message: "Your account has been deactivated." });
    return res.json({ success: true, user: publicUser(user) });
  } catch (error) {
    console.error("Get me error:", error);
    return res.status(500).json({ success: false, message: "Unable to load session" });
  }
};

exports.logout = async (req, res) => {
  clearAuthCookie(res);
  return res.json({ success: true, message: "Logged out successfully" });
};

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

    if (typeof password !== "string" || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }
    if (typeof password === "string" && password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Password must be 128 characters or fewer"
      });
    }
    if (typeof password === "string" && !/[A-Z]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one uppercase letter"
      });
    }
    if (typeof password === "string" && !/[0-9]/.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least one number"
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
    setAuthCookie(res, token);

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
      // Use a generic message and check password against a dummy hash below
      // so that both "no user" and "wrong password" responses cost similar
      // work and return the same message, reducing account enumeration.
      const validPassword = await bcrypt.compare(password, "$2a$12$C6UzMDM.H6kTdIQn3Z7b1uZ0o5X9l6n9k0d1a2b3c4d5e6f7g8h9");
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password"
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (user.isActive === false) {
      // Respond with the same generic message as a wrong password so the
      // login endpoint cannot be used to probe account existence or state.
      // (Deactivated accounts are still blocked with a clear 403 by the
      // auth middleware on every subsequent request.)
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const token = generateToken(user);
    setAuthCookie(res, token);

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
