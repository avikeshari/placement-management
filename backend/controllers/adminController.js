const User = require("../models/User");
const Profile = require("../models/Profile");
const Job = require("../models/Job");
const Application = require("../models/Application");
const Interview = require("../models/Interview");
const AcademicRecord = require("../models/AcademicRecord");

const csvEscape = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

const sendCsv = (res, filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${filename}"`
  );
  return res.send(csv);
};

exports.getStats = async (req, res) => {
  try {
    const [
      students,
      companies,
      jobs,
      openJobs,
      applications,
      shortlisted,
      interviews,
      selected,
      rejected,
      placedStudents,
      salaryStats
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "company" }),
      Job.countDocuments(),
      Job.countDocuments({ status: "open" }),
      Application.countDocuments(),
      Application.countDocuments({ status: "shortlisted" }),
      Interview.countDocuments(),
      Application.countDocuments({ status: "selected" }),
      Application.countDocuments({ status: "rejected" }),
      Application.distinct("student", { status: "selected" }),
      Job.aggregate([
        { $match: { salary: { $type: "number", $gt: 0 } } },
        {
          $group: {
            _id: null,
            average: { $avg: "$salary" },
            highest: { $max: "$salary" },
            lowest: { $min: "$salary" }
          }
        }
      ])
    ]);

    const placementRate = students
      ? Number(((placedStudents.length / students) * 100).toFixed(1))
      : 0;

    res.json({
      success: true,
      stats: {
        students,
        companies,
        jobs,
        openJobs,
        applications,
        shortlisted,
        interviews,
        selected,
        rejected,
        placements: placedStudents.length,
        placementRate,
        averageSalary: Math.round(salaryStats[0]?.average || 0),
        highestSalary: salaryStats[0]?.highest || 0,
        lowestSalary: salaryStats[0]?.lowest || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const ids = students.map((student) => student._id);
    const profiles = await Profile.find({ user: { $in: ids } }).lean();
    const profileMap = new Map(profiles.map((profile) => [String(profile.user), profile]));

    const counts = await Application.aggregate([
      { $match: { student: { $in: ids } } },
      { $group: { _id: "$student", applications: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } } } }
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      students: students.map((student) => ({
        ...student,
        profile: profileMap.get(String(student._id)) || null,
        applications: countMap.get(String(student._id))?.applications || 0,
        selected: countMap.get(String(student._id))?.selected || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getCompanies = async (req, res) => {
  try {
    const companies = await User.find({ role: "company" })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    const ids = companies.map((company) => company._id);
    const jobs = await Job.aggregate([
      { $match: { company: { $in: ids } } },
      { $group: { _id: "$company", jobs: { $sum: 1 }, openJobs: { $sum: { $cond: [{ $eq: ["$status", "open"] }, 1, 0] } } } }
    ]);
    const jobMap = new Map(jobs.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      companies: companies.map((company) => ({
        ...company,
        jobs: jobMap.get(String(company._id))?.jobs || 0,
        openJobs: jobMap.get(String(company._id))?.openJobs || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate("company", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const ids = jobs.map((job) => job._id);
    const counts = await Application.aggregate([
      { $match: { job: { $in: ids } } },
      { $group: { _id: "$job", applicants: { $sum: 1 }, selected: { $sum: { $cond: [{ $eq: ["$status", "selected"] }, 1, 0] } } } }
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item]));

    res.json({
      success: true,
      jobs: jobs.map((job) => ({
        ...job,
        applicants: countMap.get(String(job._id))?.applicants || 0,
        selected: countMap.get(String(job._id))?.selected || 0
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("student", "name email")
      .populate("job", "title location salary company")
      .sort({ createdAt: -1 })
      .lean();

    await Application.populate(applications, {
      path: "job.company",
      select: "name email"
    });

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find()
      .populate("student", "name email")
      .populate("company", "name email")
      .populate({
        path: "application",
        populate: { path: "job", select: "title location" }
      })
      .sort({ scheduledAt: 1 });

    res.json({ success: true, interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const [applicationsByMonth, placementsByBranch, placementsByCompany] = await Promise.all([
      Application.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $limit: 12 }
      ]),
      Application.aggregate([
        { $match: { status: "selected" } },
        { $lookup: { from: "profiles", localField: "student", foreignField: "user", as: "profile" } },
        { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
        { $group: { _id: { $ifNull: ["$profile.branch", "Unknown"] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Application.aggregate([
        { $match: { status: "selected" } },
        { $lookup: { from: "jobs", localField: "job", foreignField: "_id", as: "job" } },
        { $unwind: "$job" },
        { $lookup: { from: "users", localField: "job.company", foreignField: "_id", as: "company" } },
        { $unwind: "$company" },
        { $group: { _id: "$company.name", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      analytics: {
        applicationsByMonth: applicationsByMonth.map((item) => ({ month: item._id, count: item.count })),
        placementsByBranch: placementsByBranch.map((item) => ({ branch: item._id, count: item.count })),
        placementsByCompany: placementsByCompany.map((item) => ({ company: item._id, count: item.count }))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["student", "company"] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    user.isActive = Boolean(req.body.isActive);
    await user.save();

    res.json({
      success: true,
      message: user.isActive ? "Account activated" : "Account deactivated",
      user: { _id: user._id, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["student", "company"] }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "student") {
      const applications = await Application.find({ student: user._id }).select("_id");
      const applicationIds = applications.map((item) => item._id);

      await Interview.deleteMany({
        $or: [
          { student: user._id },
          { application: { $in: applicationIds } }
        ]
      });
      await Application.deleteMany({ student: user._id });
      await Profile.deleteOne({ user: user._id });
      await AcademicRecord.deleteMany({ studentEmail: user.email });
    } else {
      const jobs = await Job.find({ company: user._id }).select("_id");
      const jobIds = jobs.map((job) => job._id);
      const applications = await Application.find({ job: { $in: jobIds } }).select("_id");
      const applicationIds = applications.map((item) => item._id);

      await Interview.deleteMany({
        $or: [
          { company: user._id },
          { application: { $in: applicationIds } }
        ]
      });
      await Application.deleteMany({ job: { $in: jobIds } });
      await Job.deleteMany({ company: user._id });
      await Profile.deleteOne({ user: user._id });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const applications = await Application.find({ job: job._id }).select("_id");
    const applicationIds = applications.map((item) => item._id);

    await Interview.deleteMany({
      application: { $in: applicationIds }
    });

    await Application.deleteMany({ job: job._id });
    await Job.deleteOne({ _id: job._id });

    res.json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReport = async (req, res) => {
  try {
    const { type } = req.params;

    if (type === "students") {
      const students = await User.find({ role: "student" }).select("name email isActive createdAt").lean();
      return sendCsv(
        res,
        "students.csv",
        ["Name", "Email", "Status", "Registered"],
        students.map((item) => [item.name, item.email, item.isActive === false ? "Inactive" : "Active", item.createdAt?.toISOString()])
      );
    }

    if (type === "companies") {
      const companies = await User.find({ role: "company" }).select("name email isActive createdAt").lean();
      return sendCsv(
        res,
        "companies.csv",
        ["Company", "Email", "Status", "Registered"],
        companies.map((item) => [item.name, item.email, item.isActive === false ? "Inactive" : "Active", item.createdAt?.toISOString()])
      );
    }

    if (type === "jobs") {
      const jobs = await Job.find().populate("company", "name").lean();
      return sendCsv(
        res,
        "jobs.csv",
        ["Title", "Company", "Location", "Salary", "Minimum CGPA", "Status", "Deadline"],
        jobs.map((item) => [item.title, item.company?.name, item.location, item.salary, item.minimumCGPA, item.status, item.deadline?.toISOString()])
      );
    }

    if (type === "applications") {
      const applications = await Application.find()
        .populate("student", "name email")
        .populate("job", "title")
        .lean();
      return sendCsv(
        res,
        "applications.csv",
        ["Student", "Student Email", "Job", "Status", "Applied On"],
        applications.map((item) => [item.student?.name, item.student?.email, item.job?.title, item.status, item.createdAt?.toISOString()])
      );
    }

    if (type === "placements") {
      const applications = await Application.find({ status: "selected" })
        .populate("student", "name email")
        .populate({ path: "job", select: "title salary", populate: { path: "company", select: "name" } })
        .lean();
      return sendCsv(
        res,
        "placements.csv",
        ["Student", "Student Email", "Company", "Job", "Salary", "Selected On"],
        applications.map((item) => [item.student?.name, item.student?.email, item.job?.company?.name, item.job?.title, item.job?.salary, item.createdAt?.toISOString()])
      );
    }

    return res.status(400).json({ success: false, message: "Unknown report type" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
