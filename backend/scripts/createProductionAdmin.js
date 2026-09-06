const bcrypt = require("bcryptjs");
const User = require("../models/User");

// Permanent production admin credentials.
// For a real production system, keep these in Render environment variables.
const ADMIN_NAME = "Placement Portal Administrator";
const ADMIN_EMAIL = "admin@aviportal.com";
const ADMIN_PASSWORD = "Admin@12345";

const createProductionAdmin = async () => {
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
