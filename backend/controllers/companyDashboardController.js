const Application = require("../models/Application");
const Interview = require("../models/Interview");
const Job = require("../models/Job");

/**
 * Return all data required by the company dashboard in one authenticated
 * request. This replaces the dashboard's separate jobs + interviews calls
 * while preserving the same information shown to the company.
 */
exports.getCompanyDashboard = async (req, res) => {
  try {
    const now = new Date();

    // Fetch the company's jobs and interview summary in parallel. The
    // application aggregation depends on the returned job ids, so it runs
    // immediately after the jobs query completes.
    const [jobs, interviewCount] = await Promise.all([
      Job.find({ company: req.user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .lean(),
      Interview.countDocuments({ company: req.user._id })
    ]);

    const jobIds = jobs.map((job) => job._id);

    const counts = jobIds.length
      ? await Application.aggregate([
          { $match: { job: { $in: jobIds } } },
          {
            $group: {
              _id: "$job",
              applicants: { $sum: 1 },
              selected: {
                $sum: {
                  $cond: [{ $eq: ["$status", "selected"] }, 1, 0]
                }
              }
            }
          }
        ])
      : [];

    const countMap = new Map(
      counts.map((item) => [String(item._id), item])
    );

    const enrichedJobs = jobs.map((job) => ({
      ...job,
      applicantCount: countMap.get(String(job._id))?.applicants || 0,
      selectedCount: countMap.get(String(job._id))?.selected || 0
    }));

    const upcomingInterviews = await Interview.find({
      company: req.user._id,
      scheduledAt: { $gte: now },
      status: "scheduled"
    })
      .populate("student", "name email")
      .populate({
        path: "application",
        populate: { path: "job", select: "title" }
      })
      .sort({ scheduledAt: 1 })
      .limit(5)
      .lean();

    const applicants = enrichedJobs.reduce(
      (sum, job) => sum + (job.applicantCount || 0),
      0
    );
    const selected = enrichedJobs.reduce(
      (sum, job) => sum + (job.selectedCount || 0),
      0
    );
    const openJobs = enrichedJobs.filter(
      (job) => job.status === "open"
    ).length;

    return res.json({
      success: true,
      dashboard: {
        activeJobs: openJobs,
        applicants,
        interviews: interviewCount,
        selected,
        jobs: enrichedJobs,
        upcomingInterviews
      }
    });
  } catch (error) {
    console.error("Company dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load company dashboard"
    });
  }
};
