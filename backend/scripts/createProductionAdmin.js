const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Admin credentials are read from environment variables to avoid
// shipping hardcoded secrets with the source code.
const ADMIN_NAME = "Placement Portal Administrator";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aviportal.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const createProductionAdmin = async () => {
  if (!ADMIN_PASSWORD) {
    console.log("ADMIN_PASSWORD env var is not set — skipping production admin creation.");
    return;
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();

  let admin = await User.findOne({ email });

  if (admin) {
    if (admin.role !== "admin") {
      throw new Error(
        `A non-admin account already exists with ${email}. Choose a different admin email.`
      );
    }

    if (admin.isActive === false) {
      admin.isActive = true;
      await admin.save();
      console.log(`Production admin reactivated: ${email}`);
    } else {
      console.log(`Production admin already exists: ${email}`);
    }

    return;
  }

  const password = await bcrypt.hash(
    ADMIN_PASSWORD,
    12
  );

  await User.create({
    name: ADMIN_NAME,
    email,
    password,
    role: "admin",
    isActive: true
  });

  console.log(
    `Production admin created successfully: ${email}`
  );
};

module.exports = createProductionAdmin;
