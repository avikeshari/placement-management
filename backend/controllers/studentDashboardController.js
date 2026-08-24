const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Job = require("../models/Job");

/**
 * Return the data needed by the student dashboard in one authenticated request.
 *
 * The previous dashboard made three separate API calls after login. Each call
 * repeated JWT/user authentication and opened another database request. This
 * endpoint keeps the same dashboard information while reducing request
 * overhead and avoiding a visible cascade of API calls.
 */
exports.getStudentDashboard = async (req, res) => {
  try {
    const now = new Date();

    const [
      applicationCount,
      shortlistedCount,
      selectedCount,
      interviewCount,
      applications,
      interviews,
      jobsCount
    ] = await Promise.all([
      Application.countDocuments({ student: req.user._id }),
      Application.countDocuments({
        student: req.user._id,
        status: { $in: ["shortlisted", "interview"] }
      }),
      Application.countDocuments({
        student: req.user._id,
        status: "selected"
      }),
      Interview.countDocuments({
        student: req.user._id,
        scheduledAt: { $gt: now },
        status: "scheduled"
      }),
      Application.find({ student: req.user._id })
        .select("status")
        .lean(),
      Interview.find({ student: req.user._id })
        .populate({
          path: "application",
          populate: {
            path: "job",
            select: "title"
          }
        })
        .sort({ scheduledAt: 1 })
        .limit(3)
        .lean(),
      Job.countDocuments({
        status: "open",
        isDeleted: false,
        $or: [
          { deadline: { $exists: false } },
          { deadline: null },
          { deadline: { $gte: now } }
        ]
      })
    ]);

    return res.json({
      success: true,
      dashboard: {
        applications: applicationCount,
        shortlisted: shortlistedCount,
        interviews: interviewCount,
        selected: selectedCount,
        openJobs: jobsCount,
        applicationsData: applications,
        interviewsData: interviews
      }
    });
  } catch (error) {
    console.error("Student dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load student dashboard"
    });
  }
};
