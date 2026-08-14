const User = require("../models/User");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");

exports.getStats = async (req, res) => {
  try {
    const [
      students,
      companies,
      jobs,
      applications,
      interviews,
      selected
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "company" }),
      Job.countDocuments(),
      Application.countDocuments(),
      Interview.countDocuments(),
      Application.countDocuments({ status: "selected" })
    ]);

    res.json({
      success: true,
      stats: {
        students,
        companies,
        jobs,
        applications,
        interviews,
        selected
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
