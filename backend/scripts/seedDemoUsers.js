const dotenv = require("dotenv");
dotenv.config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Profile = require("../models/Profile");
const connectDB = require("../config/db");

const users = [
  { name: "Demo Student", email: "student.demo@aviportal.com", password: "Student@123", role: "student" },
  { name: "Demo Company", email: "company.demo@aviportal.com", password: "Company@123", role: "company" },
  { name: "Demo Admin", email: "admin.demo@aviportal.com", password: "Admin@123", role: "admin" }
];

(async () => {
  try {
    await connectDB();

    for (const demo of users) {
      const password = await bcrypt.hash(demo.password, 12);
      const user = await User.findOneAndUpdate(
        { email: demo.email },
        { name: demo.name, email: demo.email, password, role: demo.role },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      if (demo.role === "student") {
        await Profile.findOneAndUpdate(
          { user: user._id },
          { user: user._id },
          { upsert: true, setDefaultsOnInsert: true }
        );
      }

      console.log(`Demo ${demo.role} ready: ${demo.email}`);
    }
  } catch (error) {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
})();
